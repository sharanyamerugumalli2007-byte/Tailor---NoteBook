const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../src/server');
const { initDatabase } = require('../src/config/database');

let server;
let baseUrl;

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const json = await res.json();
  return { status: res.status, body: json };
}

test.before(async () => {
  await initDatabase();
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}/api`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
});

test('WORKFLOW A: Customer Registration & Authentication', async () => {
  const email = `testuser_${Date.now()}@example.com`;
  const registerRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Ananya Sharma',
      email,
      phone: '+91 9876543210',
      password: 'password123',
      address: '123 MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postal_code: '560001'
    })
  });

  assert.strictEqual(registerRes.status, 201);
  assert.strictEqual(registerRes.body.success, true);
  assert.ok(registerRes.body.token);

  // Login check
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password: 'password123' })
  });

  assert.strictEqual(loginRes.status, 200);
  assert.strictEqual(loginRes.body.user.email, email);
});

test('WORKFLOW B & C & D: Order Creation, Admin Status Transition & UPI Payment Verification', async () => {
  // 1. Register Client
  const clientEmail = `client_${Date.now()}@example.com`;
  const reg = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Kavita Rao',
      email: clientEmail,
      phone: '+91 9900011223',
      password: 'password123'
    })
  });
  const clientToken = reg.body.token;

  // 2. Admin Login
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@tailornotebook.com', password: 'admin123' })
  });
  const adminToken = adminLogin.body.token;

  // 3. Client places Order
  const orderRes = await request('/customer/orders', {
    method: 'POST',
    headers: { Authorization: `Bearer ${clientToken}` },
    body: JSON.stringify({
      garment_type: 'Custom Blouse Stitching',
      quantity: 1,
      fabric_source: 'customer_provided',
      fabric_type: 'Silk',
      color: 'Rose Pink',
      sleeve_style: 'Elbow Length',
      neck_design: 'Sweetheart',
      fit_preference: 'Custom Fit',
      delivery_address: 'Flat 101, Indiranagar',
      delivery_city: 'Bengaluru',
      custom_measurements: { bust: 36, waist: 30, shoulder: 14.5, unit: 'in' }
    })
  });

  assert.strictEqual(orderRes.status, 201);
  const order = orderRes.body.order;
  assert.strictEqual(order.status, 'ORDER_PLACED');
  assert.ok(Number(order.total_amount) > 0);
  assert.ok(Number(order.advance_required) > 0);

  // 4. Client submits UPI Advance Payment Reference
  const utrNum = `UTR${Date.now()}`;
  const payRes = await request(`/customer/orders/${order.id}/payments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${clientToken}` },
    body: JSON.stringify({
      amount: order.advance_required,
      transaction_reference: utrNum,
      payment_method: 'UPI'
    })
  });

  assert.strictEqual(payRes.status, 201);
  const paymentId = payRes.body.paymentId;

  // 5. Admin verifies Payment Reference
  const verifyRes = await request(`/admin/payments/${paymentId}/verify`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ review_notes: 'Verified via HDFC Bank' })
  });

  assert.strictEqual(verifyRes.status, 200);

  // 6. Check Order reflects Verified Status and Confirmed Status
  const checkOrder = await request(`/orders/${order.id}`, {
    headers: { Authorization: `Bearer ${clientToken}` }
  });

  assert.strictEqual(checkOrder.status, 200);
  assert.strictEqual(checkOrder.body.order.status, 'CONFIRMED');
  assert.strictEqual(Number(checkOrder.body.order.advance_paid), Number(order.advance_required));

  // 7. Admin updates status to PROCESSING, then SHIPPED with tracking info
  const statusUpdateRes = await request(`/admin/orders/${order.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'SHIPPED',
      tracking_number: 'AWB-BLR-998822',
      carrier: 'BlueDart Atelier Courier',
      notes: 'Dispatched with keepsake box'
    })
  });

  assert.strictEqual(statusUpdateRes.status, 200);
  assert.strictEqual(statusUpdateRes.body.order.status, 'SHIPPED');
  assert.strictEqual(statusUpdateRes.body.order.tracking_number, 'AWB-BLR-998822');
});

test('WORKFLOW E: Role Access Control & Record Privacy', async () => {
  // Client A
  const regA = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'User A', email: `usera_${Date.now()}@example.com`, password: 'password123' })
  });
  // Client B
  const regB = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'User B', email: `userb_${Date.now()}@example.com`, password: 'password123' })
  });

  // Client A creates an order
  const orderA = await request('/customer/orders', {
    method: 'POST',
    headers: { Authorization: `Bearer ${regA.body.token}` },
    body: JSON.stringify({ garment_type: 'Kurti', delivery_address: 'Address A', delivery_city: 'BLR' })
  });

  // Client B attempts to access Client A's order details
  const unauthorizedOrderView = await request(`/orders/${orderA.body.order.id}`, {
    headers: { Authorization: `Bearer ${regB.body.token}` }
  });

  assert.strictEqual(unauthorizedOrderView.status, 403);

  // Client A attempts to access Admin API
  const unauthorizedAdminAccess = await request('/admin/dashboard', {
    headers: { Authorization: `Bearer ${regA.body.token}` }
  });

  assert.strictEqual(unauthorizedAdminAccess.status, 403);
});

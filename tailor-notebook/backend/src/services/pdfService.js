const PDFDocument = require('pdfkit');
const env = require('../config/env');

const INK = '#1f2a44';
const MUTED = '#667085';
const LINE = '#d0d5dd';

// Standard PDF fonts have no rupee glyph, so amounts are printed as "Rs."
const money = (n) => `Rs. ${Number(n).toFixed(2)}`;
const fmtDate = (d) => (d ? new Date(`${String(d).slice(0, 10)}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-');
const label = (s) => String(s).toLowerCase().replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

function start(res, filename, title) {
  const doc = new PDFDocument({ size: 'A4', margin: 48, info: { Title: title, Author: env.shopName } });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  doc.pipe(res);
  doc.font('Helvetica-Bold').fontSize(20).fillColor(INK).text(env.shopName, { align: 'left' });
  doc.font('Helvetica').fontSize(10).fillColor(MUTED).text(title);
  doc.moveDown(0.5);
  rule(doc);
  return doc;
}

function rule(doc) {
  doc.moveTo(48, doc.y).lineTo(547, doc.y).strokeColor(LINE).lineWidth(1).stroke();
  doc.moveDown(0.8);
}

function pair(doc, k, v, x, y) {
  doc.font('Helvetica').fontSize(9).fillColor(MUTED).text(k, x, y);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(INK).text(v ?? '-', x, y + 12, { width: 230 });
}

function measurementCard(res, customer, m) {
  const doc = start(res, `measurements-${customer.id}-v${m.version}.pdf`, 'Customer measurement card');

  const y = doc.y;
  pair(doc, 'Customer', customer.name, 48, y);
  pair(doc, 'Phone', customer.phone, 300, y);
  pair(doc, 'Measurement date', fmtDate(m.created_at), 48, y + 38);
  pair(doc, 'Version', `v${m.version}${m.is_current ? ' (current)' : ''}`, 300, y + 38);
  pair(doc, 'Unit', m.unit === 'in' ? 'Inches' : 'Centimetres', 48, y + 76);
  doc.y = y + 116;
  rule(doc);

  const rows = [['Shoulder', m.shoulder], ['Chest', m.chest], ['Waist', m.waist], ['Hip', m.hip], ['Neck', m.neck],
    ['Sleeve length', m.sleeve_length], ['Armhole', m.armhole], ['Shirt / kurta length', m.shirt_length],
    ['Pant length', m.pant_length], ['Thigh', m.thigh], ['Knee', m.knee], ['Inseam', m.inseam], ['Outseam', m.outseam]];
  let rowY = doc.y;
  rows.filter(([, v]) => v !== null).forEach(([k, v], i) => {
    if (i % 2 === 0 && i > 0) rowY += 26;
    const x = i % 2 === 0 ? 48 : 300;
    doc.font('Helvetica').fontSize(10).fillColor(MUTED).text(k, x, rowY, { width: 140 });
    doc.font('Helvetica-Bold').fontSize(12).fillColor(INK).text(`${v} ${m.unit}`, x + 140, rowY - 1, { width: 90 });
  });
  doc.y = rowY + 36;

  if (m.other_measurements) { doc.font('Helvetica-Bold').fontSize(10).fillColor(INK).text('Other measurements', 48); doc.font('Helvetica').fillColor(INK).text(m.other_measurements, 48, undefined, { width: 499 }); doc.moveDown(); }
  if (m.notes) { doc.font('Helvetica-Bold').fontSize(10).fillColor(INK).text('Notes', 48); doc.font('Helvetica').fillColor(INK).text(m.notes, 48, undefined, { width: 499 }); }
  doc.end();
}

function orderReceipt(res, o) {
  const doc = start(res, `order-${o.id}.pdf`, `Order receipt #${o.id}`);

  const y = doc.y;
  pair(doc, 'Customer', o.customer_name, 48, y);
  pair(doc, 'Phone', o.customer_phone, 300, y);
  pair(doc, 'Order date', fmtDate(o.order_date), 48, y + 38);
  pair(doc, 'Expected delivery', fmtDate(o.expected_delivery_date), 300, y + 38);
  pair(doc, 'Status', label(o.status), 48, y + 76);
  pair(doc, 'Measurement version', o.measurement_version ? `v${o.measurement_version}` : '-', 300, y + 76);
  doc.y = y + 116;
  rule(doc);

  // Items table
  const col = { item: 48, qty: 320, price: 390, amt: 470 };
  doc.font('Helvetica-Bold').fontSize(9).fillColor(MUTED);
  const hy = doc.y;
  doc.text('Item', col.item, hy).text('Qty', col.qty, hy).text('Price', col.price, hy).text('Amount', col.amt, hy);
  doc.y = hy + 16;
  o.items.forEach((i) => {
    const ry = doc.y;
    doc.font('Helvetica-Bold').fontSize(10).fillColor(INK).text(i.item_type, col.item, ry, { width: 260 });
    let h = doc.y - ry;
    if (i.description || i.special_instructions) {
      doc.font('Helvetica').fontSize(9).fillColor(MUTED)
        .text([i.description, i.special_instructions && `Note: ${i.special_instructions}`].filter(Boolean).join(' - '), col.item, doc.y, { width: 260 });
      h = doc.y - ry;
    }
    doc.font('Helvetica').fontSize(10).fillColor(INK)
      .text(String(i.quantity), col.qty, ry).text(money(i.price), col.price, ry).text(money(i.quantity * i.price), col.amt, ry);
    doc.y = ry + Math.max(h, 14) + 8;
  });
  rule(doc);

  const totals = [['Total', o.total_amount], ['Advance paid', o.advance_amount], ['Balance due', o.remaining_amount]];
  totals.forEach(([k, v], idx) => {
    const ty = doc.y;
    doc.font(idx === 2 ? 'Helvetica-Bold' : 'Helvetica').fontSize(idx === 2 ? 12 : 10).fillColor(INK)
      .text(k, 320, ty).text(money(v), 440, ty, { width: 107, align: 'right' });
    doc.y = ty + 20;
  });
  doc.font('Helvetica').fontSize(9).fillColor(MUTED).text(`Payment status: ${label(o.payment_status)}`, 320, doc.y);
  if (o.notes) { doc.moveDown(2); doc.font('Helvetica-Bold').fontSize(10).fillColor(INK).text('Notes', 48); doc.font('Helvetica').text(o.notes, 48, undefined, { width: 499 }); }
  doc.end();
}

module.exports = { measurementCard, orderReceipt };

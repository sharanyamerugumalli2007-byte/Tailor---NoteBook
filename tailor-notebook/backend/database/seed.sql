-- Development seed data. Password hashes are injected by database/seed.js
INSERT INTO users (name, email, password_hash, role) VALUES
  ('Shop Owner', 'admin@tailor.local', '__ADMIN_HASH__', 'admin'),
  ('Shop Assistant', 'staff@tailor.local', '__STAFF_HASH__', 'staff');

INSERT INTO customers (name, phone, email, address, gender, notes) VALUES
  ('Anusha Reddy',   '9876543210', 'anusha@example.com', 'Chebrolu, Guntur',   'female', 'Prefers fitted blouses'),
  ('Ravi Kumar',     '9876501234', 'ravi@example.com',   'Tenali',             'male',   'Wedding season regular'),
  ('Lakshmi Devi',   '9988776655', NULL,                 'Vijayawada',         'female', NULL),
  ('Suresh Babu',    '9123456780', 'suresh@example.com', 'Guntur',             'male',   'Needs suits for office'),
  ('Priya Sharma',   '9012345678', 'priya@example.com',  'Mangalagiri',        'female', 'Alterations often needed'),
  ('Mohammed Irfan', '9345678901', NULL,                 'Narasaraopet',       'male',   NULL);

INSERT INTO measurements (customer_id, version, unit, shoulder, chest, waist, hip, neck, sleeve_length, armhole, shirt_length, pant_length, thigh, knee, inseam, outseam, notes, is_current, created_at) VALUES
  (1, 1, 'in', 14.0, 34, 28, 36, 13.0, 22, 16, 25, NULL, NULL, NULL, NULL, NULL, 'Initial measurement', FALSE, now() - interval '120 days'),
  (1, 2, 'in', 14.5, 36, 30, 38, 13.5, 22, 16.5, 25, NULL, NULL, NULL, NULL, NULL, 'Updated after weight change', TRUE, now() - interval '30 days'),
  (2, 1, 'in', 17.5, 40, 34, 40, 15.5, 25, 20, 29, 40, 24, 16, 30, 41, NULL, TRUE, now() - interval '60 days'),
  (3, 1, 'in', 14.0, 35, 30, 37, 13.0, 21, 16, 40, NULL, NULL, NULL, 29, 39, 'Kurta + salwar', FALSE, now() - interval '90 days'),
  (3, 2, 'in', 14.0, 36, 31, 38, 13.0, 21, 16, 40, NULL, NULL, NULL, 29, 39, 'Slightly looser fit', TRUE, now() - interval '10 days'),
  (4, 1, 'cm', 46, 102, 88, 100, 40, 63, 52, 74, 102, 60, 40, 78, 104, 'Suit measurements', TRUE, now() - interval '20 days'),
  (5, 1, 'in', 14.0, 33, 27, 36, 12.5, 21, 15.5, 24, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, now() - interval '200 days'),
  (5, 2, 'in', 14.0, 34, 28, 37, 12.5, 21, 15.5, 24, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, now() - interval '100 days'),
  (5, 3, 'in', 14.2, 34, 29, 37, 12.5, 21, 16, 38, NULL, NULL, NULL, NULL, NULL, 'Dress length 38', TRUE, now() - interval '15 days'),
  (6, 1, 'in', 17.0, 38, 32, 38, 15.0, 24.5, 19, 28, 39, 23, 15, 29.5, 40, NULL, TRUE, now() - interval '25 days');

INSERT INTO orders (id, customer_id, measurement_id, order_date, expected_delivery_date, total_amount, advance_amount, remaining_amount, payment_status, status, notes) VALUES
  (1001, 1, 1, CURRENT_DATE - 20, CURRENT_DATE - 12, 2000, 2000,    0, 'PAID',           'DELIVERED',      'Festival outfit'),
  (1002, 1, 2, CURRENT_DATE - 5,  CURRENT_DATE + 4,  1800,  500, 1300, 'PARTIALLY_PAID', 'STITCHING',      NULL),
  (1003, 2, 3, CURRENT_DATE - 9,  CURRENT_DATE + 1,  2300, 1000, 1300, 'PARTIALLY_PAID', 'READY',          NULL),
  (1004, 3, 5, CURRENT_DATE,      CURRENT_DATE + 10, 2100,    0, 2100, 'PENDING',        'ORDER_RECEIVED', 'Fabric supplied by customer'),
  (1005, 4, 6, CURRENT_DATE - 3,  CURRENT_DATE + 7,  6500, 3000, 3500, 'PARTIALLY_PAID', 'CUTTING',        NULL),
  (1006, 5, 9, CURRENT_DATE - 6,  CURRENT_DATE + 2,  2400, 2400,    0, 'PAID',           'TRIAL',          NULL),
  (1007, 6, 10, CURRENT_DATE - 15, CURRENT_DATE - 8,  750,    0,  750, 'PENDING',        'CANCELLED',      'Customer changed mind');
SELECT setval(pg_get_serial_sequence('orders','id'), 1007);

INSERT INTO order_items (order_id, item_type, description, quantity, price, special_instructions) VALUES
  (1001, 'Blouse', 'Silk blouse',          1,  800, 'Deep back neck'),
  (1001, 'Skirt',  'Lehenga skirt',        1, 1200, NULL),
  (1002, 'Saree blouse', 'Cotton blouse',  2,  900, 'Hooks at back'),
  (1003, 'Shirt',  'Formal shirt',         2,  700, 'Full sleeve'),
  (1003, 'Pant',   'Formal trouser',       1,  900, NULL),
  (1004, 'Kurta',  'Cotton kurta',         1, 1500, NULL),
  (1004, 'Salwar', 'Matching salwar',      1,  600, NULL),
  (1005, 'Suit',   'Two-piece suit',       1, 6500, 'Notch lapel'),
  (1006, 'Dress',  'Evening dress',        1, 2400, 'Lined'),
  (1007, 'Shirt',  'Casual shirt',         1,  750, NULL);

INSERT INTO order_status_history (order_id, status, notes, changed_at) VALUES
  (1001, 'ORDER_RECEIVED',  'Order created', now() - interval '20 days'),
  (1001, 'CUTTING',         NULL,            now() - interval '17 days'),
  (1001, 'STITCHING',       NULL,            now() - interval '15 days'),
  (1001, 'READY',           NULL,            now() - interval '13 days'),
  (1001, 'DELIVERED',       NULL,            now() - interval '12 days'),
  (1002, 'ORDER_RECEIVED',  'Order created', now() - interval '5 days'),
  (1002, 'CUTTING',         NULL,            now() - interval '3 days'),
  (1002, 'STITCHING',       NULL,            now() - interval '1 day'),
  (1003, 'ORDER_RECEIVED',  'Order created', now() - interval '9 days'),
  (1003, 'STITCHING',       NULL,            now() - interval '5 days'),
  (1003, 'READY',           NULL,            now() - interval '1 day'),
  (1004, 'ORDER_RECEIVED',  'Order created', now()),
  (1005, 'ORDER_RECEIVED',  'Order created', now() - interval '3 days'),
  (1005, 'CUTTING',         NULL,            now() - interval '1 day'),
  (1006, 'ORDER_RECEIVED',  'Order created', now() - interval '6 days'),
  (1006, 'STITCHING',       NULL,            now() - interval '3 days'),
  (1006, 'TRIAL',           NULL,            now() - interval '1 day'),
  (1007, 'ORDER_RECEIVED',  'Order created', now() - interval '15 days'),
  (1007, 'CANCELLED',       'Customer changed mind', now() - interval '14 days');

INSERT INTO appointments (customer_id, appointment_date, appointment_time, purpose, status, notes) VALUES
  (1, CURRENT_DATE,     '11:00', 'TRIAL',        'SCHEDULED', 'Trial for order #1002'),
  (3, CURRENT_DATE,     '16:00', 'MEASUREMENT',  'SCHEDULED', NULL),
  (2, CURRENT_DATE + 1, '10:30', 'DELIVERY',     'SCHEDULED', 'Order #1003'),
  (5, CURRENT_DATE + 2, '12:00', 'TRIAL',        'SCHEDULED', 'Order #1006'),
  (4, CURRENT_DATE + 5, '15:00', 'CONSULTATION', 'SCHEDULED', NULL),
  (6, CURRENT_DATE - 1, '10:00', 'CONSULTATION', 'COMPLETED', NULL),
  (1, CURRENT_DATE - 3, '14:00', 'ALTERATION',   'CANCELLED', 'Customer unavailable');

INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES
  (1, 'New order created',   'Order #1004 was created for Lakshmi Devi.',             'ORDER_CREATED', FALSE, now()),
  (1, 'Order ready',         'Order #1003 is now ready.',                             'ORDER_READY',   FALSE, now() - interval '1 day'),
  (1, 'Appointment today',   'Appointment with Anusha Reddy is today at 11:00.',      'APPOINTMENT',   FALSE, now() - interval '2 hours'),
  (1, 'Payment pending',     'Order #1005 has Rs. 3500.00 pending.',                  'PAYMENT',       TRUE,  now() - interval '2 days'),
  (2, 'Order ready',         'Order #1003 is now ready.',                             'ORDER_READY',   FALSE, now() - interval '1 day');

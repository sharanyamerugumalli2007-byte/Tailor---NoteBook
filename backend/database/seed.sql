-- ==========================================================
-- Tailor Notebook: MySQL Seed Data
-- ==========================================================

USE `tailor_notebook`;

-- Passwords are hashed for 'admin123' / 'password123'
-- Hash: $2a$10$tZ9vIwhwzW4bKjP74ZzY0e90c88L9P6g/aYwTz4s659695420188. (bcryptjs equivalent)

-- 1. USERS
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `status`) VALUES
(1, 'Master Tailor Vikram (Admin)', 'admin@tailor.com', '+91 9876543210', '$2a$10$gTspZ1vN7O.Z3V28qEwHveG92oO2mB8l6K/f4RkU6Z4f9f4X0pZ02', 'admin', 'active'),
(2, 'Rohit Verma (Order Mgr)', 'ordermanager@tailor.com', '+91 9876543211', '$2a$10$gTspZ1vN7O.Z3V28qEwHveG92oO2mB8l6K/f4RkU6Z4f9f4X0pZ02', 'order_manager', 'active'),
(3, 'Sneha Kapoor (Payment Verifier)', 'verifier@tailor.com', '+91 9876543212', '$2a$10$gTspZ1vN7O.Z3V28qEwHveG92oO2mB8l6K/f4RkU6Z4f9f4X0pZ02', 'payment_verifier', 'active'),
(4, 'Manoj Craftsman (Staff)', 'staff@tailor.com', '+91 9876543213', '$2a$10$gTspZ1vN7O.Z3V28qEwHveG92oO2mB8l6K/f4RkU6Z4f9f4X0pZ02', 'staff', 'active'),
(5, 'Anusha Sharma (Customer)', 'anusha@gmail.com', '+91 9811223344', '$2a$10$gTspZ1vN7O.Z3V28qEwHveG92oO2mB8l6K/f4RkU6Z4f9f4X0pZ02', 'customer', 'active')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 2. CUSTOMERS
INSERT INTO `customers` (`id`, `user_id`, `name`, `phone`, `email`, `address`, `gender`, `notes`) VALUES
(1, 5, 'Anusha Sharma', '+91 9811223344', 'anusha@gmail.com', 'Flat 402, Green Acres Apt, Indiranagar, Bangalore', 'Female', 'Prefers comfort fit around waist, silk and chanderi fabrics.'),
(2, NULL, 'Rajesh Kumar', '+91 9822334455', 'rajesh.k@yahoo.com', '124 5th Cross, Malleshwaram, Bangalore', 'Male', 'Strictly formal 2-piece and 3-piece suits. Stiff collars.'),
(3, NULL, 'Priya Nair', '+91 9833445566', 'priya.nair@outlook.com', '78 Palm Avenue, Koramangala 4th Block, Bangalore', 'Female', 'Bridal blouses, deep back cut, padded finish.'),
(4, NULL, 'Vikram Sethi', '+91 9844556677', 'vikram.sethi@gmail.com', '56 Prestige Towers, MG Road, Bangalore', 'Male', 'Regular customer for pure linen kurtas and formal trousers.'),
(5, NULL, 'Meera Patel', '+91 9855667788', 'meera.p@gmail.com', '19 Orchid Villas, HSR Layout Sector 2, Bangalore', 'Female', 'Anarkali and Indo-western evening gowns.')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 3. MEASUREMENTS (With Versioning)
-- Customer 1 (Anusha) - Version 1 (Older)
INSERT INTO `measurements` (`id`, `customer_id`, `version`, `unit`, `shoulder`, `chest`, `waist`, `hip`, `neck`, `sleeve_length`, `armhole`, `shirt_length`, `pant_length`, `thigh`, `knee`, `inseam`, `outseam`, `other_measurements`, `notes`, `is_current`) VALUES
(1, 1, 1, 'inches', 14.50, 34.00, 28.00, 37.00, 13.50, 16.00, 15.50, 24.00, 38.00, 21.00, 14.00, 28.00, 38.00, 'Bust Point: 9.5, Cross Front: 12.5', 'Initial measurement taken for festival collection 2025.', 0),
-- Customer 1 (Anusha) - Version 2 (Current)
(2, 1, 2, 'inches', 15.00, 35.50, 29.50, 38.50, 14.00, 16.50, 16.00, 25.00, 38.50, 21.50, 14.50, 28.50, 38.50, 'Bust Point: 10.0, Cross Front: 13.0', 'Updated for festive wedding season fit.', 1),
-- Customer 2 (Rajesh Kumar) - Version 1 (Current)
(3, 2, 1, 'inches', 18.50, 42.00, 36.00, 42.00, 16.50, 25.50, 19.00, 30.50, 41.50, 24.00, 17.00, 31.00, 41.50, 'Cuff: 9.5, Bicep: 14.5', 'Standard slim fit corporate suit measurements.', 1),
-- Customer 3 (Priya Nair) - Version 1 (Current)
(4, 3, 1, 'inches', 14.00, 36.00, 30.00, 39.00, 13.50, 11.00, 15.50, 15.00, NULL, NULL, NULL, NULL, NULL, 'Front Neck Depth: 7.0, Back Neck Depth: 9.5', 'Bridal blouse custom measurements.', 1),
-- Customer 4 (Vikram Sethi) - Version 1 (Current)
(5, 4, 1, 'inches', 17.50, 40.00, 34.00, 40.00, 16.00, 24.50, 18.00, 40.00, 40.00, 23.00, 16.00, 30.00, 40.00, 'Kurta Length: 42.0', 'Linen Kurta & Churidar fit.', 1),
-- Customer 5 (Meera Patel) - Version 1 (Current)
(6, 5, 1, 'cm', 38.00, 92.00, 76.00, 102.00, 36.00, 48.00, 42.00, 135.00, 98.00, 56.00, 40.00, 74.00, 98.00, 'Flair: 320cm', 'Anarkali gown in metric units.', 1)
ON DUPLICATE KEY UPDATE `version`=VALUES(`version`);

-- 4. PRODUCTS (Garments & Catalog)
INSERT INTO `products` (`id`, `name`, `category`, `description`, `fabric_details`, `base_price`, `image_url`, `available_sizes`, `is_custom_stitchable`, `stock_quantity`, `is_active`) VALUES
(1, 'Royal Heritage Bandhgala Suit', 'Suits', 'Handcrafted royal bespoke bandhgala with metallic crested buttons and satin piped collars.', 'Super 120s Italian Merino Wool Blend', 8500.00, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800', 'S,M,L,XL,XXL', 1, 25, 1),
(2, 'Classic Silk Embroidered Saree Blouse', 'Blouses', 'Princess cut padded blouse with golden zardozi embroidery and delicate tassel tie-backs.', 'Pure Kanchipuram Raw Silk', 2200.00, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800', 'XS,S,M,L,XL,XXL,3XL', 1, 40, 1),
(3, 'Executive Bespoke 2-Piece Suit', 'Suits', 'Modern slim-cut formal navy blue two-piece lounge suit with notched lapels and pick stitching.', 'Fine English Wool & Cashmere Finish', 9800.00, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800', 'S,M,L,XL,XXL', 1, 20, 1),
(4, 'Imperial Pure Linen Kurta Set', 'Kurtas', 'Lightweight mandarin collar festive kurta with matching tapered churidar trousers.', '100% French Flax Pure Linen', 3400.00, 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800', 'XS,S,M,L,XL,XXL,3XL', 1, 35, 1),
(5, 'Tailored Egyptian Cotton Shirt', 'Shirts', 'Crisp business dress shirt with mother-of-pearl buttons and customizable collar spread.', '100% 2-Ply Giza Egyptian Cotton', 1800.00, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800', 'XS,S,M,L,XL,XXL,3XL', 1, 60, 1),
(6, 'Designer Floor-Length Anarkali Gown', 'Dresses', 'Ethereal pleated gown with hand-sequined bodice and flared georgette silhouette.', 'Pure Georgette with Shantoon Lining', 6200.00, 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800', 'XS,S,M,L,XL,XXL', 1, 18, 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 5. ORDERS
INSERT INTO `orders` (`id`, `order_number`, `customer_id`, `measurement_id`, `order_date`, `expected_delivery_date`, `total_amount`, `advance_amount`, `remaining_amount`, `payment_status`, `status`, `shipment_status`, `tracking_number`, `carrier_name`, `delivery_type`, `shipping_address`, `notes`) VALUES
(1, 'ORD-1001', 1, 2, '2026-10-01', '2026-10-10', 4400.00, 2200.00, 2200.00, 'Partially Paid', 'STITCHING', 'Processing', 'TN-BLR-892101', 'BlueDart Express', 'Courier Delivery', 'Flat 402, Green Acres Apt, Indiranagar, Bangalore', 'Requires urgent trial on Oct 7 before final hemline finish.'),
(2, 'ORD-1002', 2, 3, '2026-10-02', '2026-10-12', 9800.00, 5000.00, 4800.00, 'Partially Paid', 'CUTTING', 'Confirmed', 'TN-BLR-892102', 'Shop Express Courier', 'Store Pickup', NULL, 'Navy blue two-piece suit. Stiff fusible canvas lining.'),
(3, 'ORD-1003', 3, 4, '2026-09-25', '2026-10-04', 3200.00, 3200.00, 0.00, 'Paid', 'READY', 'Confirmed', 'TN-BLR-892095', 'DTDC Prime', 'Store Pickup', NULL, 'Ready for customer pick up. Final steam press complete.'),
(4, 'ORD-1004', 4, 5, '2026-09-20', '2026-09-29', 5200.00, 5200.00, 0.00, 'Paid', 'DELIVERED', 'Delivered', 'TN-BLR-891900', 'SpeedPost India', 'Courier Delivery', '56 Prestige Towers, MG Road, Bangalore', 'Delivered and fitted. Customer delighted with kurta neckline.'),
(5, 'ORD-1005', 1, 2, '2026-10-05', '2026-10-15', 6200.00, 3100.00, 3100.00, 'Verification Pending', 'ORDER_RECEIVED', 'Order Placed', 'TN-BLR-892110', 'Pending Dispatch', 'Courier Delivery', 'Flat 402, Green Acres Apt, Indiranagar, Bangalore', 'Advance paid via UPI QR. Pending verifier approval.')
ON DUPLICATE KEY UPDATE `order_number`=VALUES(`order_number`);

-- 6. ORDER ITEMS
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `item_type`, `description`, `quantity`, `price`, `size`, `special_instructions`) VALUES
(1, 1, 2, 'Blouse', 'Classic Silk Embroidered Saree Blouse - Maroon Silk', 1, 2200.00, 'Custom', 'Deep back neck with latkan cords'),
(2, 1, NULL, 'Lehenga Choli Skirt', 'Gathered Chanderi Flare Skirt with Golden Border', 1, 2200.00, 'Custom', 'Double canvas border with pocket on right side'),
(3, 2, 3, '2-Piece Suit', 'Executive Bespoke 2-Piece Suit - Midnight Navy', 1, 9800.00, 'Custom', 'Double vents on jacket, flat front trousers with side adjusters'),
(4, 3, 2, 'Blouse', 'Bridal Raw Silk Blouse with Zari Border', 1, 2200.00, 'Custom', 'Elbow length sleeves with scalloped cuffs'),
(5, 3, NULL, 'Custom Item', 'Heavy Maggam Handwork Embroidery Charge', 1, 1000.00, 'Custom', 'Peacock motif on back neck'),
(6, 4, 4, 'Kurta', 'Imperial Pure Linen Kurta - Ivory White', 1, 3400.00, 'L', 'Concealed button placket'),
(7, 4, NULL, 'Pant', 'Tailored Linen Trouser - Natural Beige', 1, 1800.00, 'L', 'Elastic waistband back with front drawstring'),
(8, 5, 6, 'Dresses', 'Designer Floor-Length Anarkali Gown - Emerald Green', 1, 6200.00, 'Custom', 'Can-can net skirt lining included')
ON DUPLICATE KEY UPDATE `item_type`=VALUES(`item_type`);

-- 7. ORDER STATUS HISTORY
INSERT INTO `order_status_history` (`id`, `order_id`, `status`, `stage_type`, `notes`, `changed_by_user_id`, `changed_at`) VALUES
(1, 1, 'ORDER_RECEIVED', 'tailor_stage', 'Order placed with initial advance', 1, '2026-10-01 10:30:00'),
(2, 1, 'MEASUREMENT_TAKEN', 'tailor_stage', 'Verified latest measurement v2', 4, '2026-10-01 11:15:00'),
(3, 1, 'CUTTING', 'tailor_stage', 'Fabric patterns cut and prepared', 4, '2026-10-02 14:00:00'),
(4, 1, 'STITCHING', 'tailor_stage', 'Main body assembled, piping attached', 4, '2026-10-03 16:45:00'),
(5, 2, 'ORDER_RECEIVED', 'tailor_stage', 'Order booked with 5k deposit', 2, '2026-10-02 12:00:00'),
(6, 2, 'CUTTING', 'tailor_stage', 'Master tailor drafted suit pattern', 1, '2026-10-03 15:30:00'),
(7, 3, 'ORDER_RECEIVED', 'tailor_stage', 'Bridal blouse booking confirmed', 1, '2026-09-25 11:00:00'),
(8, 3, 'STITCHING', 'tailor_stage', 'Zari embroidery and stitching completed', 4, '2026-09-30 17:00:00'),
(9, 3, 'READY', 'tailor_stage', 'Quality check passed, ironed and bagged', 2, '2026-10-03 12:00:00'),
(10, 4, 'DELIVERED', 'tailor_stage', 'Order handed over to courier', 2, '2026-09-29 18:00:00')
ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);

-- 8. PAYMENTS
INSERT INTO `payments` (`id`, `order_id`, `customer_id`, `amount`, `payment_method`, `reference_utr`, `receipt_url`, `status`, `verified_by_user_id`, `rejection_reason`, `created_at`) VALUES
(1, 1, 1, 2200.00, 'UPI_QR', 'UPI/20261001/98421034', NULL, 'Verified', 3, NULL, '2026-10-01 10:35:00'),
(2, 2, 2, 5000.00, 'UPI_QR', 'UPI/20261002/11294801', NULL, 'Verified', 3, NULL, '2026-10-02 12:05:00'),
(3, 3, 3, 3200.00, 'Cash', 'CASH-REC-089', NULL, 'Verified', 1, NULL, '2026-09-25 11:05:00'),
(4, 4, 4, 5200.00, 'Card', 'POS-TXN-449102', NULL, 'Verified', 1, NULL, '2026-09-20 16:30:00'),
(5, 5, 1, 3100.00, 'UPI_QR', 'UPI/20261005/77889901', NULL, 'Pending Verification', NULL, NULL, '2026-10-05 14:20:00')
ON DUPLICATE KEY UPDATE `amount`=VALUES(`amount`);

-- 9. APPOINTMENTS
INSERT INTO `appointments` (`id`, `customer_id`, `appointment_date`, `appointment_time`, `purpose`, `status`, `notes`) VALUES
(1, 1, '2026-10-07', '11:00:00', 'Trial', 'Scheduled', 'Trial for wedding blouse and skirt fit before final hook stitch.'),
(2, 2, '2026-10-08', '16:30:00', 'Trial', 'Scheduled', 'Jacket basted trial for Rajesh Kumar 2-piece suit.'),
(3, 3, '2026-10-06', '18:00:00', 'Delivery', 'Scheduled', 'Pick-up completed bridal blouse.'),
(4, 4, '2026-10-12', '14:00:00', 'Measurement', 'Scheduled', 'New festival wardrobe measurement session.'),
(5, 5, '2026-10-09', '15:00:00', 'Consultation', 'Scheduled', 'Fabric selection and design sketches for wedding reception.')
ON DUPLICATE KEY UPDATE `purpose`=VALUES(`purpose`);

-- 10. NOTIFICATIONS
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `link`) VALUES
(1, 1, 'New Advance Payment Submitted', 'Customer Anusha Sharma submitted ₹3,100 advance via UPI QR for Order #ORD-1005.', 'payment', 0, '/admin/payments'),
(2, 1, 'Upcoming Trial Appointment', 'Trial scheduled for Anusha Sharma on Oct 7 at 11:00 AM.', 'appointment', 0, '/admin/appointments'),
(3, 1, 'Order Ready for Delivery', 'Order #ORD-1003 (Priya Nair) is marked READY for store pickup.', 'order', 1, '/admin/orders'),
(4, 5, 'Order Status Update', 'Your Order #ORD-1001 is now under STITCHING by Master Craftsman Manoj.', 'order', 0, '/customer/orders/1/track'),
(5, 5, 'Trial Scheduled', 'Your fitting trial appointment is scheduled for Oct 7 at 11:00 AM.', 'appointment', 0, '/customer/appointments')
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- 11. AUDIT LOGS
INSERT INTO `activity_logs` (`id`, `user_id`, `user_name`, `action`, `entity_type`, `entity_id`, `details`, `created_at`) VALUES
(1, 1, 'Master Tailor Vikram (Admin)', 'CREATE_CUSTOMER', 'customer', 1, 'Created customer Anusha Sharma', '2026-10-01 10:00:00'),
(2, 1, 'Master Tailor Vikram (Admin)', 'RECORD_MEASUREMENT', 'measurement', 2, 'Created version 2 measurement for Anusha Sharma', '2026-10-01 10:15:00'),
(3, 2, 'Rohit Verma (Order Mgr)', 'CREATE_ORDER', 'order', 1, 'Created Order ORD-1001 with total ₹4,400', '2026-10-01 10:30:00'),
(4, 3, 'Sneha Kapoor (Payment Verifier)', 'VERIFY_PAYMENT', 'payment', 1, 'Verified UPI advance ₹2,200 for ORD-1001', '2026-10-01 10:40:00'),
(5, 4, 'Manoj Craftsman (Staff)', 'UPDATE_ORDER_STATUS', 'order', 1, 'Updated ORD-1001 status to STITCHING', '2026-10-03 16:45:00')
ON DUPLICATE KEY UPDATE `action`=VALUES(`action`);

const bcrypt = require('bcryptjs');

// Precomputed bcrypt hash for 'admin123' / 'password123'
const DEFAULT_PASSWORD_HASH = '$2a$10$gTspZ1vN7O.Z3V28qEwHveG92oO2mB8l6K/f4RkU6Z4f9f4X0pZ02';

module.exports = {
  users: [
    {
      id: 1,
      name: 'Master Tailor Vikram (Admin)',
      email: 'admin@tailor.com',
      phone: '+91 9876543210',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: 'admin',
      status: 'active',
      created_at: '2026-09-01 10:00:00'
    },
    {
      id: 2,
      name: 'Rohit Verma (Order Mgr)',
      email: 'ordermanager@tailor.com',
      phone: '+91 9876543211',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: 'order_manager',
      status: 'active',
      created_at: '2026-09-05 10:00:00'
    },
    {
      id: 3,
      name: 'Sneha Kapoor (Payment Verifier)',
      email: 'verifier@tailor.com',
      phone: '+91 9876543212',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: 'payment_verifier',
      status: 'active',
      created_at: '2026-09-10 10:00:00'
    },
    {
      id: 4,
      name: 'Manoj Craftsman (Staff)',
      email: 'staff@tailor.com',
      phone: '+91 9876543213',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: 'staff',
      status: 'active',
      created_at: '2026-09-12 10:00:00'
    },
    {
      id: 5,
      name: 'Anusha Sharma (Customer)',
      email: 'anusha@gmail.com',
      phone: '+91 9811223344',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: 'customer',
      status: 'active',
      created_at: '2026-10-01 09:30:00'
    }
  ],

  customers: [
    {
      id: 1,
      user_id: 5,
      name: 'Anusha Sharma',
      phone: '+91 9811223344',
      email: 'anusha@gmail.com',
      address: 'Flat 402, Green Acres Apt, Indiranagar, Bangalore',
      gender: 'Female',
      notes: 'Prefers comfort fit around waist; silk and chanderi fabrics.',
      created_at: '2026-10-01 09:30:00'
    },
    {
      id: 2,
      user_id: null,
      name: 'Rajesh Kumar',
      phone: '+91 9822334455',
      email: 'rajesh.k@yahoo.com',
      address: '124 5th Cross, Malleshwaram, Bangalore',
      gender: 'Male',
      notes: 'Strictly formal 2-piece and 3-piece suits. Stiff collars.',
      created_at: '2026-10-02 11:00:00'
    },
    {
      id: 3,
      user_id: null,
      name: 'Priya Nair',
      phone: '+91 9833445566',
      email: 'priya.nair@outlook.com',
      address: '78 Palm Avenue, Koramangala 4th Block, Bangalore',
      gender: 'Female',
      notes: 'Bridal blouses, deep back cut, padded finish.',
      created_at: '2026-09-25 10:00:00'
    },
    {
      id: 4,
      user_id: null,
      name: 'Vikram Sethi',
      phone: '+91 9844556677',
      email: 'vikram.sethi@gmail.com',
      address: '56 Prestige Towers, MG Road, Bangalore',
      gender: 'Male',
      notes: 'Regular customer for pure linen kurtas and formal trousers.',
      created_at: '2026-09-20 14:00:00'
    },
    {
      id: 5,
      user_id: null,
      name: 'Meera Patel',
      phone: '+91 9855667788',
      email: 'meera.p@gmail.com',
      address: '19 Orchid Villas, HSR Layout Sector 2, Bangalore',
      gender: 'Female',
      notes: 'Anarkali and Indo-western evening gowns.',
      created_at: '2026-09-15 16:00:00'
    }
  ],

  measurements: [
    {
      id: 1,
      customer_id: 1,
      version: 1,
      unit: 'inches',
      shoulder: 14.5,
      chest: 34.0,
      waist: 28.0,
      hip: 37.0,
      neck: 13.5,
      sleeve_length: 16.0,
      armhole: 15.5,
      shirt_length: 24.0,
      pant_length: 38.0,
      thigh: 21.0,
      knee: 14.0,
      inseam: 28.0,
      outseam: 38.0,
      other_measurements: 'Bust Point: 9.5, Cross Front: 12.5',
      notes: 'Initial measurement taken for festival collection 2025.',
      is_current: 0,
      created_at: '2026-01-01 10:00:00'
    },
    {
      id: 2,
      customer_id: 1,
      version: 2,
      unit: 'inches',
      shoulder: 15.0,
      chest: 35.5,
      waist: 29.5,
      hip: 38.5,
      neck: 14.0,
      sleeve_length: 16.5,
      armhole: 16.0,
      shirt_length: 25.0,
      pant_length: 38.5,
      thigh: 21.5,
      knee: 14.5,
      inseam: 28.5,
      outseam: 38.5,
      other_measurements: 'Bust Point: 10.0, Cross Front: 13.0',
      notes: 'Updated for festive wedding season fit.',
      is_current: 1,
      created_at: '2026-10-01 10:15:00'
    },
    {
      id: 3,
      customer_id: 2,
      version: 1,
      unit: 'inches',
      shoulder: 18.5,
      chest: 42.0,
      waist: 36.0,
      hip: 42.0,
      neck: 16.5,
      sleeve_length: 25.5,
      armhole: 19.0,
      shirt_length: 30.5,
      pant_length: 41.5,
      thigh: 24.0,
      knee: 17.0,
      inseam: 31.0,
      outseam: 41.5,
      other_measurements: 'Cuff: 9.5, Bicep: 14.5',
      notes: 'Standard slim fit corporate suit measurements.',
      is_current: 1,
      created_at: '2026-10-02 11:30:00'
    },
    {
      id: 4,
      customer_id: 3,
      version: 1,
      unit: 'inches',
      shoulder: 14.0,
      chest: 36.0,
      waist: 30.0,
      hip: 39.0,
      neck: 13.5,
      sleeve_length: 11.0,
      armhole: 15.5,
      shirt_length: 15.0,
      pant_length: null,
      thigh: null,
      knee: null,
      inseam: null,
      outseam: null,
      other_measurements: 'Front Neck Depth: 7.0, Back Neck Depth: 9.5',
      notes: 'Bridal blouse custom measurements.',
      is_current: 1,
      created_at: '2026-09-25 10:30:00'
    },
    {
      id: 5,
      customer_id: 4,
      version: 1,
      unit: 'inches',
      shoulder: 17.5,
      chest: 40.0,
      waist: 34.0,
      hip: 40.0,
      neck: 16.0,
      sleeve_length: 24.5,
      armhole: 18.0,
      shirt_length: 40.0,
      pant_length: 40.0,
      thigh: 23.0,
      knee: 16.0,
      inseam: 30.0,
      outseam: 40.0,
      other_measurements: 'Kurta Length: 42.0',
      notes: 'Linen Kurta & Churidar fit.',
      is_current: 1,
      created_at: '2026-09-20 14:30:00'
    },
    {
      id: 6,
      customer_id: 5,
      version: 1,
      unit: 'cm',
      shoulder: 38.0,
      chest: 92.0,
      waist: 76.0,
      hip: 102.0,
      neck: 36.0,
      sleeve_length: 48.0,
      armhole: 42.0,
      shirt_length: 135.0,
      pant_length: 98.0,
      thigh: 56.0,
      knee: 40.0,
      inseam: 74.0,
      outseam: 98.0,
      other_measurements: 'Flair: 320cm',
      notes: 'Anarkali gown in metric units.',
      is_current: 1,
      created_at: '2026-09-15 16:30:00'
    }
  ],

  products: [
    {
      id: 1,
      name: 'Royal Heritage Bandhgala Suit',
      category: 'Suits',
      description: 'Handcrafted royal bespoke bandhgala with metallic crested buttons and satin piped collars.',
      fabric_details: 'Super 120s Italian Merino Wool Blend',
      base_price: 8500.0,
      image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
      available_sizes: 'S,M,L,XL,XXL',
      is_custom_stitchable: 1,
      stock_quantity: 25,
      is_active: 1
    },
    {
      id: 2,
      name: 'Classic Silk Embroidered Saree Blouse',
      category: 'Blouses',
      description: 'Princess cut padded blouse with golden zardozi embroidery and delicate tassel tie-backs.',
      fabric_details: 'Pure Kanchipuram Raw Silk',
      base_price: 2200.0,
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
      available_sizes: 'XS,S,M,L,XL,XXL,3XL',
      is_custom_stitchable: 1,
      stock_quantity: 40,
      is_active: 1
    },
    {
      id: 3,
      name: 'Executive Bespoke 2-Piece Suit',
      category: 'Suits',
      description: 'Modern slim-cut formal navy blue two-piece lounge suit with notched lapels and pick stitching.',
      fabric_details: 'Fine English Wool & Cashmere Finish',
      base_price: 9800.0,
      image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
      available_sizes: 'S,M,L,XL,XXL',
      is_custom_stitchable: 1,
      stock_quantity: 20,
      is_active: 1
    },
    {
      id: 4,
      name: 'Imperial Pure Linen Kurta Set',
      category: 'Kurtas',
      description: 'Lightweight mandarin collar festive kurta with matching tapered churidar trousers.',
      fabric_details: '100% French Flax Pure Linen',
      base_price: 3400.0,
      image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800',
      available_sizes: 'XS,S,M,L,XL,XXL,3XL',
      is_custom_stitchable: 1,
      stock_quantity: 35,
      is_active: 1
    },
    {
      id: 5,
      name: 'Tailored Egyptian Cotton Shirt',
      category: 'Shirts',
      description: 'Crisp business dress shirt with mother-of-pearl buttons and customizable collar spread.',
      fabric_details: '100% 2-Ply Giza Egyptian Cotton',
      base_price: 1800.0,
      image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
      available_sizes: 'XS,S,M,L,XL,XXL,3XL',
      is_custom_stitchable: 1,
      stock_quantity: 60,
      is_active: 1
    },
    {
      id: 6,
      name: 'Designer Floor-Length Anarkali Gown',
      category: 'Dresses',
      description: 'Ethereal pleated gown with hand-sequined bodice and flared georgette silhouette.',
      fabric_details: 'Pure Georgette with Shantoon Lining',
      base_price: 6200.0,
      image_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
      available_sizes: 'XS,S,M,L,XL,XXL',
      is_custom_stitchable: 1,
      stock_quantity: 18,
      is_active: 1
    }
  ],

  orders: [
    {
      id: 1,
      order_number: 'ORD-1001',
      customer_id: 1,
      measurement_id: 2,
      order_date: '2026-10-01',
      expected_delivery_date: '2026-10-10',
      total_amount: 4400.0,
      advance_amount: 2200.0,
      remaining_amount: 2200.0,
      payment_status: 'Partially Paid',
      status: 'STITCHING',
      shipment_status: 'Processing',
      tracking_number: 'TN-BLR-892101',
      carrier_name: 'BlueDart Express',
      delivery_type: 'Courier Delivery',
      shipping_address: 'Flat 402, Green Acres Apt, Indiranagar, Bangalore',
      notes: 'Requires urgent trial on Oct 7 before final hemline finish.',
      created_at: '2026-10-01 10:30:00'
    },
    {
      id: 2,
      order_number: 'ORD-1002',
      customer_id: 2,
      measurement_id: 3,
      order_date: '2026-10-02',
      expected_delivery_date: '2026-10-12',
      total_amount: 9800.0,
      advance_amount: 5000.0,
      remaining_amount: 4800.0,
      payment_status: 'Partially Paid',
      status: 'CUTTING',
      shipment_status: 'Confirmed',
      tracking_number: 'TN-BLR-892102',
      carrier_name: 'Shop Express Courier',
      delivery_type: 'Store Pickup',
      shipping_address: null,
      notes: 'Navy blue two-piece suit. Stiff fusible canvas lining.',
      created_at: '2026-10-02 12:00:00'
    },
    {
      id: 3,
      order_number: 'ORD-1003',
      customer_id: 3,
      measurement_id: 4,
      order_date: '2026-09-25',
      expected_delivery_date: '2026-10-04',
      total_amount: 3200.0,
      advance_amount: 3200.0,
      remaining_amount: 0.0,
      payment_status: 'Paid',
      status: 'READY',
      shipment_status: 'Confirmed',
      tracking_number: 'TN-BLR-892095',
      carrier_name: 'DTDC Prime',
      delivery_type: 'Store Pickup',
      shipping_address: null,
      notes: 'Ready for customer pick up. Final steam press complete.',
      created_at: '2026-09-25 11:00:00'
    },
    {
      id: 4,
      order_number: 'ORD-1004',
      customer_id: 4,
      measurement_id: 5,
      order_date: '2026-09-20',
      expected_delivery_date: '2026-09-29',
      total_amount: 5200.0,
      advance_amount: 5200.0,
      remaining_amount: 0.0,
      payment_status: 'Paid',
      status: 'DELIVERED',
      shipment_status: 'Delivered',
      tracking_number: 'TN-BLR-891900',
      carrier_name: 'SpeedPost India',
      delivery_type: 'Courier Delivery',
      shipping_address: '56 Prestige Towers, MG Road, Bangalore',
      notes: 'Delivered and fitted. Customer delighted with kurta neckline.',
      created_at: '2026-09-20 16:30:00'
    },
    {
      id: 5,
      order_number: 'ORD-1005',
      customer_id: 1,
      measurement_id: 2,
      order_date: '2026-10-05',
      expected_delivery_date: '2026-10-15',
      total_amount: 6200.0,
      advance_amount: 3100.0,
      remaining_amount: 3100.0,
      payment_status: 'Verification Pending',
      status: 'ORDER_RECEIVED',
      shipment_status: 'Order Placed',
      tracking_number: 'TN-BLR-892110',
      carrier_name: 'Pending Dispatch',
      delivery_type: 'Courier Delivery',
      shipping_address: 'Flat 402, Green Acres Apt, Indiranagar, Bangalore',
      notes: 'Advance paid via UPI QR. Pending verifier approval.',
      created_at: '2026-10-05 14:20:00'
    }
  ],

  order_items: [
    {
      id: 1,
      order_id: 1,
      product_id: 2,
      item_type: 'Blouse',
      description: 'Classic Silk Embroidered Saree Blouse - Maroon Silk',
      quantity: 1,
      price: 2200.0,
      size: 'Custom',
      special_instructions: 'Deep back neck with latkan cords'
    },
    {
      id: 2,
      order_id: 1,
      product_id: null,
      item_type: 'Lehenga Choli Skirt',
      description: 'Gathered Chanderi Flare Skirt with Golden Border',
      quantity: 1,
      price: 2200.0,
      size: 'Custom',
      special_instructions: 'Double canvas border with pocket on right side'
    },
    {
      id: 3,
      order_id: 2,
      product_id: 3,
      item_type: '2-Piece Suit',
      description: 'Executive Bespoke 2-Piece Suit - Midnight Navy',
      quantity: 1,
      price: 9800.0,
      size: 'Custom',
      special_instructions: 'Double vents on jacket, flat front trousers with side adjusters'
    },
    {
      id: 4,
      order_id: 3,
      product_id: 2,
      item_type: 'Blouse',
      description: 'Bridal Raw Silk Blouse with Zari Border',
      quantity: 1,
      price: 2200.0,
      size: 'Custom',
      special_instructions: 'Elbow length sleeves with scalloped cuffs'
    },
    {
      id: 5,
      order_id: 3,
      product_id: null,
      item_type: 'Custom Item',
      description: 'Heavy Maggam Handwork Embroidery Charge',
      quantity: 1,
      price: 1000.0,
      size: 'Custom',
      special_instructions: 'Peacock motif on back neck'
    },
    {
      id: 6,
      order_id: 4,
      product_id: 4,
      item_type: 'Kurta',
      description: 'Imperial Pure Linen Kurta - Ivory White',
      quantity: 1,
      price: 3400.0,
      size: 'L',
      special_instructions: 'Concealed button placket'
    },
    {
      id: 7,
      order_id: 4,
      product_id: null,
      item_type: 'Pant',
      description: 'Tailored Linen Trouser - Natural Beige',
      quantity: 1,
      price: 1800.0,
      size: 'L',
      special_instructions: 'Elastic waistband back with front drawstring'
    },
    {
      id: 8,
      order_id: 5,
      product_id: 6,
      item_type: 'Dresses',
      description: 'Designer Floor-Length Anarkali Gown - Emerald Green',
      quantity: 1,
      price: 6200.0,
      size: 'Custom',
      special_instructions: 'Can-can net skirt lining included'
    }
  ],

  order_status_history: [
    {
      id: 1,
      order_id: 1,
      status: 'ORDER_RECEIVED',
      stage_type: 'tailor_stage',
      notes: 'Order placed with initial advance',
      changed_by_user_id: 1,
      changed_at: '2026-10-01 10:30:00'
    },
    {
      id: 2,
      order_id: 1,
      status: 'MEASUREMENT_TAKEN',
      stage_type: 'tailor_stage',
      notes: 'Verified latest measurement v2',
      changed_by_user_id: 4,
      changed_at: '2026-10-01 11:15:00'
    },
    {
      id: 3,
      order_id: 1,
      status: 'CUTTING',
      stage_type: 'tailor_stage',
      notes: 'Fabric patterns cut and prepared',
      changed_by_user_id: 4,
      changed_at: '2026-10-02 14:00:00'
    },
    {
      id: 4,
      order_id: 1,
      status: 'STITCHING',
      stage_type: 'tailor_stage',
      notes: 'Main body assembled; piping attached',
      changed_by_user_id: 4,
      changed_at: '2026-10-03 16:45:00'
    },
    {
      id: 5,
      order_id: 2,
      status: 'ORDER_RECEIVED',
      stage_type: 'tailor_stage',
      notes: 'Order booked with 5k deposit',
      changed_by_user_id: 2,
      changed_at: '2026-10-02 12:00:00'
    },
    {
      id: 6,
      order_id: 2,
      status: 'CUTTING',
      stage_type: 'tailor_stage',
      notes: 'Master tailor drafted suit pattern',
      changed_by_user_id: 1,
      changed_at: '2026-10-03 15:30:00'
    },
    {
      id: 7,
      order_id: 3,
      status: 'ORDER_RECEIVED',
      stage_type: 'tailor_stage',
      notes: 'Bridal blouse booking confirmed',
      changed_by_user_id: 1,
      changed_at: '2026-09-25 11:00:00'
    },
    {
      id: 8,
      order_id: 3,
      status: 'STITCHING',
      stage_type: 'tailor_stage',
      notes: 'Zari embroidery and stitching completed',
      changed_by_user_id: 4,
      changed_at: '2026-09-30 17:00:00'
    },
    {
      id: 9,
      order_id: 3,
      status: 'READY',
      stage_type: 'tailor_stage',
      notes: 'Quality check passed, ironed and bagged',
      changed_by_user_id: 2,
      changed_at: '2026-10-03 12:00:00'
    },
    {
      id: 10,
      order_id: 4,
      status: 'DELIVERED',
      stage_type: 'tailor_stage',
      notes: 'Order handed over to courier',
      changed_by_user_id: 2,
      changed_at: '2026-09-29 18:00:00'
    }
  ],

  payments: [
    {
      id: 1,
      order_id: 1,
      customer_id: 1,
      amount: 2200.0,
      payment_method: 'UPI_QR',
      reference_utr: 'UPI/20261001/98421034',
      receipt_url: null,
      status: 'Verified',
      verified_by_user_id: 3,
      rejection_reason: null,
      created_at: '2026-10-01 10:35:00'
    },
    {
      id: 2,
      order_id: 2,
      customer_id: 2,
      amount: 5000.0,
      payment_method: 'UPI_QR',
      reference_utr: 'UPI/20261002/11294801',
      receipt_url: null,
      status: 'Verified',
      verified_by_user_id: 3,
      rejection_reason: null,
      created_at: '2026-10-02 12:05:00'
    },
    {
      id: 3,
      order_id: 3,
      customer_id: 3,
      amount: 3200.0,
      payment_method: 'Cash',
      reference_utr: 'CASH-REC-089',
      receipt_url: null,
      status: 'Verified',
      verified_by_user_id: 1,
      rejection_reason: null,
      created_at: '2026-09-25 11:05:00'
    },
    {
      id: 4,
      order_id: 4,
      customer_id: 4,
      amount: 5200.0,
      payment_method: 'Card',
      reference_utr: 'POS-TXN-449102',
      receipt_url: null,
      status: 'Verified',
      verified_by_user_id: 1,
      rejection_reason: null,
      created_at: '2026-09-20 16:30:00'
    },
    {
      id: 5,
      order_id: 5,
      customer_id: 1,
      amount: 3100.0,
      payment_method: 'UPI_QR',
      reference_utr: 'UPI/20261005/77889901',
      receipt_url: null,
      status: 'Pending Verification',
      verified_by_user_id: null,
      rejection_reason: null,
      created_at: '2026-10-05 14:20:00'
    }
  ],

  appointments: [
    {
      id: 1,
      customer_id: 1,
      appointment_date: '2026-10-07',
      appointment_time: '11:00:00',
      purpose: 'Trial',
      status: 'Scheduled',
      notes: 'Trial for wedding blouse and skirt fit before final hook stitch.',
      created_at: '2026-10-01 10:40:00'
    },
    {
      id: 2,
      customer_id: 2,
      appointment_date: '2026-10-08',
      appointment_time: '16:30:00',
      purpose: 'Trial',
      status: 'Scheduled',
      notes: 'Jacket basted trial for Rajesh Kumar 2-piece suit.',
      created_at: '2026-10-02 12:10:00'
    },
    {
      id: 3,
      customer_id: 3,
      appointment_date: '2026-10-06',
      appointment_time: '18:00:00',
      purpose: 'Delivery',
      status: 'Scheduled',
      notes: 'Pick-up completed bridal blouse.',
      created_at: '2026-09-25 11:15:00'
    },
    {
      id: 4,
      customer_id: 4,
      appointment_date: '2026-10-12',
      appointment_time: '14:00:00',
      purpose: 'Measurement',
      status: 'Scheduled',
      notes: 'New festival wardrobe measurement session.',
      created_at: '2026-09-20 16:45:00'
    },
    {
      id: 5,
      customer_id: 5,
      appointment_date: '2026-10-09',
      appointment_time: '15:00:00',
      purpose: 'Consultation',
      status: 'Scheduled',
      notes: 'Fabric selection and design sketches for wedding reception.',
      created_at: '2026-09-15 16:45:00'
    }
  ],

  notifications: [
    {
      id: 1,
      user_id: 1,
      title: 'New Advance Payment Submitted',
      message: 'Customer Anusha Sharma submitted ₹3,100 advance via UPI QR for Order #ORD-1005.',
      type: 'payment',
      is_read: 0,
      link: '/admin/payments',
      created_at: '2026-10-05 14:25:00'
    },
    {
      id: 2,
      user_id: 1,
      title: 'Upcoming Trial Appointment',
      message: 'Trial scheduled for Anusha Sharma on Oct 7 at 11:00 AM.',
      type: 'appointment',
      is_read: 0,
      link: '/admin/appointments',
      created_at: '2026-10-05 12:00:00'
    },
    {
      id: 3,
      user_id: 1,
      title: 'Order Ready for Delivery',
      message: 'Order #ORD-1003 (Priya Nair) is marked READY for store pickup.',
      type: 'order',
      is_read: 1,
      link: '/admin/orders',
      created_at: '2026-10-03 12:05:00'
    },
    {
      id: 4,
      user_id: 5,
      title: 'Order Status Update',
      message: 'Your Order #ORD-1001 is now under STITCHING by Master Craftsman Manoj.',
      type: 'order',
      is_read: 0,
      link: '/customer/orders/1/track',
      created_at: '2026-10-03 16:45:00'
    },
    {
      id: 5,
      user_id: 5,
      title: 'Trial Scheduled',
      message: 'Your fitting trial appointment is scheduled for Oct 7 at 11:00 AM.',
      type: 'appointment',
      is_read: 0,
      link: '/customer/appointments',
      created_at: '2026-10-01 10:40:00'
    }
  ],

  activity_logs: [
    {
      id: 1,
      user_id: 1,
      user_name: 'Master Tailor Vikram (Admin)',
      action: 'CREATE_CUSTOMER',
      entity_type: 'customer',
      entity_id: 1,
      details: 'Created customer Anusha Sharma',
      created_at: '2026-10-01 10:00:00'
    },
    {
      id: 2,
      user_id: 1,
      user_name: 'Master Tailor Vikram (Admin)',
      action: 'RECORD_MEASUREMENT',
      entity_type: 'measurement',
      entity_id: 2,
      details: 'Created version 2 measurement for Anusha Sharma',
      created_at: '2026-10-01 10:15:00'
    },
    {
      id: 3,
      user_id: 2,
      user_name: 'Rohit Verma (Order Mgr)',
      action: 'CREATE_ORDER',
      entity_type: 'order',
      entity_id: 1,
      details: 'Created Order ORD-1001 with total ₹4,400',
      created_at: '2026-10-01 10:30:00'
    },
    {
      id: 4,
      user_id: 3,
      user_name: 'Sneha Kapoor (Payment Verifier)',
      action: 'VERIFY_PAYMENT',
      entity_type: 'payment',
      entity_id: 1,
      details: 'Verified UPI advance ₹2,200 for ORD-1001',
      created_at: '2026-10-01 10:40:00'
    },
    {
      id: 5,
      user_id: 4,
      user_name: 'Manoj Craftsman (Staff)',
      action: 'UPDATE_ORDER_STATUS',
      entity_type: 'order',
      entity_id: 1,
      details: 'Updated ORD-1001 status to STITCHING',
      created_at: '2026-10-03 16:45:00'
    }
  ]
};

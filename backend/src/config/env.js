require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'tailor_notebook',
  },
  jwtSecret: process.env.JWT_SECRET || 'tailor_notebook_super_secret_jwt_key_2026_modern_tailoring',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  shopName: process.env.SHOP_NAME || 'Tailor Notebook',
  upiId: process.env.UPI_ID || 'tailornotebook@okaxis',
  upiPayeeName: process.env.UPI_PAYEE_NAME || 'Tailor Notebook Studio',
  advancePercentage: Number(process.env.ADVANCE_PERCENTAGE) || 30,
  defaultDeliveryFee: Number(process.env.DEFAULT_DELIVERY_FEE) || 50,
};

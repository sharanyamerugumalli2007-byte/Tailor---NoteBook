const mysql = require('mysql2/promise');

async function testCredentials() {
  const passwords = [
    '', 'root', 'password', 'admin', '1234', '12345', '123456', '12345678', '123456789',
    'saranya', 'Saranya', 'SARANYA', 'saranya123', 'Saranya123', 'Saranya@123', 'saranya@123',
    'SmartConnect123', 'TailorDb2026', 'tailor_notebook', 'tailor', 'root123', 'root@123',
    'mysql', 'system', 'manager', 'oracle', 'sql', '1111', '0000'
  ];

  for (const pw of passwords) {
    try {
      const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: pw,
        port: 3306
      });
      console.log(`>>> SUCCESS! Root password found: "${pw}"`);
      const [rows] = await conn.query('SHOW DATABASES');
      console.log('Databases:', rows.map(r => r.Database));
      await conn.end();
      return pw;
    } catch (e) {
      // ignore
    }
  }
  console.log("No common root password matched.");
}

testCredentials();

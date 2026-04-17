import { db } from './src/lib/db.ts';

async function initDb() {
  console.log('Initializing database ABC...');
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS User (
      id VARCHAR(255) PRIMARY KEY, 
      name VARCHAR(255), 
      email VARCHAR(255) UNIQUE, 
      password VARCHAR(255), 
      address TEXT, 
      role ENUM('ADMIN', 'USER', 'STORE_OWNER') DEFAULT 'USER'
    )`);
    await db.query(`CREATE TABLE IF NOT EXISTS Store (
      id INT AUTO_INCREMENT PRIMARY KEY, 
      name VARCHAR(255), 
      email VARCHAR(255), 
      address TEXT, 
      ownerId VARCHAR(255), 
      FOREIGN KEY (ownerId) REFERENCES User(id)
    )`);
    await db.query(`CREATE TABLE IF NOT EXISTS Rating (
      id INT AUTO_INCREMENT PRIMARY KEY, 
      userId VARCHAR(255), 
      storeId INT, 
      score INT, 
      FOREIGN KEY (userId) REFERENCES User(id), 
      FOREIGN KEY (storeId) REFERENCES Store(id)
    )`);
    console.log('Tables User, Store, Rating created successfully!');

    const [rows]: any = await db.query("SELECT * FROM User WHERE email='admin@storerating.com'");
    if (rows.length === 0) {
      await db.query("INSERT INTO User (id, name, email, password, address, role) VALUES ('admin-1', 'Super Admin', 'admin@storerating.com', 'Admin@123', 'Head Office', 'ADMIN')");
      console.log('Default Admin user created!');
    }
  } catch (err) {
    console.error('Error initializing db:', err);
  }
  process.exit(0);
}

initDb();

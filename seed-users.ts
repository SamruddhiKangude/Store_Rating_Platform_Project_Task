import { db } from './src/lib/db.ts';

async function seed() {
  try {
    const usersToSeed = [
      { id: 'admin-1', name: 'Super Admin', email: 'admin@storerating.com', role: 'ADMIN' },
      { id: 'owner-1', name: 'Store Owner', email: 'owner@storerating.com', role: 'STORE_OWNER' },
      { id: 'user-1', name: 'Normal User', email: 'user@storerating.com', role: 'USER' }
    ];
    for (const u of usersToSeed) {
      const [rows]: any = await db.query('SELECT * FROM User WHERE email=?', [u.email]);
      if (rows.length === 0) {
        await db.query('INSERT INTO User (id, name, email, password, address, role) VALUES (?, ?, ?, ?, ?, ?)', [u.id, u.name, u.email, 'Admin@123', 'Some Address', u.role]);
        console.log('Seeded:', u.email);
      } else {
        console.log('Already exists:', u.email);
      }
    }
  } catch (err) {
    console.error('Error seeding:', err);
  }
  process.exit(0);
}

seed();

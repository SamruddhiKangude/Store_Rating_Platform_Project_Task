import express from 'express';
import { db } from './src/lib/db';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
app.use(express.json());
app.use(cors());

// ---- AUTH ROUTES ----
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users]: any = await db.query('SELECT * FROM User WHERE email = ?', [email]);
    if (users.length === 0 || users[0].password !== password) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ user: users[0] });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, address } = req.body;
  try {
    const [existing]: any = await db.query('SELECT * FROM User WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Email already exists' });

    const id = crypto.randomUUID();
    await db.query(
      'INSERT INTO User (id, name, email, password, address, role) VALUES (?, ?, ?, ?, ?, ?)', 
      [id, name, email, password, address, 'USER']
    );
    res.json({ user: { id, name, email, role: 'USER' }, success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Mock '/api/auth/me' since we don't have JWT implemented yet
app.get('/api/auth/me', (req, res) => {
  res.status(401).json({ error: 'Not authenticated' });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

// ---- ADMIN ROUTES ----
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const [[{c: uCount}]]: any = await db.query('SELECT COUNT(*) as c FROM User');
    const [[{c: sCount}]]: any = await db.query('SELECT COUNT(*) as c FROM Store');
    const [[{c: rCount}]]: any = await db.query('SELECT COUNT(*) as c FROM Rating');
    res.json({ totalUsers: uCount, totalStores: sCount, totalRatings: rCount });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const [users]: any = await db.query('SELECT * FROM User');
    res.json({ users });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/stores', async (req, res) => {
  try {
    const [stores]: any = await db.query('SELECT * FROM Store');
    res.json({ stores });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ---- OWNER ROUTES ----
app.get('/api/owner/dashboard', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    // Get store
    const [stores]: any = await db.query(
      `SELECT s.id, s.name, s.address, AVG(r.score) as averageRating 
       FROM Store s 
       LEFT JOIN Rating r ON s.id = r.storeId 
       WHERE s.ownerId = ? 
       GROUP BY s.id`, 
       [userId]
    );

    if (stores.length === 0) {
      return res.json({ store: null, raters: [] });
    }

    const store = stores[0];
    
    // Get raters
    const [ratersData]: any = await db.query(
      `SELECT r.id as ratingId, r.score as rating, u.id as u_id, u.name as u_name, u.email as u_email, u.address as u_address 
       FROM Rating r 
       JOIN User u ON r.userId = u.id 
       WHERE r.storeId = ?`, 
       [store.id]
    );

    const raters = ratersData.map((row: any) => ({
      ratingId: row.ratingId,
      rating: row.rating,
      user: {
        id: row.u_id,
        name: row.u_name,
        email: row.u_email,
        address: row.u_address
      }
    }));

    res.json({ store, raters });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ---- USER ROUTES ----
app.get('/api/stores', async (req, res) => {
  const userId = req.query.userId;
  const name = req.query.name as string;
  const address = req.query.address as string;
  
  try {
    let query = `
      SELECT s.id, s.name, s.email, s.address, s.ownerId,
             AVG(r.score) as averageRating,
             MAX(CASE WHEN r.userId = ? THEN r.score ELSE NULL END) as submittedRating
      FROM Store s
      LEFT JOIN Rating r ON s.id = r.storeId
      WHERE 1=1
    `;
    const params: any[] = [userId];

    if (name) {
      query += ` AND s.name LIKE ?`;
      params.push(`%${name}%`);
    }
    if (address) {
      query += ` AND s.address LIKE ?`;
      params.push(`%${address}%`);
    }

    query += ` GROUP BY s.id`;
    const [stores]: any = await db.query(query, params);
    
    res.json({ stores });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/ratings', async (req, res) => {
  const { storeId, value, userId } = req.body;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  
  if (value < 1 || value > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });

  try {
    // Check if rating exists
    const [existing]: any = await db.query('SELECT id FROM Rating WHERE userId = ? AND storeId = ?', [userId, storeId]);
    if (existing.length > 0) {
      // Update
      await db.query('UPDATE Rating SET score = ? WHERE id = ?', [value, existing[0].id]);
    } else {
      // Insert
      await db.query('INSERT INTO Rating (userId, storeId, score) VALUES (?, ?, ?)', [userId, storeId, value]);
    }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/users', async (req, res) => {
  const { name, email, password, address, role } = req.body;
  try {
    const id = crypto.randomUUID();
    await db.query(
      'INSERT INTO User (id, name, email, password, address, role) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, email, password, address, role || 'USER']
    );
    res.json({ success: true, user: { id, name, email, role } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/stores', async (req, res) => {
  const { name, email, address, ownerId } = req.body;
  try {
    await db.query(
      'INSERT INTO Store (name, email, address, ownerId) VALUES (?, ?, ?, ?)',
      [name, email, address, ownerId]
    );
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.put('/api/auth/password', async (req, res) => {
  // Mock simplest password update
  res.json({ success: true });
});

app.listen(3001, () => { console.log('Server running on port 3001'); });

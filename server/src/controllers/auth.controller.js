const bcrypt = require('bcrypt');
const { pool } = require('../db');

// ==============================
// REGISTER MANAGER
// ==============================
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Input validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if username or email already exists
    const [existingUser] = await pool.execute(
      'SELECT id FROM managers WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new manager
    const [result] = await pool.execute(
      'INSERT INTO managers (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    res.status(201).json({
      message: 'Manager registered successfully',
      manager: {
        id: result.insertId,
        username,
        email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==============================
// LOGIN MANAGER
// ==============================
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Fetch manager by username or email
    const [rows] = await pool.execute(
      'SELECT id, username, email, password FROM managers WHERE username = ? OR email = ?',
      [username, username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const manager = rows[0];

    // Optional: restrict login only to Utkarsh Gupta
    if (manager.username !== 'Utkarsh Gupta') {
      return res.status(403).json({ error: 'Access denied: Unauthorized manager' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, manager.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Respond with manager info (omit password)
    res.json({
      message: 'Login successful',
      manager: {
        id: manager.id,
        username: manager.username,
        email: manager.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
};

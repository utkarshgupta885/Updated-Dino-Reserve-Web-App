const bcrypt = require('bcrypt');
const { pool } = require('../db');

// Register a new manager
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const [existingUser] = await pool.execute(
      'SELECT id FROM managers WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

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
        email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login manager
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find manager
    const [managers] = await pool.execute(
      'SELECT id, username, email, password FROM managers WHERE username = ? OR email = ?',
      [username, username]
    );

    if (managers.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const manager = managers[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, manager.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return manager info (without password)
    res.json({
      message: 'Login successful',
      manager: {
        id: manager.id,
        username: manager.username,
        email: manager.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login
};

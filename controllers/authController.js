const bcrypt = require('bcrypt');
const { pool } = require('../db');

// User Registration
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, salt) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, salt]
    );

    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// User Login with Session Storage
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Save user data during the session
    req.session.user = {
      userId: user.user_id,
      username: user.username,
      email: user.email,
    };
    console.log('Session user set:', req.session.user);

    // Login Successful
    res.status(200).json({ email: user.email }); // Return email in response
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// User Logout/End Current Session
exports.logout = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const userId = req.session.user.userId;

  try {
    // Retrieve the linked LoL account for the user
    const [accounts] = await pool.query('SELECT * FROM lol_accounts WHERE user_id = ?', [userId]);
    if (accounts.length > 0) {
      const account = accounts[0];

      // Delete match history for the user's linked LoL account
      await pool.query('DELETE FROM match_history WHERE lol_account_id = ?', [account.lol_account_id]);
    }

    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.status(200).json({ message: 'Logged out successfully and match history deleted' });
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Error during logout', error: error.message });
  }
};

// Check Login Status
exports.checkLogin = (req, res) => {
  if (req.session.user) {
    res.json({ email: req.session.user.email }); // Return email if logged in
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
};

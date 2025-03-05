const bcrypt = require('bcrypt');
const { pool } = require('../db');

// User Registration
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if a user with the entered email already exists
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password with a salt
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new user into the database
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
    // Look up the user by email
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];

    // Compare the entered password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Save user data during the session
    req.session.user = {
      userId: user.userId,
      username: user.username,
      email: user.email
    };
    //Login Successful
    res.status(200).json({ message: 'Logged in successfully', userId: user.userId });
  } catch (error) {
    //Login Error
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// User Logout/End Current Session
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    // Clear the session cookie
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out successfully' });
  });
};

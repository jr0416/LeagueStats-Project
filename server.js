require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const authController = require('./controllers/authController');


const app = express();
const port = process.env.PORT || 3000;

// Create a connection to MySQL database
const pool = mysql.createPool({
  host: '127.0.0.1',        // host
  user: 'root',             // MySQL username
  password: 'Redd0408@',    // MySQL password
  database: 'league_app',   // database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection 
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL Database');
    connection.release();
  } catch (error) {
    console.error('Unable to connect to MySQL Database:', error);
    process.exit(1);
  }
}

testConnection();

// Middleware to parse JSON bodies
app.use(express.json());

// Set up session middleware
app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === "production" }
}));

// Test route for seeing if connection to database is working
app.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving users');
  }
});

// Authentication Routes
app.post('/register', authController.register);
app.post('/login', authController.login);
app.post('/logout', authController.logout);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// server.js

const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const WebSocket = require('ws');

const app = express();
const port = 3000;

// Create database and table for users
const db = new sqlite3.Database('users.db');
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT,
        password TEXT
    )`);

    // Insert some test users
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['user1', 'password1']);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['user2', 'password2']);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['user3', 'password3']);
});

// Middleware to parse JSON body
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname)));

// Initialize WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Store connected clients
const clients = new Set();

// Broadcast message to all clients
function broadcastMessage(message) {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Endpoint for user sign-up
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    console.log('Received sign-up request:', username, password);

    // Check if the username already exists
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.error('Error checking existing username:', err.message);
            res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
        } else if (row) {
            console.log('Username already exists:', username);
            res.json({ success: false, message: 'Username already exists. Please choose a different one.' });
        } else {
            // Insert the new user into the database
            db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err) => {
                if (err) {
                    console.error('Error inserting new user:', err.message);
                    res.status(500).json({ success: false, message: 'An error occurred while signing up. Please try again later.' });
                } else {
                    console.log('New user signed up:', username);
                    res.json({ success: true, message: 'Sign-up successful' });
                }
            });
        }
    });
});

// Endpoint for user login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Received login request:', username, password);

    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            console.error('Error querying user:', err.message);
            res.status(500).json({ success: false, message: 'An error occurred. Please try again later.' });
        } else if (row) {
            console.log('User logged in:', username);
            res.json({ success: true, message: 'Login successful', username: row.username });
        } else {
            console.log('Invalid username or password:', username);
            res.json({ success: false, message: 'Invalid username or password' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// WebSocket connection handling
wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('New client connected');

    // Handle incoming messages from clients
    ws.on('message', (message) => {
        // Broadcast the received message to all clients
        broadcastMessage(message.toString()); // Convert to string before broadcasting
    });

    // Handle client disconnection
    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });
});

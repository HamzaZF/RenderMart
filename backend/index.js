import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
// import bcrypt from 'bcrypt';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;


// Load environment variables
dotenv.config();

const app = express();
const PORT = 3300;

// Security middleware
app.use(helmet());

// Enable CORS for frontend requests
app.use(cors({
    //origin: "http://localhost:5173",
    origin: "frontend-service.rendermart.svc.cluster.local",
    credentials: true,
}));

// Middleware to parse JSON requests
app.use(express.json());

// -------------------------------------------
// Database Connection (PostgreSQL)
// -------------------------------------------
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432, // Default PostgreSQL port
});

// Test database connection
pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('PostgreSQL connection error:', err));

// -------------------------------------------
// Database Initialization
// -------------------------------------------
const initializeDatabase = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                balance REAL NOT NULL DEFAULT 500
            );
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS wallet (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                image_url TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('listed', 'withdrawn')),
                price TEXT NOT NULL DEFAULT '0',
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                image_url TEXT NOT NULL,
                price REAL NOT NULL,
                buyer_name TEXT NOT NULL,
                date_sold TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log('Database tables initialized successfully');
    } catch (error) {
        console.error('Error initializing database tables:', error);
    }
};

// Run database initialization on startup
initializeDatabase();

// -------------------------------------------
// Session and Authentication Configuration
// -------------------------------------------
app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultSecretKey',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// -------------------------------------------
// Authentication Strategy with Passport.js
// -------------------------------------------
passport.use(new LocalStrategy({ usernameField: 'email' },
    async (email, password, done) => {
        try {
            // Retrieve user from the database
            const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = rows[0];
            if (!user) return done(null, false, { message: 'User not found' });

            // Verify password
            // const isMatch = await bcrypt.compare(password, user.password);
            const isMatch = bcrypt.compareSync(password, user.password);
            if (!isMatch) return done(null, false, { message: 'Incorrect password' });

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

// Serialize and deserialize user sessions
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        done(null, rows[0]);
    } catch (error) {
        done(error);
    }
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: 'Authentication required' });
};

// -------------------------------------------
// User Authentication Routes
// -------------------------------------------
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        // const hashedPassword = await bcrypt.hash(password, 10);
        const hashedPassword = bcrypt.hashSync(password, 10);
        await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashedPassword]);
        res.json({ message: 'User successfully registered' });
    } catch (error) {
        res.status(500).json({ message: 'Registration error', error: error.message });
    }
});

app.post('/api/login', passport.authenticate('local', { failureMessage: true }), (req, res) => {
    res.json({ message: 'Login successful' });
});

app.get('/api/check-auth', (req, res) => {
    if (req.isAuthenticated()) return res.json({ user: req.user });
    res.status(401).json({ message: 'Not authenticated' });
});

app.post('/api/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ message: 'Logout error' });
        res.json({ message: 'Logout successful' });
    });
});

// -------------------------------------------
// Wallet Routes
// -------------------------------------------
app.get('/api/wallet', isAuthenticated, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM wallet WHERE user_id = $1', [req.user.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving wallet data', error: error.message });
    }
});

app.post('/api/wallet', isAuthenticated, async (req, res) => {
    const { image_url, status } = req.body;
    try {
        await pool.query('INSERT INTO wallet (user_id, image_url, status) VALUES ($1, $2, $3)', [req.user.id, image_url, status || 'withdrawn']);
        res.json({ message: 'Image added to wallet' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding image', error: error.message });
    }
});

// -------------------------------------------
// Marketplace Routes
// -------------------------------------------
app.get('/api/marketplace', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT wallet.id, wallet.image_url, wallet.price, wallet.status, users.email AS owner_email
            FROM wallet
            INNER JOIN users ON wallet.user_id = users.id
            WHERE wallet.status = 'listed'
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving marketplace items', error: error.message });
    }
});

app.post('/api/marketplace/buy', isAuthenticated, async (req, res) => {
    const { image_id } = req.body;
    try {
        const { rows: [card] } = await pool.query('SELECT * FROM wallet WHERE id = $1 AND status = $2', [image_id, 'listed']);
        if (!card) return res.status(400).json({ message: 'Item not available or already sold' });

        if (card.user_id === req.user.id) return res.status(403).json({ message: 'Cannot purchase your own item' });

        await pool.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [card.price, req.user.id]);
        await pool.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [card.price, card.user_id]);
        await pool.query('UPDATE wallet SET user_id = $1, status = $2 WHERE id = $3', [req.user.id, 'withdrawn', image_id]);
        res.json({ message: 'Purchase successful' });
    } catch (error) {
        res.status(500).json({ message: 'Purchase error', error: error.message });
    }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://backend-service.rendermart.svc.cluster.local:${PORT}`));

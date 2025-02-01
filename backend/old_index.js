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
import { createClient } from "redis";
import connectRedis from "connect-redis";
// const RedisStore = (await import("connect-redis")).default;


// Load environment variables
dotenv.config();

const app = express();
const PORT = 3300;

// Security middleware
app.use(helmet());

// Enable CORS for frontend requests
// app.use(cors({
//     //origin: "http://localhost:5173",
//     origin: process.env.CORS_ORIGIN, //"frontend-service.rendermart.svc.cluster.local",
//     credentials: true,
// }));

app.use(cors({
    origin: "http://192.168.227.128",
    credentials: true
}));

// Middleware to parse JSON requests
app.use(express.json());

// -------------------------------------------
// Database Connection (PostgreSQL)
// -------------------------------------------
const pool = new Pool({
    user: process.env.POSTGRES_USER,//process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.POSTGRES_PASSWORD,//process.env.DB_PASSWORD,
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

// const RedisStore = connectRedis(session);
const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST || "my-redis-master",
        port: 6379,
    },
    password: process.env.REDIS_PASSWORD, // Utiliser le mot de passe
});

//await redisClient.connect();

redisClient.on("error", (err) => console.error("🔥 Redis Error:", err));

try {
    await redisClient.connect();
    console.log("✅ Redis connecté avec succès !");
} catch (error) {
    console.error("❌ Erreur de connexion Redis :", error);
}


// const RedisStore = connectRedis(session);

// Création du Store Redis pour les sessions
// const redisStore = new RedisStore({
//     client: redisClient,
//     prefix: "sess:", // Préfixe pour éviter les collisions de clés
// });

const RedisStore = new connectRedis({
    client: redisClient,
    prefix: "sess:", // Préfixe pour éviter les collisions de clés
});


// -------------------------------------------
// Session and Authentication Configuration
// -------------------------------------------
// Configuration de la session
// app.use(
//     session({
//         store: redisStore,
//         secret: process.env.SESSION_SECRET || "defaultSecretKey",
//         resave: false,
//         saveUninitialized: false,
//         cookie: {
//             secure: false, // Passe à `true` si HTTPS en prod
//             httpOnly: true,
//             sameSite: "lax",
//         },
//     })
// );

app.use(
    session({
        store: RedisStore,
        secret: process.env.SESSION_SECRET || "defaultSecretKey",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production", // Active HTTPS si en prod
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24, // 1 jour
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());

// -------------------------------------------
// Authentication Strategy with Passport.js
// -------------------------------------------
// passport.use(new LocalStrategy({ usernameField: 'email' },
//     async (email, password, done) => {
//         try {
//             // Retrieve user from the database
//             const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
//             const user = rows[0];
//             if (!user) return done(null, false, { message: 'User not found' });

//             // Verify password
//             // const isMatch = await bcrypt.compare(password, user.password);
//             const isMatch = bcrypt.compareSync(password, user.password);
//             if (!isMatch) return done(null, false, { message: 'Incorrect password' });

//             return done(null, user);
//         } catch (error) {
//             return done(error);
//         }
//     }
// ));

passport.use(new LocalStrategy({ usernameField: 'email' },
    async (email, password, done) => {
        try {
            console.log("🔍 Checking user:", email);
            const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = rows[0];
            if (!user) {
                console.log("❌ User not found:", email);
                return done(null, false, { message: 'User not found' });
            }

            console.log("✅ User found:", user);

            const isMatch = bcrypt.compareSync(password, user.password);
            if (!isMatch) {
                console.log("❌ Incorrect password for:", email);
                return done(null, false, { message: 'Incorrect password' });
            }

            return done(null, user);
        } catch (error) {
            console.error("🔥 Database Error:", error);
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
        res.status(500).json({ message: `Registration error: ${error.message}`, error: error.message });
    }
});

// app.post('/api/login', passport.authenticate('local', { failureMessage: true }), (req, res) => {
//     res.json({ message: 'Login successful' });
// });

app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error("🔥 Login Error:", err);
            return res.status(500).json({ message: "Authentication failed", error: err.message });
        }
        if (!user) {
            return res.status(401).json({ message: info.message || "Invalid credentials" });
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error("🔥 Session Error:", err);
                return res.status(500).json({ message: "Session error", error: err.message });
            }
            res.json({ message: "Login successful", user });
        });
    })(req, res, next);
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

app.use((err, req, res, next) => {
    console.error("🔥 ERROR:", err.stack); // Log complet de l'erreur
    res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://backend-service.rendermart.svc.cluster.local:${PORT}`));

import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";

// For PostgreSQL sessions
import pgSession from "connect-pg-simple";

// For PostgreSQL
import pkg from "pg";
const { Pool } = pkg;

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3300;

// Security and CORS configuration
app.use(helmet());
app.use(cors({
    //origin: "*",//"http://192.168.227.128",
    origin: "http://localhost:8900",
    credentials: true
}));
app.use(express.json());

// -------------------------------------------
// PostgreSQL Connection
// -------------------------------------------
const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
});

const connectDB = async () => {
    try {
        await pool.connect();
        console.log("PostgreSQL connected successfully");
    } catch (error) {
        console.error("PostgreSQL connection error:", error);
        process.exit(1);
    }
};

await connectDB();

// Database initialization (create tables if they do not exist)
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
        console.log("PostgreSQL tables initialized successfully");
    } catch (error) {
        console.error("Database initialization error:", error);
    }
};

initializeDatabase();

// -------------------------------------------
// Session configuration using PostgreSQL
// -------------------------------------------
const PGStore = pgSession(session);

app.use(
    session({
        store: new PGStore({
            pool: pool,           // Use the same pool as above
            tableName: "session",  // Name of the table to store sessions
            createTableIfMissing: true,
        }),
        secret: process.env.SESSION_SECRET || "defaultSecretKey",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // Set to true in production with HTTPS
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

// -------------------------------------------
// Passport.js Configuration
// -------------------------------------------
passport.use(
    new LocalStrategy({ usernameField: "email" },
        async (email, password, done) => {
            try {
                console.log("Verifying user:", email);
                const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
                const user = rows[0];

                if (!user) {
                    console.log("User not found:", email);
                    return done(null, false, { message: "User not found" });
                }

                const isMatch = bcrypt.compareSync(password, user.password);
                if (!isMatch) {
                    console.log("Incorrect password for:", email);
                    return done(null, false, { message: "Incorrect password" });
                }

                return done(null, user);
            } catch (error) {
                console.error("Database error:", error);
                return done(error);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
        done(null, rows[0]);
    } catch (error) {
        done(error);
    }
});

// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Authentication required" });
};

// -------------------------------------------
// Authentication Routes
// -------------------------------------------
app.post("/api/register", async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        await pool.query("INSERT INTO users (email, password) VALUES ($1, $2)", [email, hashedPassword]);
        res.json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: `Registration error: ${error.message}` });
    }
});

app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: "Authentication failed", error: err.message });
        }
        if (!user) {
            return res.status(401).json({ message: info.message || "Invalid credentials" });
        }

        req.logIn(user, (err) => {
            if (err) {
                console.error("Error during req.logIn:", err);
                return res.status(500).json({ message: "Session error", error: err.message });
            }

            // Session created and user authenticated
            return res.json({ message: "Login successful", user });
        });
    })(req, res, next);
});

app.get("/api/session", (req, res) => {
    // View session contents
    res.json(req.session);
});

app.post("/api/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) return next(err);
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: "Error destroying session" });
            }
            res.clearCookie("connect.sid");
            res.json({ message: "Logout successful" });
        });
    });
});

app.get("/api/check-auth", (req, res) => {
    if (req.isAuthenticated()) {
        return res.json({ user: req.user });
    }
    res.status(401).json({ message: "Not authenticated" });
});

app.get("/api/user-balance", isAuthenticated, async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT balance FROM users WHERE id = $1", [req.user.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ balance: rows[0].balance });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving balance", error: error.message });
    }
});

app.get('/api/history', isAuthenticated, async (req, res) => {
    try {
        // Retrieve sales history for the authenticated user
        const { rows: history } = await pool.query('SELECT * FROM history WHERE user_id = $1', [req.user.id]);

        // Format each entry with a complete timestamp (ISO 8601)
        const formattedHistory = history.map((item) => ({
            ...item,
            date_sold: new Date(item.date_sold).toISOString(), // Format as ISO 8601 (date + time + seconds)
        }));

        console.log(formattedHistory);
        res.json(formattedHistory);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving history.', error: error.message });
    }
});

app.post('/api/wallet/list', isAuthenticated, async (req, res) => {
    try {
        const { image_id, price } = req.body;
        console.log(req.body);

        // Check if the card belongs to the user
        const { rows } = await pool.query(
            'SELECT * FROM wallet WHERE id = $1 AND user_id = $2',
            [image_id, req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Card not found or unauthorized.' });
        }

        // Update the card status and price
        await pool.query(
            'UPDATE wallet SET status = $1, price = $2 WHERE id = $3',
            ['listed', price, image_id]
        );

        res.json({ message: 'Card successfully listed for sale.', image_id, price });
    } catch (error) {
        res.status(500).json({ message: 'Error listing the card for sale.', error: error.message });
    }
});

// -------------------------------------------
// Wallet Routes
// -------------------------------------------
app.get("/api/wallet", isAuthenticated, async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM wallet WHERE user_id = $1", [req.user.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving wallet data", error: error.message });
    }
});

app.post("/api/wallet", isAuthenticated, async (req, res) => {
    const { image_url, status } = req.body;
    try {
        await pool.query(
            "INSERT INTO wallet (user_id, image_url, status) VALUES ($1, $2, $3)",
            [req.user.id, image_url, status || "withdrawn"]
        );
        res.json({ message: "Image added to wallet" });
    } catch (error) {
        res.status(500).json({ message: "Error adding image", error: error.message });
    }
});

app.post('/api/wallet/withdraw', isAuthenticated, async (req, res) => {
    try {
        const { image_id } = req.body;

        // Update the image status to "withdrawn" if it belongs to the authenticated user
        await pool.query(
            'UPDATE wallet SET status = $1 WHERE id = $2 AND user_id = $3',
            ['withdrawn', image_id, req.user.id]
        );

        res.json({ message: 'Image successfully withdrawn from sale.' });
    } catch (error) {
        res.status(500).json({ message: 'Error withdrawing the image.', error: error.message });
    }
});

app.post('/api/history', isAuthenticated, async (req, res) => {
    try {
        const { image_url, price, buyer_name } = req.body;

        await pool.query(
            'INSERT INTO history (user_id, image_url, price, buyer_name, date_sold) VALUES ($1, $2, $3, $4, $5)',
            [req.user.id, image_url, price, buyer_name, new Date().toISOString()]
        );

        res.json({ message: "Sale successfully added to history." });
    } catch (error) {
        res.status(500).json({ message: "Error adding sale to history.", error: error.message });
    }
});

// -------------------------------------------
// Marketplace Routes
// -------------------------------------------
app.get("/api/marketplace", async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT wallet.id, wallet.image_url, wallet.price, wallet.status, users.email AS owner_email
            FROM wallet
            INNER JOIN users ON wallet.user_id = users.id
            WHERE wallet.status = 'listed'
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving marketplace items", error: error.message });
    }
});

// app.post("/api/marketplace/buy", isAuthenticated, async (req, res) => {
//     const { image_id } = req.body;
//     try {
//         const { rows: [card] } = await pool.query(
//             "SELECT * FROM wallet WHERE id = $1 AND status = $2",
//             [image_id, "listed"]
//         );

//         if (!card) {
//             return res.status(400).json({ message: "Item not available or already sold" });
//         }

//         if (card.user_id === req.user.id) {
//             return res.status(403).json({ message: "Cannot purchase your own item" });
//         }

//         // Debit the buyer's account
//         await pool.query("UPDATE users SET balance = balance - $1 WHERE id = $2", [card.price, req.user.id]);
//         // Credit the seller's account
//         await pool.query("UPDATE users SET balance = balance + $1 WHERE id = $2", [card.price, card.user_id]);

//         // Transfer ownership
//         await pool.query(
//             "UPDATE wallet SET user_id = $1, status = $2 WHERE id = $3",
//             [req.user.id, "withdrawn", image_id]
//         );

//         // Automatically update the history table
//         await pool.query(
//             `INSERT INTO history (user_id, image_url, price, buyer_name, date_sold)
//              VALUES ($1, $2, $3, $4, $5)`,
//             [card.user_id, card.image_url, card.price, req.user.email, new Date().toISOString()]
//         );

//         res.json({ message: "Purchase successful", price: card.price });
//     } catch (error) {
//         res.status(500).json({ message: "Purchase error", error: error.message });
//     }
// });

// -------------------------------------------
// Start the Server
// -------------------------------------------

app.post("/api/marketplace/buy", isAuthenticated, async (req, res) => {
    const { image_id } = req.body;
    try {
        // Retrieve the card details
        const { rows: [card] } = await pool.query(
            "SELECT * FROM wallet WHERE id = $1 AND status = $2",
            [image_id, "listed"]
        );

        if (!card) {
            return res.status(400).json({ message: "Item not available or already sold" });
        }

        if (card.user_id === req.user.id) {
            return res.status(403).json({ message: "Cannot purchase your own item" });
        }

        // Retrieve the buyer's current balance
        const { rows: [buyer] } = await pool.query(
            "SELECT balance FROM users WHERE id = $1",
            [req.user.id]
        );

        // Check if the buyer has enough funds
        if (!buyer || buyer.balance < card.price) {
            return res.status(400).json({ message: "Insufficient funds to purchase this item" });
        }

        // Debit the buyer's account
        await pool.query("UPDATE users SET balance = balance - $1 WHERE id = $2", [card.price, req.user.id]);
        // Credit the seller's account
        await pool.query("UPDATE users SET balance = balance + $1 WHERE id = $2", [card.price, card.user_id]);

        // Transfer ownership
        await pool.query(
            "UPDATE wallet SET user_id = $1, status = $2 WHERE id = $3",
            [req.user.id, "withdrawn", image_id]
        );

        // Automatically update the history table
        await pool.query(
            `INSERT INTO history (user_id, image_url, price, buyer_name, date_sold)
             VALUES ($1, $2, $3, $4, $5)`,
            [card.user_id, card.image_url, card.price, req.user.email, new Date().toISOString()]
        );

        res.json({ message: "Purchase successful", price: card.price });
    } catch (error) {
        res.status(500).json({ message: "Purchase error", error: error.message });
    }
});


const startServer = () => {
    try {
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Server startup error:", error);
        process.exit(1);
    }
};

startServer();

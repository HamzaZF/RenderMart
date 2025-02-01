import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";

// Pour la session PostgreSQL
import pgSession from "connect-pg-simple";

// Pour PostgreSQL
import pkg from "pg";
const { Pool } = pkg;

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = 3300;

// Sécurité et CORS
app.use(helmet());
app.use(cors({
    //origin: "*",//"http://192.168.227.128",
    origin: "http://localhost:8900",
    credentials: true
}));
app.use(express.json());

// -------------------------------------------
// Connexion à PostgreSQL
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
        console.log("✅ PostgreSQL connecté avec succès !");
    } catch (error) {
        console.error("❌ Erreur de connexion PostgreSQL :", error);
        process.exit(1);
    }
};

await connectDB();

// Initialisation de la base de données (création de tables si elles n'existent pas)
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
        console.log("✅ Tables PostgreSQL initialisées !");
    } catch (error) {
        console.error("❌ Erreur d'initialisation de la base de données :", error);
    }
};

initializeDatabase();

// -------------------------------------------
// Configuration des sessions avec PostgreSQL
// -------------------------------------------
const PGStore = pgSession(session);

app.use(
    session({
        store: new PGStore({
            pool: pool,           // utilise la même pool que ci-dessus
            tableName: "session",  // nom de la table pour stocker les sessions
            createTableIfMissing: true,
        }),
        secret: process.env.SESSION_SECRET || "defaultSecretKey",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // Passe à true si tu es en production avec HTTPS
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24, // 1 jour
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

// -------------------------------------------
// Configuration de Passport.js
// -------------------------------------------
passport.use(
    new LocalStrategy({ usernameField: "email" },
        async (email, password, done) => {
            try {
                console.log("🔍 Vérification de l'utilisateur :", email);
                const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
                const user = rows[0];

                if (!user) {
                    console.log("❌ Utilisateur introuvable :", email);
                    return done(null, false, { message: "Utilisateur non trouvé" });
                }

                const isMatch = bcrypt.compareSync(password, user.password);
                if (!isMatch) {
                    console.log("❌ Mot de passe incorrect pour :", email);
                    return done(null, false, { message: "Mot de passe incorrect" });
                }

                return done(null, user);
            } catch (error) {
                console.error("🔥 Erreur de base de données :", error);
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

// Middleware d'authentification
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Authentification requise" });
};

// -------------------------------------------
// Routes d'authentification
// -------------------------------------------
app.post("/api/register", async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        await pool.query("INSERT INTO users (email, password) VALUES ($1, $2)", [email, hashedPassword]);
        res.json({ message: "Utilisateur enregistré avec succès" });
    } catch (error) {
        res.status(500).json({ message: `Erreur d'inscription : ${error.message}` });
    }
});

app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: "Échec de l'authentification", error: err.message });
        }
        if (!user) {
            return res.status(401).json({ message: info.message || "Identifiants invalides" });
        }

        req.logIn(user, (err) => {
            if (err) {
                console.error("❌ Erreur lors de req.logIn :", err);
                return res.status(500).json({ message: "Erreur de session", error: err.message });
            }

            // Session créée et utilisateur authentifié
            return res.json({ message: "Connexion réussie", user });
        });
    })(req, res, next);
});

app.get("/api/session", (req, res) => {
    // Pour voir le contenu de la session
    res.json(req.session);
});

app.post("/api/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) return next(err);
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: "Erreur lors de la suppression de session" });
            }
            res.clearCookie("connect.sid");
            res.json({ message: "Déconnexion réussie" });
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
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json({ balance: rows[0].balance });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération du solde", error: error.message });
    }
});

app.get('/api/history', isAuthenticated, async (req, res) => {
    try {
        // Récupérer l'historique des ventes pour l'utilisateur connecté
        const { rows: history } = await pool.query('SELECT * FROM history WHERE user_id = $1', [req.user.id]);

        // Formater chaque entrée avec un timestamp complet (ISO 8601)
        const formattedHistory = history.map((item) => ({
            ...item,
            date_sold: new Date(item.date_sold).toISOString(), // Formate en ISO 8601 (date + heure + secondes)
        }));

        console.log(formattedHistory);
        res.json(formattedHistory);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique.', error: error.message });
    }
});

app.post('/api/wallet/list', isAuthenticated, async (req, res) => {
    try {
        const { image_id, price } = req.body;
        console.log(req.body);

        // Vérifie si la carte appartient à l'utilisateur
        const { rows } = await pool.query(
            'SELECT * FROM wallet WHERE id = $1 AND user_id = $2',
            [image_id, req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Carte introuvable ou non autorisée.' });
        }

        // Met à jour le statut de la carte et son prix
        await pool.query(
            'UPDATE wallet SET status = $1, price = $2 WHERE id = $3',
            ['listed', price, image_id]
        );

        res.json({ message: 'Carte mise en vente avec succès.', image_id, price });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise en vente de la carte.', error: error.message });
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

        // Mettre à jour le statut de l'image en "withdrawn" si elle appartient à l'utilisateur connecté
        await pool.query(
            'UPDATE wallet SET status = $1 WHERE id = $2 AND user_id = $3',
            ['withdrawn', image_id, req.user.id]
        );

        res.json({ message: 'Image retirée de la vente avec succès.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors du retrait de l\'image.', error: error.message });
    }
});

app.post('/api/history', isAuthenticated, async (req, res) => {
    try {
        const { image_url, price, buyer_name } = req.body;

        await pool.query(
            'INSERT INTO history (user_id, image_url, price, buyer_name, date_sold) VALUES ($1, $2, $3, $4, $5)',
            [req.user.id, image_url, price, buyer_name, new Date().toISOString()]
        );

        res.json({ message: "Vente ajoutée à l'historique avec succès." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'ajout à l'historique.", error: error.message });
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

app.post("/api/marketplace/buy", isAuthenticated, async (req, res) => {
    const { image_id } = req.body;
    try {
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

        // Débit de l'acheteur
        await pool.query("UPDATE users SET balance = balance - $1 WHERE id = $2", [card.price, req.user.id]);
        // Crédit du vendeur
        await pool.query("UPDATE users SET balance = balance + $1 WHERE id = $2", [card.price, card.user_id]);

        // Transfert de propriété
        await pool.query(
            "UPDATE wallet SET user_id = $1, status = $2 WHERE id = $3",
            [req.user.id, "withdrawn", image_id]
        );

        res.json({ message: "Purchase successful" });
    } catch (error) {
        res.status(500).json({ message: "Purchase error", error: error.message });
    }
});

// -------------------------------------------
// Lancer le serveur
// -------------------------------------------
const startServer = () => {
    try {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Erreur de démarrage du serveur :", error);
        process.exit(1);
    }
};

startServer();
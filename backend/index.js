import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from "uuid"; // Importer la méthode v4 pour générer des UUIDs
import Database from 'better-sqlite3'; import helmet from 'helmet';
import dotenv from 'dotenv';
import cors from "cors";

dotenv.config();

const app = express();
const PORT = 3300;

// Ajoute Helmet pour sécuriser les headers HTTP
app.use(helmet());

// Activer CORS pour autoriser les requêtes du frontend
app.use(cors({
    origin: "http://localhost:5173", // L'URL du frontend React
    credentials: true, // Autoriser l'envoi des cookies (sessions)
}));

// ---------- Database ----------

// Initialisation de la base SQLite
const db = new Database('./database.db');

// Création de la table `users` si elle n'existe pas déjà
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      balance REAL NOT NULL DEFAULT 500
    )
  `);


// Création de la table wallet (portefeuille des utilisateurs)
db.exec(`
    CREATE TABLE IF NOT EXISTS wallet (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('listed', 'withdrawn')),
      price TEXT NOT NULL DEFAULT '0',
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
`);


// Création de la table history (historique des ventes)
db.exec(`
CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    price REAL NOT NULL,
    buyer_name TEXT NOT NULL,
    date_sold TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
)
`);

console.log('Base de données initialisée.');


//middleware
app.use(express.json());

// ---------- Session ----------

app.use(session({
    secret: process.env.SESSION_SECRET || 'renderMartSecret',
    resave: false,
    saveUninitialized: false
}));

// Initialiser Passport et session
app.use(passport.initialize());
app.use(passport.session());

// ------------------ UTILISATEURS ------------------
const users = [];

// Modification de la stratégie Passport pour utiliser SQLite
passport.use(
    new LocalStrategy(
        { usernameField: 'email' },
        async (email, password, done) => {
            try {
                // Cherche l'utilisateur dans SQLite
                const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
                if (!user) {
                    return done(null, false, { message: 'Utilisateur non trouvé.' });
                }

                // Vérifie le mot de passe
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return done(null, false, { message: 'Mot de passe incorrect.' });
                }

                return done(null, user); // Authentification réussie
            } catch (error) {
                return done(error);
            }
        }
    )
);

// Sérialisation/Désérialisation de l'utilisateur pour les sessions
passport.serializeUser((user, done) => {
    done(null, user.id);
});


passport.deserializeUser((id, done) => {
    try {
        // Cherche l'utilisateur par son ID dans la base SQLite
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

        if (!user) {
            return done(new Error('Utilisateur non trouvé.'));
        }

        done(null, user); // L'utilisateur a été trouvé et désérialisé
    } catch (error) {
        done(error);
    }
});


// ---------- Routes d'authentification ----------

app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Vérifie si l'email est déjà utilisé
        const userExists = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (userExists) {
            return res.status(400).json({ message: 'Email déjà utilisé.' });
        }

        // Hash le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Ajoute l'utilisateur à la base
        db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(email, hashedPassword);

        res.json({ message: 'Utilisateur enregistré avec succès !' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'inscription.', error: error.message });
    }
});

// Connexion (avec SQLite)
app.post('/api/login', passport.authenticate('local', { failureMessage: true }), (req, res) => {
    res.json({ message: 'Connexion réussie !' });
}
);

// Vérifie si l'utilisateur est connecté
app.get('/api/check-auth', (req, res) => {
    if (req.isAuthenticated()) {
        const { id, email } = req.user; // N'envoie que les données non sensibles
        return res.json({ message: 'Utilisateur connecté.', user: { id, email } });
    }
    res.status(401).json({ message: 'Non authentifié.' });
}
);

// Déconnexion
app.post('/api/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de la déconnexion.' });
        }
        res.json({ message: 'Déconnexion réussie.' });
    });
}
);

// ---------- Autres Routes ----------

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next(); // Si l'utilisateur est authentifié, on passe à la prochaine étape
    }
    res.status(401).json({ message: 'Vous devez être connecté pour accéder à cette ressource.' }); // Sinon, erreur 401
};

app.get('/api/wallet', isAuthenticated, (req, res) => {
    try {
        // Récupérer les images du portefeuille de l'utilisateur connecté
        const wallet = db.prepare('SELECT * FROM wallet WHERE user_id = ?').all(req.user.id);
        res.json(wallet);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du portefeuille.', error: error.message });
    }
});

app.post('/api/wallet', isAuthenticated, (req, res) => {
    const { image_url, status } = req.body;

    try {
        // Ajouter une image au portefeuille
        db.prepare('INSERT INTO wallet (user_id, image_url, status) VALUES (?, ?, ?)').run(req.user.id, image_url, status || 'withdrawn');
        res.json({ message: 'Image ajoutée au portefeuille avec succès.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'image.', error: error.message });
    }
});

app.post('/api/wallet/list', isAuthenticated, (req, res) => {
    console.log(req.body);

    const { image_id, price } = req.body;

    console.log(req.body);

    try {
        // Vérifie si la carte appartient à l'utilisateur
        const card = db.prepare('SELECT * FROM wallet WHERE id = ? AND user_id = ?').get(image_id, req.user.id);
        if (!card) {
            return res.status(404).json({ message: 'Carte introuvable ou non autorisée.' });
        }

        // Met à jour le statut de la carte et son prix
        db.prepare('UPDATE wallet SET status = ?, price = ? WHERE id = ?').run('listed', price, image_id);

        res.json({ message: 'Carte mise en vente avec succès.', image_id, price });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise en vente de la carte.', error: error.message });
    }
});



app.post('/api/wallet/withdraw', isAuthenticated, (req, res) => {
    const { image_id } = req.body;

    try {
        // Mettre à jour le statut de l'image en "withdrawn"
        db.prepare('UPDATE wallet SET status = ? WHERE id = ? AND user_id = ?').run('withdrawn', image_id, req.user.id);
        res.json({ message: 'Image retirée de la vente avec succès.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors du retrait de l\'image.', error: error.message });
    }
});

app.get('/api/history', isAuthenticated, (req, res) => {
    try {
        // Récupérer l'historique des ventes
        const history = db.prepare('SELECT * FROM history WHERE user_id = ?').all(req.user.id);

        // Formate chaque entrée avec un timestamp complet (ISO 8601)
        const formattedHistory = history.map((item) => ({
            ...item,
            date_sold: new Date(item.date_sold).toISOString(), // Formate en ISO 8601 avec date + heure + secondes
        }));

        console.log(formattedHistory);

        res.json(formattedHistory);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique.', error: error.message });
    }
});



app.post('/api/history', isAuthenticated, (req, res) => {
    const { image_url, price, buyer_name } = req.body;

    try {
        // Ajouter une vente dans l'historique
        db.prepare('INSERT INTO history (user_id, image_url, price, buyer_name, date_sold) VALUES (?, ?, ?, ?, ?)').run(
            req.user.id,
            image_url,
            price,
            buyer_name,
            new Date().toISOString()// Date au format YYYY-MM-DD
        );
        res.json({ message: 'Vente ajoutée à l\'historique avec succès.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'ajout à l\'historique.', error: error.message });
    }
});


// Route pour afficher toutes les images en vente dans la marketplace
app.get('/api/marketplace', (req, res) => {
    try {
        // Récupérer toutes les cartes "listed" avec leurs prix
        const marketplaceImages = db.prepare(`
            SELECT wallet.id, wallet.image_url, wallet.price, wallet.status, users.email AS owner_email
            FROM wallet
            INNER JOIN users ON wallet.user_id = users.id
            WHERE wallet.status = 'listed'
        `).all();

        res.json(marketplaceImages);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des cartes en vente.', error: error.message });
    }
});


// app.post('/api/marketplace/buy', isAuthenticated, (req, res) => {
//     const { image_id } = req.body;

//     try {
//         // Vérifie si la carte existe et est en vente
//         const card = db.prepare('SELECT * FROM wallet WHERE id = ? AND status = ?').get(image_id, 'listed');
//         if (!card) {
//             return res.status(400).json({ message: 'Carte introuvable ou déjà retirée de la vente.' });
//         }

//         // Simuler un prix (ce prix viendrait du client dans un vrai système)
//         const price = card.price || 0;

//         // Mettre à jour le statut de la carte comme retirée de la vente
//         db.prepare('UPDATE wallet SET status = ?, price = NULL WHERE id = ?').run('withdrawn', image_id);

//         // Ajouter la vente à l'historique
//         db.prepare(`
//             INSERT INTO history (user_id, image_url, price, buyer_name, date_sold)
//             VALUES (?, ?, ?, ?, ?)
//         `).run(
//             card.user_id, // Le vendeur
//             card.image_url,
//             price,
//             req.user.email, // Acheteur (email de l'utilisateur connecté)
//             new Date().toISOString().split('T')[0] // Date actuelle
//         );

//         res.json({ message: 'Achat réalisé avec succès !', price, image_id });
//     } catch (error) {
//         res.status(500).json({ message: 'Erreur lors de l\'achat.', error: error.message });
//     }
// });


//start server

app.post('/api/marketplace/buy', isAuthenticated, (req, res) => {
    const { image_id } = req.body;

    try {
        // Vérifie si la carte existe et est en vente
        const card = db.prepare('SELECT * FROM wallet WHERE id = ? AND status = ?').get(image_id, 'listed');
        console.log("ici");
        if (!card) {
            return res.status(400).json({ message: 'Carte introuvable ou déjà retirée de la vente.' });
        }

        // Vérifie si l'utilisateur tente d'acheter sa propre carte
        if (card.user_id === req.user.id) {
            return res.status(403).json({ message: 'Vous ne pouvez pas acheter votre propre carte.' });
        }

        const buyer = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.user.id);
        if (!buyer || buyer.balance < card.price) {
            return res.status(400).json({ message: 'Fonds insuffisants.' });
        }

        console.log("ici");

        // Déduit le montant de l'acheteur
        db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(card.price, req.user.id);

        // Ajoute le montant au vendeur
        db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(card.price, card.user_id);

        // Transfère la carte au portefeuille de l'acheteur
        db.prepare('UPDATE wallet SET user_id = ?, status = ?, price = 0 WHERE id = ?').run(req.user.id, 'withdrawn', image_id);

        // Ajoute l'achat à l'historique
        db.prepare(`
            INSERT INTO history (user_id, image_url, price, buyer_name, date_sold)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            card.user_id, // Le vendeur
            card.image_url,
            card.price,
            req.user.email, // Acheteur
            new Date().toISOString()// Date actuelle
        );

        res.json({ message: 'Achat réalisé avec succès !', price: card.price, image_id });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'achat.', error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
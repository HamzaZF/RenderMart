import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from "uuid"; // Importer la méthode v4 pour générer des UUIDs

const app = express();
const PORT = 3300;

//middleware
app.use(express.json());

// ---------- Session ----------

app.use(session({
    secret: 'renderMartSecret',
    resave: false,
    saveUninitialized: false
}));

// Initialiser Passport et session
app.use(passport.initialize());
app.use(passport.session());

// ------------------ UTILISATEURS ------------------
const users = [];

//configuration de passport avec une stratégie locale
passport.use(new LocalStrategy(
    {usernameField: "email"},
    async (email, password, done) => {
        const user = users.find(user => user.email === email);
        if (!user) {
            return done(null, false, {message: 'Utilisateur non trouvé'});
        }
        if (!bcrypt.compareSync(password, user.password)) {
            return done(null, false, {message: 'Mot de passe incorrect'});
        }
        return done(null, user);
    })
);

// Sérialisation/Désérialisation de l'utilisateur pour les sessions
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    const user = users.find(user => user.id === id);
    done(null, user);
});

// ---------- Routes d'authentification ----------

// Inscription
app.post('/api/register', (req, res) => {
    const {email, password} = req.body;

    // Vérifie si l'utilisateur existe déjà
    if(users.find((u) => u.email === email)) {
        return res.status(400).json({ message: 'Email déjà utilisé.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = {
        id: uuidv4(),
        email,
        password: hashedPassword
    };
    users.push(newUser);
    res.json({message: 'Utilisateur enregistré avec succès'});
}
);

// Connexion
app.post('/api/login', passport.authenticate('local'), (req, res) => {
    res.json({message: 'Connecté avec succès'});
    }
);

// Vérifie si l'utilisateur est connecté
app.get('/api/check-auth', (req, res) => {
    if (req.isAuthenticated()) {
      return res.json({ message: 'Utilisateur connecté.', user: req.user });
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

//1. Wallet
app.get('/api/wallet', (req, res) => {
    const walletImages = [
        {
            id: 1,
            status: 'listed',
            url: 'https://placehold.co/600x400'
        },
        {
            id: 2,
            status: 'withdrawn',
            url: 'https://placehold.co/600x400'
        },
        {
            id: 3,
            status: 'listed',
            url: 'https://placehold.co/600x400'
        }
    ];
    res.json(walletImages);
});

app.post('/api/wallet/list', (req, res) => {
    const { imageId } = req.body;
    res.json({
        message: `Image ${imageId} listed succesfully !`,
    });
});

app.post('/api/wallet/withdrawn', (req, res) => {
    const { imageId } = req.body;
    res.json({
        message: `Image ${imageId} withdrawned succesfully !`,
    });
});

//2. History
app.get('/api/history', (req, res) => {
    const history = [
        { 
            id: 1, 
            price: 599, 
            buyer: 'John Doe', 
            dateSold: '2025-01-01' 
        },
        { 
            id: 2, 
            price: 799, 
            buyer: 'Jane Doe', 
            dateSold: '2025-01-02' 
        },
        { 
            id: 3, 
            price: 999, 
            buyer: 'John Doe', 
            dateSold: '2025-01-03' 
        }
    ];
    res.json(history);
});

const generateImageId = () => Math.floor(Math.random() * 1000000);

//3. Generate image
app.use('/api/generate', (req, res) => {
    const {description} = req.body;
    const generatedImage = {
        id: generateImageId(),
        description,
        url: 'https://placehold.co/600x400'
    }
    res.json(generatedImage);
});

//main routes
app.get('/', (req, res) => {
    res.send('Hello World');
});

//start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const session = require("express-session");
require("dotenv").config();

// Initialize Express app
const PORT = process.env.PORT;
const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json());

// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors({
    origin: ["http://localhost:5000", "http://localhost:3000"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', "Cookie"],
    credentials: true,
}));

// MongoDB's connection string
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB Atlas database
mongoose.connect(MONGO_URI, {})
    .then(() => console.log("✅ Connection to Database Established."))
    .catch((err) => {
        console.error("❌ Database connection failed:", err.message);
        process.exit(1);
    });

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 60 * 1000,
        SameSite: "None", // Necessary for cross-origin requests
        secure: false,
    }
}));

// Importing Routes
const userRoutes = require('./user');

// Mount user routes
app.use('/user', userRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on PORT: ${PORT}`);
});

// Example endpoint for your backend
app.post('/api/verify', async (req, res) => {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const token = req.body.response; // Token received from the client

    try {
        // Make a fetch request to the external API, using the secret key
        const response = await import('node-fetch').then(({default: fetch}) => fetch(`https://www.google.com/recaptcha/api/siteverify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `secret=${secretKey}&response=${token}` // Send the secret key and the response token
        }));

        const data = await response.json();
        res.status(200).json(data); // Send the response back to the client
    } catch (error) {
        console.error(error);
        res.status(500).json({error: '❌ Verification failed'});
    }
});
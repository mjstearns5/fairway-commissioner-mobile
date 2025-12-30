require('dotenv').config(); // Load .env from root
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
// --- NEW: ADMIN SETUP (Works on Render & Local) ---
const admin = require('firebase-admin');

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Cloud: Read from the Secret Variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Local: Read from the file
  serviceAccount = require('./serviceAccountKey.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

// 2. CRITICAL: Stripe Webhooks need the "Raw" body, not JSON.
// We use this special middleware ONLY for the webhook route.
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify the message is actually from Stripe
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`❌ Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // 3. Handle the Success Event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userEmail = session.customer_details.email; // Stripe sends us the email
    console.log(`💰 Payment received from: ${userEmail}`);

    try {
      // --- CORRECT SERVER-SIDE SYNTAX ---
      const usersRef = db.collection('users');
      const snapshot = await usersRef.where('email', '==', userEmail).get();

      if (snapshot.empty) {
        console.log(`⚠️ User not found for email: ${userEmail}`);
      } else {
        snapshot.forEach(async (doc) => {
          await doc.ref.update({
             isSubscribed: true,
             subscriptionDate: new Date()
          });
          console.log(`✅ SUCCESS: Unlocked app for ${userEmail}`);
        });
      }
    } catch (dbError) {
      console.error('❌ Database Error:', dbError);
    }
  }

  res.send(); // Tell Stripe "We got it!"
});

// 4. Standard Middleware for the rest of the app
app.use(cors());
app.use(express.json());

// 5. Checkout Route
app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: 'price_1SdsIlKll3SQ9kHDrRThzALA', // ⚠️ Check this ID in your Stripe Dashboard!
          quantity: 1,
        },
      ],
      // NEW CODE (Points to Render)
success_url: 'https://fairway-commissioner-mobile-api.onrender.com/success',
cancel_url: 'https://fairway-commissioner-mobile-api.onrender.com/cancel',
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// 6. Portal Route (Manage Subscription)
app.post('/create-portal-session', async (req, res) => {
  try {
    const { email } = req.body;
    const customers = await stripe.customers.list({ email, limit: 1 });
    
    if (customers.data.length === 0) {
      return res.status(404).json({ error: 'No customer found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: 'https://fairway-commissioner-mobile-api.onrender.com/success', // <--- This sends them back to the app!
    });

    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// --- NEW: Simple Success/Cancel Pages ---
app.get('/success', (req, res) => {
  res.send(`
    <html>
      <body style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: green;">Payment Successful! ✅</h1>
        <p>Your subscription is active.</p>
        <p>You can close this window and return to the <b>Fairway Commissioner</b> app.</p>
      </body>
    </html>
  `);
});

app.get('/cancel', (req, res) => {
  res.send(`
    <html>
      <body style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1>Payment Canceled</h1>
        <p>You can close this window and return to the app.</p>
      </body>
    </html>
  `);
});
app.listen(4000, () => console.log('Server running on port 4000'));
require('dotenv').config(); // Load .env from root
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const { initializeApp } = require("firebase/app");
const { getFirestore, doc, updateDoc, collection, query, where, getDocs } = require("firebase/firestore");

// 1. Initialize Firebase (So the server can unlock the app)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

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
        // Find the user in Firebase by their email
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Unlock the app!
            const userDoc = querySnapshot.docs[0];
            await updateDoc(doc(db, "users", userDoc.id), {
                isSubscribed: true,
                subscriptionDate: new Date()
            });
            console.log(`✅ SUCCESS: Unlocked app for ${userEmail}`);
        } else {
            console.log(`⚠️ User not found for email: ${userEmail}`);
        }
    } catch (error) {
        console.error("❌ Database Error:", error);
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
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(4000, () => console.log('Server running on port 4000'));
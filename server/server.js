const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json.json'); // Double check this filename matches your folder!

// 1. Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// 2. Setup Server
const app = express();
app.use(cors());
app.use(express.json()); // <--- CRITICAL for reading app data

// 3. THE NEW ENDPOINT (For RevenueCat)
app.post('/api/confirm-subscription', async (req, res) => {
  const { email } = req.body;
  console.log(`📥 Received subscription confirmation for: ${email}`);

  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      console.log(`⚠️ User not found: ${email}`);
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the user
    for (const doc of snapshot.docs) {
      await doc.ref.update({
        isSubscribed: true,
        subscriptionDate: new Date()
      });
    }

    console.log(`✅ SUCCESS: Updated database for ${email}`);
    res.json({ success: true });

  } catch (error) {
    console.error('❌ Database Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Start Server
const PORT = 4000; // Keeping your port 4000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
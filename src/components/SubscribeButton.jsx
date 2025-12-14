// src/components/SubscribeButton.jsx
import React from 'react';

const SubscribeButton = () => {
  
  const handleCheckout = async () => {
    try {
      // 1. Send a request to your backend to create a session
      const response = await fetch('http://localhost:4000/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        // 2. Redirect the user to the Stripe Checkout page
        window.location.href = data.url; 
      } else {
        console.error('Checkout Failed:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="subscription-card">
        <h3>Yearly Premium</h3>
        <p>$15 / year</p>
        <button onClick={handleCheckout} style={{ padding: '10px 20px', fontSize: '16px', background: '#6772e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Subscribe Now
        </button>
    </div>
  );
};

export default SubscribeButton;
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

  // This return statement includes the container, text, and styled button
  return (
    <div className="subscription-card" style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '300px', textAlign: 'center', margin: '20px auto' }}>
        <h3>Yearly Premium</h3>
        <p style={{ fontSize: '20px', fontWeight: 'bold' }}>$15 / year</p>
        <p>Get full access to all features.</p>
        
        <button 
          onClick={handleCheckout} 
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px', 
            background: '#6772e5', // Stripe's signature purple color
            color: '#fff', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Subscribe Now
        </button>
    </div>
  );
};

export default SubscribeButton;
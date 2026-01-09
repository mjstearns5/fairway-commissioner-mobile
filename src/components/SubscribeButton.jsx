import React, { useState } from 'react';
import { Purchases } from '@revenuecat/purchases-capacitor';

const SubscribeButton = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // 1. Get the "Current Offering" (The Annual Package we set up)
      const offerings = await Purchases.getOfferings();
      
      if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
        // 2. Select the first available package (Annual)
        const packageToBuy = offerings.current.availablePackages[0];
        
        // 3. Launch the Apple/Google Payment Popup
        const { customerInfo } = await Purchases.purchasePackage({ aPackage: packageToBuy });

        // 4. Check if the payment worked
        if (customerInfo.entitlements.active['premium_access']) {
          alert("Welcome to the Club! ⛳️");
          if (onSuccess) onSuccess(); // Update your DB/State here
        }
      } else {
        alert("No subscriptions found. Please checks your setup.");
      }
    } catch (error) {
      if (!error.userCancelled) {
        console.error("Purchase Error:", error);
        alert("Purchase failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleSubscribe} 
      disabled={isLoading}
      className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-green-700 transition duration-300 disabled:opacity-50"
    >
      {isLoading ? "Processing..." : "Join the Commissioner's Club ($19.99/yr)"}
    </button>
  );
};

export default SubscribeButton;
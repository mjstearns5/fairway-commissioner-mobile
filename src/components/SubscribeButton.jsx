import React, { useState } from 'react';
import { Purchases } from '@revenuecat/purchases-capacitor';

const SubscribeButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch current offerings to make sure we have a valid product
      const offerings = await Purchases.getOfferings();
      
      // Safety check: Do we have packages?
      if (!offerings || !offerings.current || !offerings.current.annual) {
        alert("Error: Product not found. Please try again later.");
        setIsLoading(false);
        return;
      }

      const { customerInfo } = await Purchases.purchasePackage({
        aPackage: offerings.current.annual,
      });

      // 2. Check if the purchase worked
      if (
        customerInfo?.entitlements?.active?.['premium_access'] !== undefined
      ) {
         // SUCCESS! The listener in App.js will handle the navigation.
         // We just alert the user here.
         alert("Welcome to the Commissioner's Club!");
      }
    } catch (e) {
      // 👇 THIS PRINTS THE RAW ERROR CODE SO WE KNOW THE EXACT CAUSE
      alert("ERROR CODE: " + e.code + "\n" + e.message + "\n" + JSON.stringify(e.userInfo));
      console.error(e); 
    }
     finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      
      // 👇 DEBUGGING: This alerts exactly what we got back
      // alert("DEBUG: " + JSON.stringify(customerInfo)); 

      // ✅ CRASH-PROOF CHECK (The '?' marks are critical here)
      const isPro = customerInfo?.entitlements?.active?.['premium_access'] !== undefined;

      if (isPro) {
        alert("Purchase Restored! Unlocking app...");
      } else {
        alert("No active subscription found on this Google account.");
      }
    } catch (e) {
      // 👇 Debugging for Restore issues too
      alert("RESTORE ERROR: " + e.code + "\n" + e.message + "\n" + JSON.stringify(e.userInfo));
      console.error(e); 
    }

     finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handlePurchase}
        disabled={isLoading}
        className="w-full bg-slate-800 text-white font-bold py-3 px-4 rounded-lg shadow-md active:scale-95 transition-transform disabled:opacity-50"
      >
        {isLoading ? "Processing..." : "Join Commissioner's Club ($14.99/yr)"}
      </button>

      {/* NEW RESTORE BUTTON (v3) */}
      <button
        onClick={handleRestore}
        disabled={isLoading}
        className="text-slate-500 text-sm underline hover:text-slate-800 transition-colors"
      >
        Already paid? Restore Purchase (v3)
      </button>
    </div>
  );
};

export default SubscribeButton;
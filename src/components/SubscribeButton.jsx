import React from 'react';

// The "Brain" (handlePurchase/Restore) is passed down from the Parent.
// This component just displays the buttons and triggers those functions.
const SubscribeButton = ({ handlePurchase, handleRestore, isLoading, isSubscribed }) => {

    return (
        <div className="flex flex-col gap-3">
            {/* 1. JOIN BUTTON */}
            <button
                onClick={() => {
                    console.log("🟢 Join Button Clicked!");
                    if (handlePurchase) handlePurchase();
                    else alert("Error: handlePurchase function is missing!");
                }}
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? "Processing..." : "Join Commissioner's Club ($14.99/yr)"}
            </button>

            {/* 2. RESTORE LINK */}
            <button
                onClick={() => {
                    console.log("🟡 Restore Link Clicked!");
                    if (handleRestore) handleRestore();
                    else alert("Error: handleRestore function is missing!");
                }}
                disabled={isLoading}
                className="text-slate-500 text-sm underline hover:text-slate-800 transition-colors"
            >
                Already paid? Restore Purchase (v3)
            </button>
        </div>
    );
};

export default SubscribeButton;
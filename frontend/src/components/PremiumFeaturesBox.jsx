import React from "react";

const PremiumFeaturesBox = ({ isPremium, onUpgradeClick }) => {
  const features = [
    "Therapeutic Games 🎮",
    "Breathing Exercises 🌬️",
    "AI Coach 🤖",
    "Sleep Companion 😴",
    "Mood Reports 📊",
    "Exclusive Content 🎨",
    "Priority Support ⚡",
    "Merch Discounts 🛍️",
  ];

  return (
    <div className="premium-features-box">
      <h2 className="features-title">
        {isPremium ? "🌟 Premium Features" : "✨ Unlock Premium"}
      </h2>
      <ul className="features-list">
        {features.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
      {!isPremium && (
        <button className="upgrade-btn" onClick={onUpgradeClick}>
          Upgrade Now
        </button>
      )}
    </div>
  );
};

export default PremiumFeaturesBox;

import React, { useState } from 'react';
const API_BASE_URL = 'http://127.0.0.1:5000';

// Placed here for demonstration
// In src/components/Shop.jsx

const sampleShopItems = [
    // Themes
    {id: 1, name: "Sunset", description: "Warm orange and purple tones.", price: 50, category: "theme", permanent: true, previewColor: "linear-gradient(135deg, #ff7e5f, #feb47b)"},
    {id: 2, name: "Ocean", description: "Calming deep blue gradients.", price: 50, category: "theme", permanent: true, previewColor: "linear-gradient(135deg, #4facfe, #00f2fe)"},
    {id: 3, name: "Forest", description: "Lush, natural green shades.", price: 50, category: "theme", permanent: true, previewColor: "linear-gradient(135deg, #56ab2f, #a8e063)"},
    {id: 4, name: "Neon", description: "Vibrant, dark-mode friendly colors.", price: 75, category: "theme", permanent: true, previewColor: "linear-gradient(135deg, #ff00cc, #333399)"},
    {id: 5, name: "Serene Sunrise", description: "Soft pinks and yellows.", price: 60, category: "theme", permanent: true, previewColor: "linear-gradient(135deg, #f6d365, #fda085)"},
    {id: 17, name: "Midnight Calm", description: "A deep, relaxing dark theme.", price: 75, category: "theme", permanent: true, previewColor: "linear-gradient(135deg, #2c3e50, #4ca1af)"},
    {id: 21, name: "Animated Stars", description: "Gently twinkling stars background.", price: 120, category: "theme", permanent: true, previewIcon: "🌌"},
    // Avatars
    {id: 11, name: "The Astronaut", description: "For the explorers of the mind.", price: 120, category: "avatar", permanent: true, previewIcon: "👨‍🚀"},
    {id: 12, name: "Nature Lover", description: "For those grounded in nature.", price: 90, category: "avatar", permanent: true, previewIcon: "🌿"},
    {id: 13, name: "The Phoenix", description: "Symbolizing rebirth and resilience.", price: 150, category: "avatar", permanent: true, previewIcon: "🔥"},
    {id: 14, name: "The Artist", description: "For the creative and expressive souls.", price: 95, category: "avatar", permanent: true, previewIcon: "🎨"},
    // Cosmetics
    {id: 6, name: "Gold Avatar Frame", description: "A golden frame for your avatar.", price: 100, category: "cosmetic", permanent: true, previewIcon: "🖼️"},
    {id: 19, name: "Mood Stickers Pack", description: "20 exclusive stickers for chat.", price: 40, category: "cosmetic", permanent: true, previewIcon: "🎭"},
    {id: 22, name: "Gratitude Journal Skin", description: "A beautiful new look for your journal.", price: 30, category: "cosmetic", permanent: true, previewIcon: "📔"},
    // Content
    {id: 7, name: "Meditation Pack", description: "10 new guided meditations.", price: 75, category: "content", permanent: true, previewIcon: "🧘"},
    {id: 9, name: "Sleep Stories Pack", description: "10 bedtime stories for deep sleep.", price: 60, category: "content", permanent: true, previewIcon: "🌙"},
    {id: 21, name: "Relaxation Sounds", description: "10 new soundscapes (Rain, Forest, etc.).", price: 50, category: "content", permanent: true, previewIcon: "🎶"},
    {id: 23, name: "Self-Confidence Course", description: "A 5-part audio course.", price: 150, category: "content", permanent: true, previewIcon: "🚀"},
    // Utilities
    {id: 8, name: "Second Chance Token", description: "Save your streak if you miss a day.", price: 30, category: "utility", permanent: false, previewIcon: "⚡"},
    {id: 24, name: "Double Coin Booster (24h)", description: "Earn 2x coins for 24 hours.", price: 50, category: "utility", permanent: false, previewIcon: "💰"},
    {id: 25, name: "Journal Prompt Pack", description: "50 new prompts for your journal.", price: 25, category: "utility", permanent: true, previewIcon: "✍️"}
];

function Shop({ user, onUpdateUser }) {
    const [shopItems, setShopItems] = useState(sampleShopItems);
    const [activeShopCategory, setActiveShopCategory] = useState("All");
    
    const buyItem = async (item) => {
        if (user.coins < item.price) {
            alert("Not enough coins!");
            return;
        }
        if (window.confirm(`Buy ${item.name} for ${item.price} coins?`)) {
             try {
                const response = await fetch(`${API_BASE_URL}/api/shop/purchase`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ item_id: item.id, price: item.price })
                });
                const data = await response.json();
                if (response.ok) {
                    onUpdateUser({ 
                        coins: data.new_balance, 
                        purchasedItems: data.purchased_items 
                    });
                    alert(`Successfully purchased ${item.name}!`);
                } else {
                    alert(`Purchase failed: ${data.error}`);
                }
            } catch (error) {
                alert("An error occurred during purchase.");
            }
        }
    };
    
    const filteredShopItems = activeShopCategory === "All"
        ? shopItems
        : shopItems.filter(item => item.category.toLowerCase() === activeShopCategory.toLowerCase());

    return (
        <div className="tab-content shop-tab">
            <h2>🛒 MoodMate Shop</h2>
            <p>Use your coins to unlock themes, avatars, and special utilities.</p>
            
            <div className="shop-categories">
                {["All", "theme", "cosmetic", "utility"].map(category => (
                    <button 
                        key={category} 
                        className={`category-btn ${activeShopCategory === category ? 'active' : ''}`}
                        onClick={() => setActiveShopCategory(category)}
                    >{category}</button>
                ))}
            </div>

            <div className="shop-grid">
                {filteredShopItems.map(item => {
                    const isOwned = user.purchasedItems?.includes(item.id);
                    return (
                        <div key={item.id} className="shop-item-card">
                            <div className="item-preview" style={{background: item.previewColor}}>
                                {item.previewIcon && <div className="item-icon-preview">{item.previewIcon}</div>}
                            </div>
                            <h4>{item.name}</h4>
                            <p>{item.description}</p>
                            <div className="item-price">🪙 {item.price}</div>
                            <button
                                onClick={() => buyItem(item)}
                                disabled={isOwned || user.coins < item.price}
                                className={isOwned ? "owned-btn" : "buy-btn"}
                            >
                                {isOwned ? "Owned" : "Buy"}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Shop;
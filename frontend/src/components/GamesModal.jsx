import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Games.css';

const gameLibrary = [
  {
    id: 'bubble',
    name: 'Zen Pop',
    description: 'Pop soft bubbles to release micro-stress and reset your focus.',
    icon: 'Pop',
    category: 'Relaxation',
    premium: false,
  },
  {
    id: 'breath',
    name: 'Neural Flow',
    description: 'Follow a slow breathing rhythm with a visual guide built for regulation.',
    icon: 'Flow',
    category: 'Focus',
    premium: true,
  },
  {
    id: 'match',
    name: 'Memory Oasis',
    description: 'Flip calming cards and rebuild attention with light memory work.',
    icon: 'Match',
    category: 'Cognitive',
    premium: true,
  },
  {
    id: 'rain',
    name: 'Rain Maker',
    description: 'Layer nature sounds into a sleep-friendly soundscape.',
    icon: 'Rain',
    category: 'Sleep',
    premium: true,
  },
];

const MEMORY_OASIS_ICONS = ['Bloom', 'Leaf', 'Wing', 'Moss', 'Shell', 'Moon'];

const ZenPopGame = () => {
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles((prev) => {
        if (prev.length > 25) return prev;
        return [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: Math.random() * 85 + 5,
            y: Math.random() * 85 + 5,
            size: Math.random() * 40 + 30,
            tone: ['tone-blue', 'tone-green', 'tone-gold', 'tone-lilac'][Math.floor(Math.random() * 4)],
          },
        ];
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);

  const popBubble = (id) => {
    setBubbles((prev) => prev.filter((bubble) => bubble.id !== id));
    setScore((prev) => prev + 1);
  };

  return (
    <div className="game-stage zen-pop-stage">
      <div className="game-stage-header">
        <strong>Score {score}</strong>
        <span>Pop the bubbles to release tension.</span>
      </div>
      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.button
            key={bubble.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, -18, 0] }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.4, y: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
            className={`game-bubble ${bubble.tone}`}
            onClick={() => popBubble(bubble.id)}
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const NeuralFlowGame = () => (
  <div className="game-stage neural-flow-stage">
    <motion.div
      className="neural-flow-orb"
      animate={{
        scale: [1, 3.2, 1],
        borderRadius: ['50%', '34%', '50%'],
        rotate: [0, 180, 0],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
    <div className="neural-flow-copy">
      <h3>Sync your breath</h3>
      <p>Inhale as the shape opens. Exhale as it softens back.</p>
    </div>
  </div>
);

const MemoryOasisGame = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const shuffled = [...MEMORY_OASIS_ICONS, ...MEMORY_OASIS_ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({ id: index, icon }));
    setCards(shuffled);
  }, []);

  const flipCard = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || solved.includes(id)) return;

    const nextFlipped = [...flipped, id];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const isMatch =
        cards.find((card) => card.id === nextFlipped[0])?.icon === cards.find((card) => card.id === nextFlipped[1])?.icon;

      if (isMatch) {
        setSolved([...solved, ...nextFlipped]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  return (
    <div className="game-stage memory-stage">
      <div className="game-stage-header">
        <strong>Moves {moves}</strong>
        <span>{solved.length === 12 ? 'Oasis restored' : 'Match the symbols in pairs.'}</span>
      </div>
      <div className="memory-grid">
        {cards.map((card) => {
          const isOpen = flipped.includes(card.id) || solved.includes(card.id);
          return (
            <motion.button
              key={card.id}
              className={`memory-card ${isOpen ? 'open' : ''}`}
              onClick={() => flipCard(card.id)}
              whileTap={{ scale: 0.96 }}
              animate={{ rotateY: isOpen ? 180 : 0 }}
              transition={{ duration: 0.28 }}
            >
              <span className="memory-card-inner">{isOpen ? card.icon : ''}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

const RainMakerGame = () => {
  const sounds = [
    { id: 'rain', icon: 'Rain', name: 'Light Rain' },
    { id: 'thunder', icon: 'Storm', name: 'Distant Thunder' },
    { id: 'wind', icon: 'Wind', name: 'Soft Wind' },
    { id: 'birds', icon: 'Birds', name: 'Forest Birds' },
    { id: 'fire', icon: 'Fire', name: 'Fireplace' },
    { id: 'stream', icon: 'River', name: 'River Stream' },
  ];

  const [active, setActive] = useState({});

  const toggleSound = (sound) => {
    setActive((prev) => ({ ...prev, [sound.id]: !prev[sound.id] }));
  };

  return (
    <div className="game-stage rain-stage">
      <div className="game-stage-header">
        <strong>Custom soundscape</strong>
        <span>Tap any layer to build your own atmosphere.</span>
      </div>
      <div className="rain-grid">
        {sounds.map((sound) => (
          <motion.button
            key={sound.id}
            className={`rain-card ${active[sound.id] ? 'active' : ''}`}
            onClick={() => toggleSound(sound)}
            whileTap={{ scale: 0.96 }}
          >
            <span className="rain-card-icon">{sound.icon}</span>
            <span className="rain-card-label">{sound.name}</span>
            {active[sound.id] && <span className="rain-card-pulse" />}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

function GamesModal({ user, onClose, onUpgradeClick }) {
  const [activeGame, setActiveGame] = useState(null);

  const handlePlay = (game) => {
    if (game.premium && !user?.is_premium) {
      onUpgradeClick?.();
      return;
    }
    setActiveGame(game);
  };

  if (activeGame) {
    return (
      <div className="modal-overlay game-modal-overlay" onClick={() => setActiveGame(null)}>
        <div className="modal-content game-player-shell" onClick={(event) => event.stopPropagation()}>
          <div className="game-player-header">
            <div>
              <span className="games-kicker">Interactive reset</span>
              <h2>{activeGame.name}</h2>
            </div>
            <button onClick={() => setActiveGame(null)} className="game-modal-close">
              Close
            </button>
          </div>

          <div className="game-player-surface">
            {activeGame.id === 'bubble' && <ZenPopGame />}
            {activeGame.id === 'breath' && <NeuralFlowGame />}
            {activeGame.id === 'match' && <MemoryOasisGame />}
            {activeGame.id === 'rain' && <RainMakerGame />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay game-modal-overlay" onClick={onClose}>
      <div className="modal-content games-modal-container" onClick={(event) => event.stopPropagation()}>
        <div className="games-header-row">
          <div className="games-header">
            <span className="games-kicker">Interactive tools</span>
            <h2>Arcade Oasis</h2>
            <p>Mini experiences designed to regulate attention, reduce tension, and add a little gentleness to your routine.</p>
          </div>
          <button onClick={onClose} className="game-modal-close">
            Close
          </button>
        </div>

        <div className="games-grid">
          {gameLibrary.map((game) => {
            const isLocked = game.premium && !user?.is_premium;
            return (
              <motion.div
                key={game.id}
                className="game-card"
                onClick={() => handlePlay(game)}
                whileHover={{ y: -4 }}
              >
                <div className="game-card-visual">
                  <span className="game-card-icon">{game.icon}</span>
                  {isLocked && <span className="game-card-badge">Premium</span>}
                </div>

                <div className="game-details">
                  <div className="game-card-topline">
                    <h3>{game.name}</h3>
                    <span className="game-card-category">{game.category}</span>
                  </div>
                  <p>{game.description}</p>
                  <button className={`game-btn ${isLocked ? 'locked' : ''}`}>
                    {isLocked ? 'Unlock to play' : 'Open activity'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default GamesModal;

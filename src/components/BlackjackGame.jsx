import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./game.css";

const suits = ["♠", "♥", "♦", "♣"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const getCardNumericValue = (val) => {
  if (!val) return null;
  if (val === "A") return 11;
  if (["J", "Q", "K"].includes(val)) return 10;
  const n = Number(val);
  return Number.isNaN(n) ? null : n;
};

const calculateHandValue = (hand) => {
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    const v = getCardNumericValue(c.value);
    total += v;
    if (c.value === "A") aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
};

const recommendMove = (playerTotal, dealerVisibleValue) => {
  if (playerTotal <= 11) return { action: "Hit", confidence: 90 };
  if (playerTotal >= 17) return { action: "Stand", confidence: 95 };
  if (dealerVisibleValue >= 7) return { action: "Hit", confidence: 75 };
  return { action: "Stand", confidence: 75 };
};

const shuffleDeck = () => {
  const deck = [];
  suits.forEach((suit) => values.forEach((value) => deck.push({ suit, value })));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

export default function BlackjackGame() {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(true);
  const [balance, setBalance] = useState(1000);
  const [round, setRound] = useState(1);
  const [bet, setBet] = useState(100);
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    startNewRound();
  }, []);

  useEffect(() => {
    if (gameOver) return;
    const playerTotal = calculateHandValue(playerHand);
    const dealerVisible = dealerHand[0]?.value;
    const rec = recommendMove(playerTotal, getCardNumericValue(dealerVisible));
    if (playerTotal <= 21) setRecommendation(rec);
    else setRecommendation(null);
  }, [playerHand, dealerHand, gameOver]);

  const draw = (d) => d.pop();

  const startNewRound = () => {
    const newDeck = shuffleDeck();
    const p1 = draw(newDeck);
    const p2 = draw(newDeck);
    const d1 = draw(newDeck);
    const d2 = draw(newDeck);
    setDeck(newDeck);
    setPlayerHand([p1, p2]);
    setDealerHand([d1, d2]);
    setMessage("");
    setGameOver(false);
    setRecommendation(null);
  };

  const hit = () => {
    if (gameOver) return;
    const d = [...deck];
    const c = draw(d);
    const newPlayer = [...playerHand, c];
    setPlayerHand(newPlayer);
    setDeck(d);
    const playerTotal = calculateHandValue(newPlayer);
    if (playerTotal > 21) {
      setMessage(`💥 You busted (${playerTotal}). Dealer wins.`);
      setBalance((b) => b - bet);
      setGameOver(true);
      setRound((r) => r + 1);
    }
  };

  const stand = () => {
    if (gameOver) return;
    let d = [...deck];
    let dealer = [...dealerHand];
    while (calculateHandValue(dealer) < 17) {
      dealer.push(draw(d));
    }
    setDealerHand(dealer);
    setDeck(d);
    const playerTotal = calculateHandValue(playerHand);
    const dealerTotal = calculateHandValue(dealer);

    if (dealerTotal > 21 || playerTotal > dealerTotal) {
      setMessage(`🏆 You win! (${playerTotal} vs ${dealerTotal})`);
      setBalance((b) => b + bet);
    } else if (playerTotal < dealerTotal) {
      setMessage(`😔 Dealer wins (${dealerTotal} vs ${playerTotal})`);
      setBalance((b) => b - bet);
    } else {
      setMessage(`🤝 Push (${playerTotal} = ${dealerTotal})`);
    }
    setGameOver(true);
    setRound((r) => r + 1);
  };

  return (
    <div className="blackjack-container">
      <header className="header">
        <h1>♠️ Blackjack Royale ♥️</h1>
      </header>

      <div className="stats">
        <div className="stat">💰 Balance: ${balance}</div>
        <div className="stat bet">🎲 Bet: ${bet}</div>
        <div className="stat round">🌀 Round: {round}</div>
      </div>

      <div className="table">
        <section className="dealer-section">
          <h2>Dealer</h2>
          <div className="cards">
            <AnimatePresence>
              {dealerHand.map((card, i) => (
                <motion.div
                  key={i}
                  className="card"
                  style={{
                    color: card.suit === "♥" || card.suit === "♦" ? "#e53935" : "#111",
                  }}
                  initial={{ y: -40, opacity: 0, rotate: -15 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  {gameOver || i === 0 ? (
                    <>
                      <div className="value">{card.value}</div>
                      <div className="suit">{card.suit}</div>
                    </>
                  ) : (
                    <div className="card-back" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {gameOver && <p>Total: {calculateHandValue(dealerHand)}</p>}
        </section>

        <section className="player-section">
          <h2>You</h2>
          <div className="cards">
            <AnimatePresence>
              {playerHand.map((card, i) => (
                <motion.div
                  key={i}
                  className="card"
                  style={{
                    color: card.suit === "♥" || card.suit === "♦" ? "#e53935" : "#111",
                  }}
                  initial={{ y: 40, opacity: 0, rotate: 15 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <div className="value">{card.value}</div>
                  <div className="suit">{card.suit}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <p>Total: {calculateHandValue(playerHand)}</p>

          {recommendation && (
            <motion.div
              className="recommendation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              💡 Recommended Move:{" "}
              <strong>
                {recommendation.action} ({recommendation.confidence}%)
              </strong>
            </motion.div>
          )}
        </section>
      </div>

      <div className="controls">
        {!gameOver ? (
          <>
            <motion.button whileTap={{ scale: 0.9 }} onClick={hit}>
              ✋ Hit
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={stand}>
              🧍 Stand
            </motion.button>
          </>
        ) : (
          <motion.button whileTap={{ scale: 0.9 }} onClick={startNewRound}>
            🔄 Next Round
          </motion.button>
        )}
      </div>

      <motion.p
        className="message"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {message}
      </motion.p>
    </div>
  );
}

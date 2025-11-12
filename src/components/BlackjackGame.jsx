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

// Simulate Blackjack move recommendation based on bust probability
const recommendMove = (playerHand, dealerVisibleValue) => {
  const playerTotal = calculateHandValue(playerHand);

  // All possible next cards
  const allCards = [
    "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K",




  ];

  // Estimate bust probability if we "Hit"
  let busts = 0;
  allCards.forEach((card) => {
    let val = getCardNumericValue(card);
    // Handle Ace as 1 or 11 optimally
    if (val === 11 && playerTotal + 11 > 21) val = 1;
    const newTotal = playerTotal + val;
    if (newTotal > 21) busts++;
  });

  const bustProbability = (busts / allCards.length) * 100;

  // Decide action based on bust probability + dealer's visible card strength
  let action = "";
  let confidence = 0;
  let reason = "";

  if (bustProbability <= 40) {
    action = "Hit";
    confidence = Math.round(100 - bustProbability / 2); // higher safety → higher confidence
    reason = `Bust probability is low (${bustProbability.toFixed(
      1
    )}%), so it's safe to draw another card.`;
  } else if (bustProbability >= 60) {
    action = "Stand";
    confidence = Math.round(bustProbability); // high bust risk → confident stand
    reason = `High bust probability (${bustProbability.toFixed(
      1
    )}%) — safer to stand.`;
  } else {
    // Moderate zone (40–60%)
    if (dealerVisibleValue >= 7) {
      action = "Hit";
      confidence = 65;
      reason = `Dealer shows a strong card (${dealerVisibleValue}), you may need to risk a hit.`;
    } else {
      action = "Stand";
      confidence = 70;
      reason = `Dealer has a weak card (${dealerVisibleValue}), standing may be better.`;
    }
  }

  return {
    action,
    confidence,
    bustProbability: bustProbability.toFixed(1),
    reason,
  };
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
  const [resultType, setResultType] = useState(null); // "win" | "lose" | "push" | "bust"

  useEffect(() => {
    startNewRound();
  }, []);

  useEffect(() => {
    if (gameOver) return;
    const playerTotal = calculateHandValue(playerHand);
    const dealerVisible = dealerHand[0]?.value;
    const rec = recommendMove(playerHand, getCardNumericValue(dealerVisible));
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
    setResultType(null);
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
      setMessage(` You busted (${playerTotal}). Dealer wins.`);
      setBalance((b) => b - bet);
      setGameOver(true);
      setRound((r) => r + 1);
      setResultType("bust");
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
      setMessage(` You win! (${playerTotal} vs ${dealerTotal})`);
      setBalance((b) => b + bet);
      setResultType("win");
    } else if (playerTotal < dealerTotal) {
      setMessage(` Dealer wins (${dealerTotal} vs ${playerTotal})`);
      setBalance((b) => b - bet);
      setResultType("lose");
    } else {
      setMessage(` Push (${playerTotal} = ${dealerTotal})`);
      setResultType("push");
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
        <motion.div
          className={`stat balance ${resultType}`}
          animate={{ scale: resultType ? 1.2 : 1 }}
          transition={{ duration: 0.5 }}
        >
          Balance: ${balance}
        </motion.div>
        <div className="stat bet">Bet: ${bet}</div>
        <div className="stat round">Round: {round}</div>
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
              style={{
                color:
                  recommendation.action === "Hit" ? "#e53935" : "#43a047",
              }}
            >
               Recommended Move:{" "}
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
               Hit
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={stand}>
               Stand
            </motion.button>
          </>
        ) : (
          <motion.button whileTap={{ scale: 0.9 }} onClick={startNewRound}>
            🔄 Next Round
          </motion.button>
        )}
      </div>

      {/* Animated round result */}
      <AnimatePresence>
        {resultType && (
          <motion.div
            className={`result-banner ${resultType}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 120 }}
          >
            {resultType === "win"
              ? " You Win!"
              : resultType === "lose"
              ? " Dealer Wins!"
              : resultType === "bust"
              ? " Busted!"
              : " Push!"}
          </motion.div>
        )}
      </AnimatePresence>

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

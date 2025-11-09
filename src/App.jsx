import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [status, setStatus] = useState("Click DEAL to start a new round!");
  const [balance, setBalance] = useState(1000);
  const [inGame, setInGame] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Deck setup
  const suits = ["♠", "♥", "♦", "♣"];
  const values = [
    "A", "2", "3", "4", "5", "6", "7",
    "8", "9", "10", "J", "Q", "K"
  ];

  const createDeck = () => {
    const deck = [];
    suits.forEach((suit) => {
      values.forEach((value) => {
        deck.push({ suit, value });
      });
    });
    return deck.sort(() => Math.random() - 0.5);
  };

  const [deck, setDeck] = useState(createDeck());

  const getCardValue = (card) => {
    if (["J", "Q", "K"].includes(card.value)) return 10;
    if (card.value === "A") return 11;
    return parseInt(card.value);
  };

  const calculateScore = (hand) => {
    let score = 0;
    let aces = 0;
    hand.forEach((card) => {
      score += getCardValue(card);
      if (card.value === "A") aces++;
    });
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }
    return score;
  };

  const deal = () => {
    const newDeck = createDeck();
    const newPlayerHand = [newDeck.pop(), newDeck.pop()];
    const newDealerHand = [newDeck.pop(), newDeck.pop()];

    setDeck(newDeck);
    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setStatus("Your move...");
    setInGame(true);
    setGameOver(false);
  };

  const hit = () => {
    if (!inGame) return;
    const newDeck = [...deck];
    const newCard = newDeck.pop();
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    setDeck(newDeck);

    const playerScore = calculateScore(newHand);
    if (playerScore > 21) {
      setStatus(`You busted! Dealer wins.`);
      setBalance(balance - 100);
      setInGame(false);
      setGameOver(true);
    }
  };

  const stand = () => {
    if (!inGame) return;
    setInGame(false);
    setStatus("Dealer's turn...");
    dealerPlay();
  };

  const dealerPlay = () => {
    let newDealerHand = [...dealerHand];
    let newDeck = [...deck];

    while (calculateScore(newDealerHand) < 17) {
      newDealerHand.push(newDeck.pop());
    }

    const dealerScore = calculateScore(newDealerHand);
    const playerScore = calculateScore(playerHand);

    setDealerHand(newDealerHand);
    setDeck(newDeck);

    if (dealerScore > 21 || playerScore > dealerScore) {
      setStatus(`You win! 🎉`);
      setBalance(balance + 100);
    } else if (dealerScore === playerScore) {
      setStatus(`It's a tie.`);
    } else {
      setStatus(`Dealer wins.`);
      setBalance(balance - 100);
    }

    setGameOver(true);
  };

  const reset = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setStatus("Click DEAL to start a new round!");
    setGameOver(false);
    setInGame(false);
  };

  return (
    <div className="table">
      <h1 className="title">♣ Blackjack Royale ♠</h1>

      <div className="dealer-area">
        <h2>Dealer</h2>
        <div className="hand">
          {dealerHand.map((card, i) => (
            <div key={i} className="card">
              <span className="value">{card.value}</span>
              <span className="suit">{card.suit}</span>
            </div>
          ))}
        </div>
        {dealerHand.length > 0 && (
          <p className="score">Score: {calculateScore(dealerHand)}</p>
        )}
      </div>

      <div className="player-area">
        <h2>You</h2>
        <div className="hand">
          {playerHand.map((card, i) => (
            <div key={i} className="card">
              <span className="value">{card.value}</span>
              <span className="suit">{card.suit}</span>
            </div>
          ))}
        </div>
        {playerHand.length > 0 && (
          <p className="score">Score: {calculateScore(playerHand)}</p>
        )}
      </div>

      <p className="status">{status}</p>
      <p className="balance">Balance: ${balance}</p>

      <div className="controls">
        <button className="btn" onClick={deal} disabled={inGame}>
          Deal
        </button>
        <button className="btn" onClick={hit} disabled={!inGame}>
          Hit
        </button>
        <button className="btn" onClick={stand} disabled={!inGame}>
          Stand
        </button>
        {gameOver && (
          <button className="btn reset" onClick={reset}>
            Play Again
          </button>
        )}
      </div>
    </div>
  );
}

export default App;

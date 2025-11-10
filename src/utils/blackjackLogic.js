// src/utils/blackjackLogic.js

// Create and shuffle a standard 52-card deck
export function createShuffledDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const ranks = [
    { r: "A", v: 11 },
    { r: "2", v: 2 },
    { r: "3", v: 3 },
    { r: "4", v: 4 },
    { r: "5", v: 5 },
    { r: "6", v: 6 },
    { r: "7", v: 7 },
    { r: "8", v: 8 },
    { r: "9", v: 9 },
    { r: "10", v: 10 },
    { r: "J", v: 10 },
    { r: "Q", v: 10 },
    { r: "K", v: 10 }
  ];

  const deck = [];
  for (const s of suits) {
    for (const rk of ranks) {
      deck.push({ rank: rk.r, value: rk.v, suit: s, id: `${rk.r}${s}` });
    }
  }

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

// Draw one card
export function drawOne(deck) {
  // deck is mutated (pop)
  return deck.pop();
}

// Calculate best hand value (Aces = 1 or 11)
export function calcHandValue(hand) {
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    total += c.value;
    if (c.rank === "A") aces++;
  }
  // reduce aces from 11 to 1 as needed
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

// Check blackjack: exactly two cards and value 21
export function isBlackjack(hand) {
  return hand.length === 2 && calcHandValue(hand) === 21;
}

// Dealer plays according to standard rule: hit until 17 or more.
// We'll treat dealer stands on soft 17 (common rule). If you want dealer hits soft 17,
// change condition accordingly.
export function dealerPlay(deck, dealerHand) {
  // dealerHand is mutated directly (push)
  while (true) {
    const v = calcHandValue(dealerHand);
    // check for soft 17: count an ace as 11 when total includes one
    const hasAce = dealerHand.some(c => c.rank === "A");
    // if dealer has soft 17 (value 17 with an ace counted as 11) we stand (common rule)
    if (v < 17) {
      dealerHand.push(drawOne(deck));
      continue;
    }
    break;
  }
  return dealerHand;
}

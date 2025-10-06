import random

# ---------- STEP 1: Create Deck ----------
def create_deck():
    ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
    deck = ranks * 4  # 4 suits
    random.shuffle(deck)
    return deck

# ---------- STEP 2: Calculate Hand Value ----------
def hand_value(hand):
    value = 0
    aces = 0
    for card in hand:
        if card in ['J', 'Q', 'K']:
            value += 10
        elif card == 'A':
            aces += 1
            value += 11
        else:
            value += int(card)

    # Adjust Aces if value > 21
    while value > 21 and aces:
        value -= 10
        aces -= 1
    return value

# ---------- STEP 3: Betting Strategies ----------
def flat_bet(balance, base_bet=10):
    """Always bet the same amount"""
    return base_bet

def martingale_bet(balance, base_bet, last_result):
    """
    Double your bet after a loss, return to base bet after a win.
    If you lose multiple times, bet doubles each time (risky!).
    """
    if last_result == 'loss':
        return min(balance, base_bet * 2)
    else:
        return base_bet

def random_bet(balance, base_bet):
    """Bet random amount between base_bet and 3x base_bet"""
    return min(balance, random.randint(base_bet, base_bet * 3))

# ---------- STEP 4: Play a Single Round ----------
def play_round(deck):
    player = [deck.pop(), deck.pop()]
    dealer = [deck.pop(), deck.pop()]

    # Player hits until 17 or more
    while hand_value(player) < 17:
        player.append(deck.pop())

    # Dealer hits until 17 or more
    while hand_value(dealer) < 17:
        dealer.append(deck.pop())

    player_total = hand_value(player)
    dealer_total = hand_value(dealer)

    # Determine round result
    if player_total > 21:
        return 'loss'
    elif dealer_total > 21 or player_total > dealer_total:
        return 'win'
    elif player_total < dealer_total:
        return 'loss'
    else:
        return 'tie'

# ---------- STEP 5: Run Simulation ----------
def simulate(strategy_name, num_rounds=50, starting_balance=500, base_bet=10):
    balance = starting_balance
    last_result = None
    deck = create_deck()

    for round_num in range(1, num_rounds + 1):
        # Re-shuffle if deck is running low
        if len(deck) < 15:
            deck = create_deck()

        # Apply chosen strategy
        if strategy_name == 'flat':
            bet = flat_bet(balance, base_bet)
        elif strategy_name == 'martingale':
            bet = martingale_bet(balance, base_bet, last_result)
        elif strategy_name == 'random':
            bet = random_bet(balance, base_bet)
        else:
            raise ValueError("Unknown strategy")

        # Play one round
        result = play_round(deck)

        # Update balance
        if result == 'win':
            balance += bet
        elif result == 'loss':
            balance -= bet

        last_result = result

        # Print progress
        print(f"Round {round_num}: {result.upper()} | Bet = {bet} | Balance = {balance}")

        if balance <= 0:
            print("💸 You ran out of money!")
            break

    print(f"\nFinal Balance with {strategy_name.capitalize()} Strategy: {balance}\n")

# ---------- STEP 6: Compare Strategies ----------
simulate('flat')
simulate('martingale')
simulate('random')

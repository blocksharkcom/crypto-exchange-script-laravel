<?php

declare(strict_types=1);

return [

    'categories' => [
        'getting-started' => [
            'title' => 'Getting started',
            'desc' => 'New to the platform? Start here for a 60-second tour.',
            'icon' => 'rocket',
        ],
        'swapping' => [
            'title' => 'Swapping crypto',
            'desc' => 'Everything about pairs, rates, networks, and confirmations.',
            'icon' => 'arrows',
        ],
        'fees-limits' => [
            'title' => 'Fees & limits',
            'desc' => 'How rates are built, minimums, and what you actually pay.',
            'icon' => 'scale',
        ],
        'security' => [
            'title' => 'Security & safety',
            'desc' => 'Why we are non-custodial and how to stay safe.',
            'icon' => 'shield',
        ],
        'account' => [
            'title' => 'Account',
            'desc' => 'Optional accounts, password resets, and personal preferences.',
            'icon' => 'user',
        ],
    ],

    'articles' => [
        'how-crypto-swap-works' => [
            'category' => 'getting-started',
            'title' => 'How a crypto swap actually works',
            'summary' => 'Four steps from your wallet to your wallet — no custody, no middlemen, no surprises.',
            'body' => "A swap on this platform follows four predictable steps:\n\n1. **Pick a pair.** You tell us what you want to send (e.g. BTC) and what you want to receive (e.g. ETH). We fetch the best live rate from our liquidity partners.\n2. **Enter your receive address.** You paste the wallet address where your new asset should arrive. We *never* hold your funds in a custodial wallet.\n3. **Send your deposit.** We generate a unique one-time deposit address. You transfer the exact amount from your wallet to that address.\n4. **Receive your funds.** Once the network confirms your deposit, the swap fires automatically and the new asset lands at your receive address.\n\nMost swaps complete in **5 to 30 minutes**. Slower blockchains (Bitcoin, Monero) take longer simply because their confirmation cycles are slower.",
        ],

        'account-not-required' => [
            'category' => 'getting-started',
            'title' => 'Do I need an account?',
            'summary' => 'No account, no wallet connection, no browser extension. Optional sign-up gives you history.',
            'body' => "You can complete a full swap without ever creating an account. We never require:\n\n- An email address\n- A wallet connection\n- A browser extension\n- KYC documents for typical swap sizes\n\n**Why sign up then?** An optional account gives you:\n\n- A history of every swap you've made\n- Lifetime fee tracking and volume statistics\n- Faster checkout (we remember your preferred receive addresses)\n- Email receipts and ticket replies in one inbox\n\nSign-up is two fields and takes ten seconds. You can delete your account at any time from **Account → Settings**.",
        ],

        'supported-browsers' => [
            'category' => 'getting-started',
            'title' => 'Browser and device compatibility',
            'summary' => 'Works on every modern browser, mobile or desktop. No app required.',
            'body' => "The platform runs on any browser shipped in the last 24 months:\n\n- **Desktop:** Chrome, Edge, Safari, Firefox, Brave, Arc\n- **Mobile:** Safari (iOS 15+), Chrome (Android 10+), Samsung Internet\n\nYou don't need a wallet extension installed — we never ask your browser to sign transactions. Everything happens on standard HTTPS with no Web3 plumbing.\n\nIf the page looks broken, clear cookies and try an incognito window. If it still misbehaves, [open a ticket](/help?tab=open#tickets) and include your browser version.",
        ],

        // ── Swapping ────────────────────────────────────────────────
        'floating-vs-fixed' => [
            'category' => 'swapping',
            'title' => 'Floating rate vs fixed rate',
            'summary' => 'When to lock the rate and when to let it ride. Trade-offs in plain English.',
            'body' => "Every swap quote uses one of two rate models:\n\n**Floating rate** (default) — Your final receive amount is calculated *at the moment your deposit confirms on chain*. If the market moves in your favour during the waiting period, you receive more. If it moves against you, you receive slightly less. Spread is **tighter** than fixed rate, so the headline rate looks better.\n\n**Fixed rate** — The receive amount is locked the instant you start the swap. Volatility cannot eat into your result. Spread is **slightly wider** because our partners hedge the price risk for you.\n\n**Rule of thumb:** Pick fixed rate when you're swapping a large amount or when the market is moving sharply. Pick floating otherwise.",
        ],

        'why-swap-slow' => [
            'category' => 'swapping',
            'title' => 'Why is my swap taking so long?',
            'summary' => 'It is almost always the network. Here is how to read the status and what to do.',
            'body' => "Swaps are gated on **two confirmation cycles**: yours and ours.\n\n1. **Your deposit must reach the required number of network confirmations.** This is the slow part on Bitcoin (1–6 confirmations × 10 minutes), Monero (10 confirmations × 2 minutes), or congested Ethereum.\n2. **The exchange has to settle and broadcast the payout.** That usually takes seconds to a couple of minutes.\n\nIf your status stays on *Awaiting deposit*, your transaction may not have left your wallet yet. Check your wallet for a pending state and confirm the network fee was high enough to be mined.\n\nIf your status sits on *Confirming* for more than **three hours**, your transaction is flagged for review. [Open a ticket](/help?tab=open#tickets) with the transaction ID and we'll trace it on-chain manually.",
        ],

        'network-confirmations' => [
            'category' => 'swapping',
            'title' => 'Network confirmations explained',
            'summary' => 'Why some chains take longer and what a confirmation actually is.',
            'body' => "A *confirmation* is one new block added to the blockchain on top of the block that contains your transaction. Each new block makes the transaction exponentially harder to reverse.\n\nDifferent chains have different confirmation requirements:\n\n- **Bitcoin (BTC):** 1–3 confirmations, ~10 minutes per block\n- **Ethereum (ETH/ERC20):** 30 confirmations, ~12 seconds each\n- **Tron (TRX/TRC20):** 19 confirmations, ~3 seconds each\n- **Solana (SOL):** 32 confirmations, ~400 ms each\n- **Monero (XMR):** 10 confirmations, ~2 minutes each\n\nYou can speed up *your* side by attaching a higher network fee at the time you send. You **cannot** speed up the chain itself — it confirms when it confirms.",
        ],

        'wrong-address' => [
            'category' => 'swapping',
            'title' => 'I sent to the wrong address — what now?',
            'summary' => 'What can and cannot be recovered after a misrouted deposit.',
            'body' => "There are three failure modes; the outcomes are different for each.\n\n**1. You sent to the deposit address but on the wrong network.** Example: you deposited USDT on the BNB Smart Chain to a deposit address generated for USDT on Tron. The funds are *technically* sitting on a contract that doesn't match the order. Open a ticket with the transaction ID — manual recovery is sometimes possible but always slow.\n\n**2. You sent the correct asset but to a totally unrelated address.** We can't help here — the funds reached an address we have no control over.\n\n**3. The receive address you provided was wrong.** This is the riskiest case. If our partner has already pushed the payout, we cannot reverse it. Always double-check the receive address before clicking Confirm.\n\n**Prevention:** the platform always shows the network chip (ETH / TRX / BSC) next to the ticker on Step 2. If the network on your wallet doesn't match the chip, do not send.",
        ],

        'memo-tag-required' => [
            'category' => 'swapping',
            'title' => 'Memo, tag, or destination ID required',
            'summary' => 'Some assets need a second value alongside the address. Skipping it loses funds.',
            'body' => "Certain blockchains route transfers using **two** values: the address (the same for everyone on that exchange) plus a per-customer memo, tag, or destination ID.\n\nAssets that require a memo/tag include:\n\n- **XRP (Ripple):** Destination tag\n- **XLM (Stellar):** Memo\n- **TON, EOS, Cosmos, Algorand:** Memo / note\n- **HBAR (Hedera):** Memo\n- **Some exchange-hosted USDT/USDC variants**\n\nWhen the platform detects a memo-required asset, an extra field appears on Step 2. Fill it in **exactly** as your wallet provides. If you skip it, the deposit lands at the exchange's hot wallet without instructions to credit you — and recovery requires the exchange operator's help.",
        ],

        // ── Fees & limits ──────────────────────────────────────────
        'where-fees-come-from' => [
            'category' => 'fees-limits',
            'title' => 'Where do the fees come from?',
            'summary' => "There's no separate line item. The cost is baked into the quoted rate.",
            'body' => "Three things are priced into the rate you see on the quote screen:\n\n1. **The mid-market price** — what the asset costs right now on major exchanges.\n2. **Partner spread** — typically 0.25%–0.50%. This is how our liquidity partners earn.\n3. **Network fees** — what it costs to broadcast both your deposit and our payout. These are highly volatile (Ethereum gas can spike 10× in minutes).\n\nWe **never** charge a separate service fee on top of the displayed rate. The quote you see is what you receive (within the floating-rate window, if you didn't lock the rate).\n\nFor large swaps (>$10k equivalent) ask about OTC pricing — spreads tighten significantly with size.",
        ],

        'minimums-maximums' => [
            'category' => 'fees-limits',
            'title' => 'Minimums and maximums explained',
            'summary' => 'Why each pair has its own minimum, and how the maximum is set live.',
            'body' => "**Minimums** exist for one reason: network fees. If you swap an amount smaller than the cost of broadcasting both legs of the trade, the partner loses money. The minimum varies per pair and is shown right below the amount field as soon as you set up a quote.\n\n**Maximums** are not a fixed number — they're set by available liquidity on the day. When you enter a large amount, the system checks how deep the partner order book is and surfaces an estimate. For very large amounts the quote may say *Reduced rate above X* — that's the system telling you the price will slip if you push more in.\n\nIf the maximum is too tight for what you need, you can usually split the order into two or three smaller swaps without losing much on the spread.",
        ],

        'partner-spread-explained' => [
            'category' => 'fees-limits',
            'title' => 'Why my rate differs from CoinGecko',
            'summary' => 'A few honest reasons your quoted rate is not the headline ticker price.',
            'body' => "CoinGecko and other aggregators show a *volume-weighted mid-market price* across dozens of exchanges. Your quote is what you can **actually transact** at, right now, for **your size**, factoring in:\n\n- The partner's bid-ask spread (you're always crossing the spread)\n- Network fees for both legs of the swap\n- Volatility buffer (more pronounced on floating rate)\n- Slippage for larger amounts\n\nFor major pairs (BTC↔ETH↔USDT) the difference from CoinGecko is usually **under 0.6%**. For exotic pairs or low-liquidity stables, it can be 1–2%. If you see a quote that's wildly off the headline price, refresh — the quote may be stale.",
        ],

        // ── Security ───────────────────────────────────────────────
        'non-custodial-explained' => [
            'category' => 'security',
            'title' => 'What does non-custodial really mean?',
            'summary' => 'We never hold your funds. Here is what happens behind the scenes.',
            'body' => "Custodial exchanges hold your assets in their wallets until you withdraw. Non-custodial means we **never** touch your assets in a wallet we control.\n\nWhat actually happens during a swap:\n\n1. The deposit address you see is a **temporary, single-use** smart-contract address controlled by our partner's settlement layer.\n2. The moment your deposit confirms, the asset is *atomically swapped* at our partner and the resulting asset is broadcast to **your** receive address.\n3. We hold the funds for **seconds**, never minutes, and never under a user-facing balance.\n\nBenefits: no insider risk, no withdrawal limits, no frozen accounts. Trade-off: there's no balance to recover if you send to the wrong address — that's why Step 2 has multiple confirmations.",
        ],

        'phishing-warning' => [
            'category' => 'security',
            'title' => 'Phishing and scam protection',
            'summary' => 'How to verify you are on the real site and what we will never ask.',
            'body' => "**We will never ask you to:**\n\n- Send your private keys, seed phrase, or wallet passphrase\n- Install an extension to 'connect' your wallet\n- Move funds to a 'verification address'\n- Pay a 'release fee' for a swap that's already in progress\n- Provide remote access to your computer\n\n**To verify the real site:**\n\n- Check the URL in the browser bar — bookmark the site after your first visit\n- The TLS certificate should be valid (padlock icon)\n- Our support team will only reply from the email address listed in the footer\n\nIf anyone asks for any of the above — even from an email or chat that *looks* like us — assume it's a phishing attempt. Report it via the contact form.",
        ],

        'private-keys-never-asked' => [
            'category' => 'security',
            'title' => 'We will never ask for your private keys',
            'summary' => 'No legitimate operator ever asks for your wallet seed. Ever.',
            'body' => "Your **private keys** (or recovery phrase, or seed phrase) are the only thing standing between you and total loss of your funds. Anyone who asks for them is trying to steal from you. Always.\n\nThere is **no scenario** in which a legitimate swap operator, exchange, support agent, or 'wallet validator' needs your private keys. We can complete every swap, refund, and recovery process without them.\n\nIf you've ever shared your seed with someone, treat the wallet as compromised:\n\n1. Move all funds to a new wallet generated on a clean device immediately.\n2. Stop using the compromised wallet for receiving anything.\n3. Reset all linked accounts and 2FAs.\n\nGood operational hygiene: keep your seed offline, write it down on paper or steel, never type it into a website or chat box. Ever.",
        ],

        // ── Account ────────────────────────────────────────────────
        'creating-account' => [
            'category' => 'account',
            'title' => 'Creating an account',
            'summary' => 'Optional, takes ten seconds, lets you track your swaps in one place.',
            'body' => "From the homepage click the avatar (top right) → **Sign in** → **Create an account**. We ask for:\n\n- Your email address\n- A password (minimum 12 characters)\n\nThat's it. No phone number, no name required, no documents.\n\nOnce signed in you'll see **Account → Dashboard** with:\n\n- Lifetime swap count and volume\n- Total fees paid (so you can compare to other services)\n- Your favourite pair\n- A 14-day swap chart\n- Recent transactions with one-click status refresh\n\nYour account is purely client-side — we won't use the email for marketing unless you opt in under **Account → Settings**.",
        ],

        'password-reset' => [
            'category' => 'account',
            'title' => 'Forgot password / reset',
            'summary' => 'Reset takes one email and a single click. The link is good for 60 minutes.',
            'body' => "From the [Sign in](/sign-in) page click **Forgot password?** and enter your email. We send a one-time reset link that:\n\n- Expires in 60 minutes\n- Can only be used once\n- Always lands at a URL on this domain — never copy a link from anywhere else\n\nIf the email never arrives:\n\n- Check your spam folder (whitelist the From address)\n- Confirm the email matches the one you signed up with\n- Wait two minutes — our throttle limits resets to once every two minutes per email\n\nIf you've lost access to the email address you signed up with, [open a ticket](/help?tab=open#tickets) — we can manually verify identity using historic swap details.",
        ],

        'account-deletion' => [
            'category' => 'account',
            'title' => 'Deleting my account',
            'summary' => 'Account deletion is irreversible. Here is exactly what gets erased.',
            'body' => "Go to **Account → Settings → Danger zone → Delete account**.\n\nWhat happens immediately:\n\n- Your login is disabled\n- Your email is removed from our marketing list (if you were on it)\n- Your personal profile data (name, locale, preferences) is purged\n\nWhat is preserved (and why):\n\n- Anonymised transaction records, for **5 years**, for AML / accounting compliance\n- These records can no longer be tied to your identity once your account is deleted\n\nDeletion is **irreversible** — we cannot bring an account back once it's gone. If you're unsure, sign out instead and come back later.",
        ],
    ],
];

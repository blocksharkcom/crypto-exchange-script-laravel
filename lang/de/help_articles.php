<?php

declare(strict_types=1);

return [

    'categories' => [
        'getting-started' => [
            'title' => 'Erste Schritte',
            'desc' => 'Neu auf der Plattform? Starte hier mit einer 60-Sekunden-Tour.',
            'icon' => 'rocket',
        ],
        'swapping' => [
            'title' => 'Krypto tauschen',
            'desc' => 'Alles über Paare, Kurse, Netzwerke und Bestätigungen.',
            'icon' => 'arrows',
        ],
        'fees-limits' => [
            'title' => 'Gebühren & Limits',
            'desc' => 'Wie sich Kurse zusammensetzen, Mindestbeträge und was du tatsächlich zahlst.',
            'icon' => 'scale',
        ],
        'security' => [
            'title' => 'Sicherheit & Schutz',
            'desc' => 'Warum wir nicht-verwahrend arbeiten und wie du sicher bleibst.',
            'icon' => 'shield',
        ],
        'account' => [
            'title' => 'Konto',
            'desc' => 'Optionale Konten, Passwort-Resets und persönliche Einstellungen.',
            'icon' => 'user',
        ],
    ],

    'articles' => [
        'how-crypto-swap-works' => [
            'category' => 'getting-started',
            'title' => 'Wie ein Krypto-Tausch tatsächlich funktioniert',
            'summary' => 'Vier Schritte von deiner Wallet zu deiner Wallet – keine Verwahrung, keine Mittelsmänner, keine Überraschungen.',
            'body' => "Ein Tausch auf dieser Plattform läuft in vier vorhersehbaren Schritten ab:\n\n1. **Wähle ein Paar.** Du sagst uns, was du senden möchtest (z. B. BTC) und was du erhalten willst (z. B. ETH). Wir holen den besten Live-Kurs von unseren Liquiditätspartnern.\n2. **Gib deine Empfangsadresse ein.** Du fügst die Wallet-Adresse ein, an die dein neuer Vermögenswert gehen soll. Wir halten deine Mittel *niemals* in einer verwahrenden Wallet.\n3. **Sende deine Einzahlung.** Wir erzeugen eine einmalige Einzahlungsadresse. Du überweist den exakten Betrag von deiner Wallet an diese Adresse.\n4. **Erhalte deine Mittel.** Sobald das Netzwerk deine Einzahlung bestätigt, wird der Tausch automatisch ausgeführt und der neue Vermögenswert landet auf deiner Empfangsadresse.\n\nDie meisten Tauschvorgänge sind in **5 bis 30 Minuten** abgeschlossen. Langsamere Blockchains (Bitcoin, Monero) dauern länger, einfach weil ihre Bestätigungszyklen langsamer sind.",
        ],

        'account-not-required' => [
            'category' => 'getting-started',
            'title' => 'Brauche ich ein Konto?',
            'summary' => 'Kein Konto, keine Wallet-Verbindung, keine Browser-Erweiterung. Optionale Anmeldung gibt dir einen Verlauf.',
            'body' => "Du kannst einen vollständigen Tausch durchführen, ohne jemals ein Konto anzulegen. Wir verlangen nie:\n\n- Eine E-Mail-Adresse\n- Eine Wallet-Verbindung\n- Eine Browser-Erweiterung\n- KYC-Dokumente bei üblichen Tauschgrößen\n\n**Warum sich also anmelden?** Ein optionales Konto bietet dir:\n\n- Einen Verlauf jedes Tauschs, den du gemacht hast\n- Lebenslange Gebührenverfolgung und Volumenstatistik\n- Schnelleres Checkout (wir merken uns deine bevorzugten Empfangsadressen)\n- E-Mail-Quittungen und Ticket-Antworten in einem Posteingang\n\nDie Anmeldung umfasst zwei Felder und dauert zehn Sekunden. Du kannst dein Konto jederzeit unter **Konto → Einstellungen** löschen.",
        ],

        'supported-browsers' => [
            'category' => 'getting-started',
            'title' => 'Browser- und Gerätekompatibilität',
            'summary' => 'Läuft in jedem modernen Browser, ob mobil oder Desktop. Keine App nötig.',
            'body' => "Die Plattform läuft in jedem Browser, der in den letzten 24 Monaten veröffentlicht wurde:\n\n- **Desktop:** Chrome, Edge, Safari, Firefox, Brave, Arc\n- **Mobil:** Safari (iOS 15+), Chrome (Android 10+), Samsung Internet\n\nDu brauchst keine Wallet-Erweiterung installiert zu haben – wir verlangen nie, dass dein Browser Transaktionen signiert. Alles läuft über Standard-HTTPS ohne Web3-Geklöter.\n\nWenn die Seite kaputt aussieht, lösche Cookies und probiere ein Inkognito-Fenster. Sollte sie sich weiter sonderbar verhalten, [öffne ein Ticket](/help?tab=open#tickets) und gib deine Browser-Version an.",
        ],

        // ── Swapping ────────────────────────────────────────────────
        'floating-vs-fixed' => [
            'category' => 'swapping',
            'title' => 'Floating Rate vs. Fixed Rate',
            'summary' => 'Wann du den Kurs fixierst und wann du ihn laufen lässt. Abwägungen in klarer Sprache.',
            'body' => "Jedes Tauschangebot nutzt eines von zwei Kursmodellen:\n\n**Floating Rate** (Standard) – Dein endgültiger Empfangsbetrag wird *in dem Moment berechnet, in dem deine Einzahlung auf der Chain bestätigt wird*. Bewegt sich der Markt während der Wartezeit zu deinen Gunsten, erhältst du mehr. Läuft er gegen dich, erhältst du etwas weniger. Der Spread ist **enger** als bei der Fixed Rate, sodass der angezeigte Kurs besser aussieht.\n\n**Fixed Rate** – Der Empfangsbetrag wird in dem Moment fixiert, in dem du den Tausch startest. Volatilität kann dein Ergebnis nicht beeinträchtigen. Der Spread ist **etwas weiter**, weil unsere Partner das Preisrisiko für dich absichern.\n\n**Faustregel:** Wähle Fixed Rate bei großen Beträgen oder wenn sich der Markt stark bewegt. Wähle Floating in allen anderen Fällen.",
        ],

        'why-swap-slow' => [
            'category' => 'swapping',
            'title' => 'Warum dauert mein Tausch so lange?',
            'summary' => 'Fast immer liegt es am Netzwerk. So liest du den Status und das kannst du tun.',
            'body' => "Tauschvorgänge hängen an **zwei Bestätigungszyklen**: deinem und unserem.\n\n1. **Deine Einzahlung muss die geforderte Anzahl an Netzwerkbestätigungen erreichen.** Das ist der langsame Teil bei Bitcoin (1–6 Bestätigungen × 10 Minuten), Monero (10 Bestätigungen × 2 Minuten) oder überlastetem Ethereum.\n2. **Die Börse muss abrechnen und die Auszahlung verbreiten.** Das dauert in der Regel Sekunden bis ein paar Minuten.\n\nWenn dein Status bei *Warte auf Einzahlung* bleibt, hat deine Transaktion deine Wallet möglicherweise noch nicht verlassen. Prüfe in deiner Wallet, ob ein ausstehender Status angezeigt wird, und stelle sicher, dass die Netzwerkgebühr hoch genug war, um gemined zu werden.\n\nBleibt dein Status länger als **drei Stunden** auf *Bestätige*, ist deine Transaktion zur Prüfung markiert. [Öffne ein Ticket](/help?tab=open#tickets) mit der Transaktions-ID, und wir verfolgen sie manuell on-chain.",
        ],

        'network-confirmations' => [
            'category' => 'swapping',
            'title' => 'Netzwerkbestätigungen erklärt',
            'summary' => 'Warum manche Chains länger brauchen und was eine Bestätigung wirklich ist.',
            'body' => "Eine *Bestätigung* ist ein neuer Block, der oben auf den Block der Blockchain mit deiner Transaktion hinzugefügt wird. Jeder neue Block macht es exponentiell schwerer, die Transaktion rückgängig zu machen.\n\nVerschiedene Chains haben unterschiedliche Anforderungen an Bestätigungen:\n\n- **Bitcoin (BTC):** 1–3 Bestätigungen, ~10 Minuten pro Block\n- **Ethereum (ETH/ERC20):** 30 Bestätigungen, je ~12 Sekunden\n- **Tron (TRX/TRC20):** 19 Bestätigungen, je ~3 Sekunden\n- **Solana (SOL):** 32 Bestätigungen, je ~400 ms\n- **Monero (XMR):** 10 Bestätigungen, je ~2 Minuten\n\nDu kannst *deine* Seite beschleunigen, indem du beim Senden eine höhere Netzwerkgebühr anhängst. Du **kannst** die Chain selbst nicht beschleunigen – sie bestätigt, wenn sie bestätigt.",
        ],

        'wrong-address' => [
            'category' => 'swapping',
            'title' => 'Ich habe an die falsche Adresse gesendet – was nun?',
            'summary' => 'Was nach einer falsch geleiteten Einzahlung wiederhergestellt werden kann und was nicht.',
            'body' => "Es gibt drei Fehlerarten; die Ergebnisse unterscheiden sich jeweils.\n\n**1. Du hast an die Einzahlungsadresse, aber im falschen Netzwerk gesendet.** Beispiel: Du hast USDT auf der BNB Smart Chain an eine Einzahlungsadresse für USDT auf Tron geschickt. Die Mittel liegen *technisch* in einem Vertrag, der nicht zur Order passt. Öffne ein Ticket mit der Transaktions-ID – eine manuelle Wiederherstellung ist manchmal möglich, aber immer langsam.\n\n**2. Du hast den richtigen Vermögenswert, aber an eine völlig fremde Adresse gesendet.** Hier können wir nicht helfen – die Mittel sind an eine Adresse gegangen, über die wir keine Kontrolle haben.\n\n**3. Die von dir angegebene Empfangsadresse war falsch.** Das ist der riskanteste Fall. Wenn unser Partner die Auszahlung bereits angestoßen hat, können wir sie nicht umkehren. Prüfe die Empfangsadresse immer doppelt, bevor du auf Bestätigen klickst.\n\n**Vorbeugung:** Die Plattform zeigt im Schritt 2 stets den Netzwerk-Chip (ETH / TRX / BSC) neben dem Ticker an. Wenn das Netzwerk in deiner Wallet nicht zum Chip passt, sende nicht.",
        ],

        'memo-tag-required' => [
            'category' => 'swapping',
            'title' => 'Memo, Tag oder Ziel-ID erforderlich',
            'summary' => 'Manche Vermögenswerte brauchen einen zweiten Wert neben der Adresse. Vergisst du ihn, sind die Mittel verloren.',
            'body' => "Bestimmte Blockchains leiten Überweisungen über **zwei** Werte: die Adresse (die für alle an dieser Börse gleich ist) plus ein Memo, Tag oder Ziel-ID pro Kunde.\n\nVermögenswerte, die ein Memo/Tag erfordern, sind u. a.:\n\n- **XRP (Ripple):** Destination Tag\n- **XLM (Stellar):** Memo\n- **TON, EOS, Cosmos, Algorand:** Memo / Note\n- **HBAR (Hedera):** Memo\n- **Einige börsengehostete USDT/USDC-Varianten**\n\nWenn die Plattform einen memo-pflichtigen Vermögenswert erkennt, erscheint in Schritt 2 ein zusätzliches Feld. Trage es **genau** so ein, wie deine Wallet es vorgibt. Wenn du es weglässt, landet die Einzahlung in der Hot Wallet der Börse, ohne Anweisung dich gutzuschreiben – und die Wiederherstellung benötigt die Hilfe des Börsenbetreibers.",
        ],

        // ── Fees & limits ──────────────────────────────────────────
        'where-fees-come-from' => [
            'category' => 'fees-limits',
            'title' => 'Woher kommen die Gebühren?',
            'summary' => 'Es gibt keinen separaten Posten. Die Kosten sind im angegebenen Kurs eingepreist.',
            'body' => "Drei Dinge sind in den Kurs eingepreist, den du im Angebotsbildschirm siehst:\n\n1. **Der Marktmittelpreis** – was der Vermögenswert gerade an großen Börsen kostet.\n2. **Partner-Spread** – typischerweise 0,25 %–0,50 %. So verdienen unsere Liquiditätspartner.\n3. **Netzwerkgebühren** – was es kostet, sowohl deine Einzahlung als auch unsere Auszahlung zu verbreiten. Diese sind stark volatil (Ethereum-Gas kann in Minuten um das 10-Fache springen).\n\nWir berechnen **niemals** eine separate Servicegebühr zusätzlich zum angezeigten Kurs. Das Angebot, das du siehst, ist das, was du erhältst (innerhalb des Floating-Rate-Fensters, sofern du den Kurs nicht fixiert hast).\n\nFür große Tauschvorgänge (>10 000 $ Äquivalent) frage nach OTC-Preisen – die Spreads werden mit der Größe deutlich enger.",
        ],

        'minimums-maximums' => [
            'category' => 'fees-limits',
            'title' => 'Mindest- und Höchstbeträge erklärt',
            'summary' => 'Warum jedes Paar seinen eigenen Mindestbetrag hat und wie der Höchstbetrag live festgelegt wird.',
            'body' => "**Mindestbeträge** gibt es aus einem Grund: Netzwerkgebühren. Wenn du einen Betrag tauschst, der geringer ist als die Kosten, beide Seiten der Transaktion zu verbreiten, verliert der Partner Geld. Der Mindestbetrag variiert pro Paar und wird direkt unter dem Betragsfeld angezeigt, sobald du ein Angebot einrichtest.\n\n**Höchstbeträge** sind keine feste Zahl – sie ergeben sich aus der am jeweiligen Tag verfügbaren Liquidität. Wenn du einen großen Betrag eingibst, prüft das System die Tiefe des Order-Books des Partners und zeigt eine Schätzung. Bei sehr großen Beträgen kann das Angebot *Reduzierter Kurs über X* anzeigen – das ist das System, das dir mitteilt, dass der Preis bei höheren Beträgen rutscht.\n\nWenn der Höchstbetrag für deinen Bedarf zu eng ist, kannst du den Auftrag meist in zwei oder drei kleinere Tauschvorgänge aufteilen, ohne viel am Spread zu verlieren.",
        ],

        'partner-spread-explained' => [
            'category' => 'fees-limits',
            'title' => 'Warum mein Kurs von CoinGecko abweicht',
            'summary' => 'Ein paar ehrliche Gründe, warum dein angegebener Kurs nicht dem Ticker-Preis entspricht.',
            'body' => "CoinGecko und andere Aggregatoren zeigen einen *volumengewichteten Marktmittelpreis* über dutzende Börsen. Dein Angebot ist das, was du **tatsächlich handeln** kannst, jetzt, für **deine Größe**, unter Berücksichtigung von:\n\n- Dem Bid-Ask-Spread des Partners (du überquerst den Spread immer)\n- Netzwerkgebühren für beide Seiten des Tauschs\n- Volatilitätspuffer (ausgeprägter bei Floating Rate)\n- Slippage bei größeren Beträgen\n\nFür Hauptpaare (BTC↔ETH↔USDT) liegt die Differenz zu CoinGecko in der Regel **unter 0,6 %**. Bei exotischen Paaren oder Stablecoins mit geringer Liquidität können es 1–2 % sein. Wenn du ein Angebot siehst, das stark vom Schlagzeilenpreis abweicht, aktualisiere – das Angebot kann veraltet sein.",
        ],

        // ── Security ───────────────────────────────────────────────
        'non-custodial-explained' => [
            'category' => 'security',
            'title' => 'Was bedeutet nicht-verwahrend wirklich?',
            'summary' => 'Wir halten deine Mittel nie. So läuft es hinter den Kulissen ab.',
            'body' => "Verwahrende Börsen halten deine Vermögenswerte in ihren Wallets, bis du sie abhebst. Nicht-verwahrend bedeutet, dass wir deine Vermögenswerte **niemals** in einer von uns kontrollierten Wallet anfassen.\n\nWas während eines Tauschs tatsächlich passiert:\n\n1. Die Einzahlungsadresse, die du siehst, ist eine **temporäre Smart-Contract-Adresse zur einmaligen Nutzung**, kontrolliert von der Settlement-Schicht unseres Partners.\n2. Sobald deine Einzahlung bestätigt wird, wird der Vermögenswert bei unserem Partner *atomar* getauscht und der resultierende Vermögenswert an **deine** Empfangsadresse gesendet.\n3. Wir halten die Mittel für **Sekunden**, nie für Minuten, und nie unter einem für den Nutzer sichtbaren Guthaben.\n\nVorteile: kein Insider-Risiko, keine Auszahlungslimits, keine eingefrorenen Konten. Kehrseite: Wenn du an die falsche Adresse sendest, gibt es kein Guthaben zur Wiederherstellung – deshalb hat Schritt 2 mehrere Bestätigungen.",
        ],

        'phishing-warning' => [
            'category' => 'security',
            'title' => 'Schutz vor Phishing und Betrug',
            'summary' => 'So überprüfst du, ob du auf der echten Seite bist, und was wir niemals verlangen werden.',
            'body' => "**Wir werden dich niemals bitten:**\n\n- Deine privaten Schlüssel, Seed-Phrase oder Wallet-Passphrase zu senden\n- Eine Erweiterung zu installieren, um deine Wallet zu „verbinden“\n- Mittel an eine „Verifizierungsadresse“ zu verschieben\n- Eine „Freigabegebühr“ für einen bereits laufenden Tausch zu zahlen\n- Fernzugriff auf deinen Computer zu gewähren\n\n**So überprüfst du die echte Seite:**\n\n- Prüfe die URL in der Browserleiste – setze nach deinem ersten Besuch ein Lesezeichen\n- Das TLS-Zertifikat sollte gültig sein (Schloss-Symbol)\n- Unser Support-Team antwortet nur von der im Footer angegebenen E-Mail-Adresse\n\nWenn jemand nach einem dieser Dinge fragt – selbst aus einer E-Mail oder einem Chat, der *wie* wir *aussieht* – nimm einen Phishing-Versuch an. Melde es über das Kontaktformular.",
        ],

        'private-keys-never-asked' => [
            'category' => 'security',
            'title' => 'Wir werden niemals nach deinen privaten Schlüsseln fragen',
            'summary' => 'Kein seriöser Betreiber fragt jemals nach deinem Wallet-Seed. Niemals.',
            'body' => "Deine **privaten Schlüssel** (oder Wiederherstellungsphrase, oder Seed-Phrase) sind das Einzige, was zwischen dir und dem Totalverlust deiner Mittel steht. Wer danach fragt, will dich bestehlen. Immer.\n\nEs gibt **kein Szenario**, in dem ein seriöser Tausch-Betreiber, eine Börse, ein Support-Mitarbeiter oder ein „Wallet-Validierer“ deine privaten Schlüssel benötigt. Wir können jeden Tausch-, Rückerstattungs- und Wiederherstellungsprozess auch ohne sie abschließen.\n\nWenn du deinen Seed jemals mit jemandem geteilt hast, behandle die Wallet als kompromittiert:\n\n1. Verschiebe sofort alle Mittel in eine neue Wallet, erzeugt auf einem sauberen Gerät.\n2. Verwende die kompromittierte Wallet nicht mehr zum Empfangen.\n3. Setze alle verknüpften Konten und 2FAs zurück.\n\nGute Betriebshygiene: Bewahre deinen Seed offline auf, schreibe ihn auf Papier oder Stahl, gib ihn niemals in eine Website oder ein Chatfeld ein. Niemals.",
        ],

        // ── Account ────────────────────────────────────────────────
        'creating-account' => [
            'category' => 'account',
            'title' => 'Ein Konto erstellen',
            'summary' => 'Optional, dauert zehn Sekunden, lässt dich deine Tauschvorgänge an einem Ort verfolgen.',
            'body' => "Klicke auf der Startseite auf den Avatar (oben rechts) → **Anmelden** → **Konto erstellen**. Wir fragen nach:\n\n- Deiner E-Mail-Adresse\n- Einem Passwort (mindestens 12 Zeichen)\n\nDas war's. Keine Telefonnummer, kein Name erforderlich, keine Dokumente.\n\nNach der Anmeldung siehst du **Konto → Dashboard** mit:\n\n- Lebenslange Tauschanzahl und Volumen\n- Insgesamt gezahlte Gebühren (für den Vergleich mit anderen Diensten)\n- Dein Lieblingspaar\n- Eine 14-Tage-Tauschgrafik\n- Neueste Transaktionen mit Statusaktualisierung per Klick\n\nDein Konto ist rein clientseitig – wir verwenden die E-Mail nicht für Marketing, es sei denn, du stimmst unter **Konto → Einstellungen** zu.",
        ],

        'password-reset' => [
            'category' => 'account',
            'title' => 'Passwort vergessen / zurücksetzen',
            'summary' => 'Zurücksetzen braucht eine E-Mail und einen einzigen Klick. Der Link ist 60 Minuten gültig.',
            'body' => "Klicke auf der [Anmelde](/sign-in)-Seite auf **Passwort vergessen?** und gib deine E-Mail ein. Wir senden dir einen einmaligen Reset-Link, der:\n\n- In 60 Minuten abläuft\n- Nur einmal verwendet werden kann\n- Immer auf eine URL dieser Domain führt – kopiere niemals einen Link von woanders\n\nWenn die E-Mail nicht ankommt:\n\n- Schau im Spam-Ordner nach (setze den Absender auf die Whitelist)\n- Bestätige, dass die E-Mail mit der bei der Registrierung verwendeten übereinstimmt\n- Warte zwei Minuten – unsere Drosselung begrenzt Resets auf einmal alle zwei Minuten pro E-Mail\n\nWenn du den Zugang zu der bei der Registrierung verwendeten E-Mail-Adresse verloren hast, [öffne ein Ticket](/help?tab=open#tickets) – wir können die Identität manuell anhand früherer Tauschdetails überprüfen.",
        ],

        'account-deletion' => [
            'category' => 'account',
            'title' => 'Mein Konto löschen',
            'summary' => 'Die Kontolöschung ist unwiderruflich. Hier ist genau, was gelöscht wird.',
            'body' => "Gehe zu **Konto → Einstellungen → Gefahrenbereich → Konto löschen**.\n\nWas sofort passiert:\n\n- Deine Anmeldung wird deaktiviert\n- Deine E-Mail wird aus unserer Marketingliste entfernt (falls du dort warst)\n- Deine persönlichen Profildaten (Name, Sprache, Einstellungen) werden gelöscht\n\nWas erhalten bleibt (und warum):\n\n- Anonymisierte Transaktionsaufzeichnungen, **5 Jahre lang**, zur AML- / Buchhaltungs-Compliance\n- Diese Aufzeichnungen können nach Löschung deines Kontos nicht mehr mit deiner Identität verknüpft werden\n\nDie Löschung ist **unwiderruflich** – wir können ein Konto nicht zurückholen, wenn es weg ist. Wenn du unsicher bist, melde dich stattdessen ab und komm später wieder.",
        ],
    ],
];

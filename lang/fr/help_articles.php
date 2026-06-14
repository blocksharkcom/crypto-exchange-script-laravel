<?php

declare(strict_types=1);

return [

    'categories' => [
        'getting-started' => [
            'title' => 'Premiers pas',
            'desc' => 'Nouveau sur la plateforme ? Commence ici par une visite en 60 secondes.',
            'icon' => 'rocket',
        ],
        'swapping' => [
            'title' => 'Échanger des cryptos',
            'desc' => 'Tout sur les paires, les taux, les réseaux et les confirmations.',
            'icon' => 'arrows',
        ],
        'fees-limits' => [
            'title' => 'Frais et limites',
            'desc' => 'Comment les taux sont construits, les minimums et ce que tu paies vraiment.',
            'icon' => 'scale',
        ],
        'security' => [
            'title' => 'Sécurité et protection',
            'desc' => 'Pourquoi nous sommes non dépositaires et comment rester en sécurité.',
            'icon' => 'shield',
        ],
        'account' => [
            'title' => 'Compte',
            'desc' => 'Comptes optionnels, réinitialisation de mot de passe et préférences personnelles.',
            'icon' => 'user',
        ],
    ],

    'articles' => [
        'how-crypto-swap-works' => [
            'category' => 'getting-started',
            'title' => 'Comment un échange de cryptos fonctionne vraiment',
            'summary' => 'Quatre étapes de ton portefeuille à ton portefeuille — sans dépôt, sans intermédiaire, sans surprise.',
            'body' => "Un échange sur cette plateforme suit quatre étapes prévisibles :\n\n1. **Choisis une paire.** Tu nous dis ce que tu veux envoyer (par ex. BTC) et ce que tu veux recevoir (par ex. ETH). Nous récupérons le meilleur taux en direct auprès de nos partenaires de liquidité.\n2. **Saisis ton adresse de réception.** Tu colles l'adresse du portefeuille où ton nouvel actif doit arriver. Nous *ne* conservons *jamais* tes fonds dans un portefeuille dépositaire.\n3. **Envoie ton dépôt.** Nous générons une adresse de dépôt unique à usage unique. Tu transfères le montant exact depuis ton portefeuille vers cette adresse.\n4. **Reçois tes fonds.** Une fois ton dépôt confirmé par le réseau, l'échange s'exécute automatiquement et le nouvel actif arrive à ton adresse de réception.\n\nLa plupart des échanges se terminent en **5 à 30 minutes**. Les blockchains plus lentes (Bitcoin, Monero) prennent plus de temps simplement parce que leurs cycles de confirmation sont plus lents.",
        ],

        'account-not-required' => [
            'category' => 'getting-started',
            'title' => "Ai-je besoin d'un compte ?",
            'summary' => "Pas de compte, pas de connexion de portefeuille, pas d'extension de navigateur. L'inscription optionnelle te donne un historique.",
            'body' => "Tu peux réaliser un échange complet sans jamais créer de compte. Nous n'exigeons jamais :\n\n- Une adresse e-mail\n- Une connexion de portefeuille\n- Une extension de navigateur\n- De documents KYC pour des tailles d'échange habituelles\n\n**Pourquoi s'inscrire alors ?** Un compte optionnel t'offre :\n\n- Un historique de chaque échange que tu as effectué\n- Un suivi à vie des frais et des statistiques de volume\n- Un paiement plus rapide (nous mémorisons tes adresses de réception préférées)\n- Les reçus par e-mail et les réponses aux tickets dans une seule boîte de réception\n\nL'inscription tient en deux champs et prend dix secondes. Tu peux supprimer ton compte à tout moment depuis **Compte → Paramètres**.",
        ],

        'supported-browsers' => [
            'category' => 'getting-started',
            'title' => 'Compatibilité des navigateurs et des appareils',
            'summary' => 'Fonctionne sur tout navigateur moderne, mobile ou bureau. Aucune application requise.',
            'body' => "La plateforme tourne sur tout navigateur sorti au cours des 24 derniers mois :\n\n- **Bureau :** Chrome, Edge, Safari, Firefox, Brave, Arc\n- **Mobile :** Safari (iOS 15+), Chrome (Android 10+), Samsung Internet\n\nTu n'as pas besoin d'une extension de portefeuille installée — nous ne demandons jamais à ton navigateur de signer des transactions. Tout se passe en HTTPS standard, sans plomberie Web3.\n\nSi la page semble cassée, supprime les cookies et essaie une fenêtre de navigation privée. Si le problème persiste, [ouvre un ticket](/help?tab=open#tickets) en indiquant la version de ton navigateur.",
        ],

        // ── Swapping ────────────────────────────────────────────────
        'floating-vs-fixed' => [
            'category' => 'swapping',
            'title' => 'Taux flottant ou taux fixe',
            'summary' => 'Quand verrouiller le taux et quand le laisser courir. Les compromis en clair.',
            'body' => "Chaque devis d'échange utilise l'un des deux modèles de taux :\n\n**Taux flottant** (par défaut) — Ton montant final de réception est calculé *au moment où ton dépôt est confirmé sur la chaîne*. Si le marché évolue en ta faveur pendant l'attente, tu reçois plus. S'il évolue contre toi, tu reçois un peu moins. L'écart est **plus serré** qu'avec le taux fixe, donc le taux affiché semble meilleur.\n\n**Taux fixe** — Le montant de réception est verrouillé dès l'instant où tu lances l'échange. La volatilité ne peut pas grignoter ton résultat. L'écart est **un peu plus large** car nos partenaires couvrent le risque de prix pour toi.\n\n**Règle empirique :** choisis le taux fixe pour un gros montant ou quand le marché bouge fortement. Sinon, choisis le flottant.",
        ],

        'why-swap-slow' => [
            'category' => 'swapping',
            'title' => 'Pourquoi mon échange prend-il autant de temps ?',
            'summary' => "C'est presque toujours le réseau. Voici comment lire le statut et que faire.",
            'body' => "Les échanges dépendent de **deux cycles de confirmation** : le tien et le nôtre.\n\n1. **Ton dépôt doit atteindre le nombre requis de confirmations du réseau.** C'est la partie lente sur Bitcoin (1–6 confirmations × 10 minutes), Monero (10 confirmations × 2 minutes) ou Ethereum congestionné.\n2. **L'échange doit régler et diffuser le paiement.** Cela prend en général quelques secondes à quelques minutes.\n\nSi ton statut reste sur *En attente de dépôt*, ta transaction n'a peut-être pas encore quitté ton portefeuille. Vérifie l'état en attente dans ton portefeuille et assure-toi que les frais de réseau étaient assez élevés pour être minés.\n\nSi ton statut reste sur *Confirmation* plus de **trois heures**, ta transaction est marquée pour examen. [Ouvre un ticket](/help?tab=open#tickets) avec l'ID de transaction et nous la suivrons manuellement on-chain.",
        ],

        'network-confirmations' => [
            'category' => 'swapping',
            'title' => 'Les confirmations réseau expliquées',
            'summary' => "Pourquoi certaines chaînes sont plus lentes et ce qu'est vraiment une confirmation.",
            'body' => "Une *confirmation* est un nouveau bloc ajouté à la blockchain au-dessus du bloc contenant ta transaction. Chaque nouveau bloc rend la transaction exponentiellement plus difficile à annuler.\n\nLes différentes chaînes ont des exigences de confirmation différentes :\n\n- **Bitcoin (BTC) :** 1–3 confirmations, ~10 minutes par bloc\n- **Ethereum (ETH/ERC20) :** 30 confirmations, ~12 secondes chacune\n- **Tron (TRX/TRC20) :** 19 confirmations, ~3 secondes chacune\n- **Solana (SOL) :** 32 confirmations, ~400 ms chacune\n- **Monero (XMR) :** 10 confirmations, ~2 minutes chacune\n\nTu peux accélérer *ton* côté en attachant des frais de réseau plus élevés au moment de l'envoi. Tu **ne peux pas** accélérer la chaîne elle-même — elle confirme quand elle confirme.",
        ],

        'wrong-address' => [
            'category' => 'swapping',
            'title' => "J'ai envoyé à la mauvaise adresse — que faire ?",
            'summary' => 'Ce qui peut et ne peut pas être récupéré après un dépôt mal acheminé.',
            'body' => "Il y a trois modes d'échec, avec des issues différentes pour chacun.\n\n**1. Tu as envoyé à l'adresse de dépôt mais sur le mauvais réseau.** Exemple : tu as déposé de l'USDT sur BNB Smart Chain à une adresse de dépôt générée pour de l'USDT sur Tron. Les fonds sont *techniquement* sur un contrat qui ne correspond pas à l'ordre. Ouvre un ticket avec l'ID de transaction — la récupération manuelle est parfois possible mais toujours lente.\n\n**2. Tu as envoyé le bon actif mais à une adresse totalement sans rapport.** Nous ne pouvons rien faire ici — les fonds ont atteint une adresse que nous ne contrôlons pas.\n\n**3. L'adresse de réception que tu as indiquée était erronée.** C'est le cas le plus risqué. Si notre partenaire a déjà émis le paiement, nous ne pouvons pas l'inverser. Vérifie toujours deux fois l'adresse de réception avant de cliquer sur Confirmer.\n\n**Prévention :** la plateforme affiche toujours la pastille du réseau (ETH / TRX / BSC) à côté du ticker à l'étape 2. Si le réseau dans ton portefeuille ne correspond pas à la pastille, n'envoie pas.",
        ],

        'memo-tag-required' => [
            'category' => 'swapping',
            'title' => 'Memo, tag ou ID de destination requis',
            'summary' => "Certains actifs nécessitent une seconde valeur en plus de l'adresse. L'omettre fait perdre les fonds.",
            'body' => "Certaines blockchains acheminent les transferts en utilisant **deux** valeurs : l'adresse (la même pour tout le monde sur cet échange) plus un memo, tag ou ID de destination par client.\n\nLes actifs qui nécessitent un memo/tag incluent :\n\n- **XRP (Ripple) :** Destination tag\n- **XLM (Stellar) :** Memo\n- **TON, EOS, Cosmos, Algorand :** Memo / note\n- **HBAR (Hedera) :** Memo\n- **Certaines variantes USDT/USDC hébergées par des exchanges**\n\nQuand la plateforme détecte un actif nécessitant un memo, un champ supplémentaire apparaît à l'étape 2. Remplis-le **exactement** comme ton portefeuille te le fournit. Si tu l'omets, le dépôt arrive sur le portefeuille chaud de l'exchange sans instruction pour te le créditer — et la récupération nécessite l'aide de l'opérateur de l'exchange.",
        ],

        // ── Fees & limits ──────────────────────────────────────────
        'where-fees-come-from' => [
            'category' => 'fees-limits',
            'title' => "D'où viennent les frais ?",
            'summary' => 'Aucune ligne séparée. Le coût est intégré dans le taux affiché.',
            'body' => "Trois éléments sont intégrés au taux que tu vois sur l'écran de devis :\n\n1. **Le prix médian du marché** — ce que coûte l'actif en ce moment sur les grands exchanges.\n2. **Écart partenaire** — généralement 0,25 %–0,50 %. C'est ainsi que nos partenaires de liquidité se rémunèrent.\n3. **Frais de réseau** — ce que coûte la diffusion de ton dépôt et de notre paiement. Ils sont très volatils (le gas d'Ethereum peut bondir de 10× en quelques minutes).\n\nNous **ne facturons jamais** de frais de service séparés en plus du taux affiché. Le devis que tu vois correspond à ce que tu reçois (dans la fenêtre du taux flottant, si tu n'as pas verrouillé le taux).\n\nPour les gros échanges (>10 000 $ équivalent), renseigne-toi sur les prix OTC — les écarts se resserrent significativement avec la taille.",
        ],

        'minimums-maximums' => [
            'category' => 'fees-limits',
            'title' => 'Minimums et maximums expliqués',
            'summary' => 'Pourquoi chaque paire a son propre minimum et comment le maximum est fixé en direct.',
            'body' => "Les **minimums** existent pour une raison : les frais de réseau. Si tu échanges un montant inférieur au coût de diffusion des deux jambes de la transaction, le partenaire perd de l'argent. Le minimum varie selon la paire et s'affiche juste sous le champ du montant dès que tu prépares un devis.\n\nLes **maximums** ne sont pas un chiffre fixe — ils sont définis par la liquidité disponible du jour. Quand tu saisis un gros montant, le système vérifie la profondeur du carnet d'ordres du partenaire et affiche une estimation. Pour de très gros montants, le devis peut indiquer *Taux réduit au-dessus de X* — c'est le système qui te dit que le prix glissera si tu pousses davantage.\n\nSi le maximum est trop serré pour tes besoins, tu peux généralement scinder l'ordre en deux ou trois échanges plus petits sans perdre beaucoup sur l'écart.",
        ],

        'partner-spread-explained' => [
            'category' => 'fees-limits',
            'title' => 'Pourquoi mon taux diffère de CoinGecko',
            'summary' => 'Quelques raisons honnêtes qui expliquent que ton taux affiché ne corresponde pas au prix du ticker.',
            'body' => "CoinGecko et d'autres agrégateurs affichent un *prix médian du marché pondéré par volume* sur des dizaines d'exchanges. Ton devis correspond à ce que tu peux **réellement traiter** maintenant, pour **ta taille**, en tenant compte :\n\n- De l'écart bid-ask du partenaire (tu traverses toujours l'écart)\n- Des frais de réseau pour les deux jambes de l'échange\n- Du tampon de volatilité (plus marqué avec le taux flottant)\n- Du slippage pour des montants plus importants\n\nPour les paires majeures (BTC↔ETH↔USDT), la différence avec CoinGecko est généralement **inférieure à 0,6 %**. Pour les paires exotiques ou les stablecoins peu liquides, elle peut atteindre 1–2 %. Si tu vois un devis très éloigné du prix affiché, rafraîchis — le devis est peut-être périmé.",
        ],

        // ── Security ───────────────────────────────────────────────
        'non-custodial-explained' => [
            'category' => 'security',
            'title' => 'Que signifie vraiment non dépositaire ?',
            'summary' => 'Nous ne détenons jamais tes fonds. Voici ce qui se passe en coulisses.',
            'body' => "Les exchanges dépositaires conservent tes actifs dans leurs portefeuilles jusqu'à ce que tu retires. Non dépositaire signifie que nous **ne touchons jamais** tes actifs dans un portefeuille que nous contrôlons.\n\nCe qui se passe réellement pendant un échange :\n\n1. L'adresse de dépôt que tu vois est une adresse de smart contract **temporaire et à usage unique**, contrôlée par la couche de règlement de notre partenaire.\n2. Dès que ton dépôt est confirmé, l'actif est échangé *atomiquement* chez notre partenaire et l'actif résultant est diffusé vers **ton** adresse de réception.\n3. Nous détenons les fonds pendant des **secondes**, jamais des minutes, et jamais sous un solde visible pour l'utilisateur.\n\nAvantages : pas de risque interne, pas de limites de retrait, pas de comptes gelés. En contrepartie : il n'y a pas de solde à récupérer si tu envoies à la mauvaise adresse — c'est pour cela que l'étape 2 contient plusieurs confirmations.",
        ],

        'phishing-warning' => [
            'category' => 'security',
            'title' => 'Protection contre le phishing et les arnaques',
            'summary' => 'Comment vérifier que tu es sur le vrai site et ce que nous ne te demanderons jamais.',
            'body' => "**Nous ne te demanderons jamais de :**\n\n- Envoyer tes clés privées, phrase de récupération ou passphrase de portefeuille\n- Installer une extension pour « connecter » ton portefeuille\n- Déplacer des fonds vers une « adresse de vérification »\n- Payer des « frais de libération » pour un échange déjà en cours\n- Accorder un accès distant à ton ordinateur\n\n**Pour vérifier le vrai site :**\n\n- Vérifie l'URL dans la barre du navigateur — mets le site en favori après ta première visite\n- Le certificat TLS doit être valide (icône du cadenas)\n- Notre équipe de support ne répondra qu'à partir de l'adresse e-mail indiquée dans le pied de page\n\nSi quelqu'un demande l'une de ces choses — même depuis un e-mail ou un chat qui *ressemble* à nous — considère qu'il s'agit d'une tentative de phishing. Signale-le via le formulaire de contact.",
        ],

        'private-keys-never-asked' => [
            'category' => 'security',
            'title' => 'Nous ne demanderons jamais tes clés privées',
            'summary' => 'Aucun opérateur légitime ne demande jamais la phrase de récupération de ton portefeuille. Jamais.',
            'body' => "Tes **clés privées** (ou phrase de récupération, ou seed phrase) sont la seule chose qui se dresse entre toi et la perte totale de tes fonds. Quiconque te les demande essaie de te voler. Toujours.\n\nIl **n'existe aucun scénario** dans lequel un opérateur d'échange légitime, un exchange, un agent de support ou un « validateur de portefeuille » aurait besoin de tes clés privées. Nous pouvons réaliser tout échange, remboursement et processus de récupération sans elles.\n\nSi tu as déjà partagé ta phrase de récupération avec quelqu'un, considère le portefeuille comme compromis :\n\n1. Déplace immédiatement tous les fonds vers un nouveau portefeuille généré sur un appareil sain.\n2. Cesse d'utiliser le portefeuille compromis pour recevoir quoi que ce soit.\n3. Réinitialise tous les comptes liés et les 2FA.\n\nBonne hygiène opérationnelle : conserve ta phrase hors ligne, écris-la sur papier ou sur acier, ne la tape jamais dans un site web ou une zone de chat. Jamais.",
        ],

        // ── Account ────────────────────────────────────────────────
        'creating-account' => [
            'category' => 'account',
            'title' => 'Créer un compte',
            'summary' => 'Optionnel, prend dix secondes, et te permet de suivre tes échanges au même endroit.',
            'body' => "Depuis la page d'accueil, clique sur l'avatar (en haut à droite) → **Se connecter** → **Créer un compte**. Nous te demandons :\n\n- Ton adresse e-mail\n- Un mot de passe (12 caractères minimum)\n\nC'est tout. Pas de numéro de téléphone, pas de nom requis, pas de documents.\n\nUne fois connecté, tu verras **Compte → Tableau de bord** avec :\n\n- Nombre d'échanges et volume à vie\n- Total des frais payés (pour comparer avec d'autres services)\n- Ta paire favorite\n- Un graphique d'échanges sur 14 jours\n- Les transactions récentes avec actualisation du statut en un clic\n\nTon compte est purement côté client — nous n'utiliserons pas l'e-mail à des fins de marketing sauf si tu t'inscris explicitement dans **Compte → Paramètres**.",
        ],

        'password-reset' => [
            'category' => 'account',
            'title' => 'Mot de passe oublié / réinitialisation',
            'summary' => 'La réinitialisation tient en un e-mail et un seul clic. Le lien est valable 60 minutes.',
            'body' => "Depuis la page de [Connexion](/sign-in), clique sur **Mot de passe oublié ?** et saisis ton e-mail. Nous envoyons un lien de réinitialisation à usage unique qui :\n\n- Expire dans 60 minutes\n- Ne peut être utilisé qu'une seule fois\n- Pointe toujours vers une URL de ce domaine — ne copie jamais un lien venant d'ailleurs\n\nSi l'e-mail n'arrive jamais :\n\n- Vérifie ton dossier spam (mets l'expéditeur en liste blanche)\n- Confirme que l'e-mail correspond à celui utilisé à l'inscription\n- Attends deux minutes — notre limitation autorise une réinitialisation toutes les deux minutes par e-mail\n\nSi tu as perdu l'accès à l'adresse e-mail avec laquelle tu t'es inscrit, [ouvre un ticket](/help?tab=open#tickets) — nous pouvons vérifier ton identité manuellement à l'aide des détails historiques de tes échanges.",
        ],

        'account-deletion' => [
            'category' => 'account',
            'title' => 'Supprimer mon compte',
            'summary' => 'La suppression de compte est irréversible. Voici exactement ce qui est effacé.',
            'body' => "Va dans **Compte → Paramètres → Zone de danger → Supprimer le compte**.\n\nCe qui se passe immédiatement :\n\n- Ton identifiant de connexion est désactivé\n- Ton e-mail est retiré de notre liste marketing (si tu y figurais)\n- Tes données de profil personnelles (nom, langue, préférences) sont purgées\n\nCe qui est conservé (et pourquoi) :\n\n- Les enregistrements de transactions anonymisés, pendant **5 ans**, pour la conformité AML / comptable\n- Ces enregistrements ne peuvent plus être liés à ton identité une fois ton compte supprimé\n\nLa suppression est **irréversible** — nous ne pouvons pas récupérer un compte une fois supprimé. En cas de doute, déconnecte-toi plutôt et reviens plus tard.",
        ],
    ],
];

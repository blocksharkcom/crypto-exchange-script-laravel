<?php

declare(strict_types=1);

return [

    'categories' => [
        'getting-started' => [
            'title' => 'Primeros pasos',
            'desc' => '¿Nuevo en la plataforma? Empieza aquí con un recorrido de 60 segundos.',
            'icon' => 'rocket',
        ],
        'swapping' => [
            'title' => 'Intercambios de cripto',
            'desc' => 'Todo sobre pares, tasas, redes y confirmaciones.',
            'icon' => 'arrows',
        ],
        'fees-limits' => [
            'title' => 'Comisiones y límites',
            'desc' => 'Cómo se forman las tasas, mínimos y lo que realmente pagas.',
            'icon' => 'scale',
        ],
        'security' => [
            'title' => 'Seguridad y protección',
            'desc' => 'Por qué somos no custodios y cómo mantenerte seguro.',
            'icon' => 'shield',
        ],
        'account' => [
            'title' => 'Cuenta',
            'desc' => 'Cuentas opcionales, restablecimiento de contraseñas y preferencias personales.',
            'icon' => 'user',
        ],
    ],

    'articles' => [
        'how-crypto-swap-works' => [
            'category' => 'getting-started',
            'title' => 'Cómo funciona realmente un intercambio de cripto',
            'summary' => 'Cuatro pasos de tu cartera a tu cartera: sin custodia, sin intermediarios, sin sorpresas.',
            'body' => "Un intercambio en esta plataforma sigue cuatro pasos predecibles:\n\n1. **Elige un par.** Nos dices qué quieres enviar (p. ej. BTC) y qué quieres recibir (p. ej. ETH). Obtenemos la mejor tasa en vivo de nuestros socios de liquidez.\n2. **Introduce tu dirección de recepción.** Pegas la dirección de la cartera donde debe llegar tu nuevo activo. *Nunca* guardamos tus fondos en una cartera custodial.\n3. **Envía tu depósito.** Generamos una dirección de depósito única de un solo uso. Transfieres el importe exacto desde tu cartera a esa dirección.\n4. **Recibe tus fondos.** Una vez que la red confirma tu depósito, el intercambio se ejecuta automáticamente y el nuevo activo llega a tu dirección de recepción.\n\nLa mayoría de los intercambios se completan en **5 a 30 minutos**. Las cadenas más lentas (Bitcoin, Monero) tardan más simplemente porque sus ciclos de confirmación son más lentos.",
        ],

        'account-not-required' => [
            'category' => 'getting-started',
            'title' => '¿Necesito una cuenta?',
            'summary' => 'Sin cuenta, sin conexión de cartera, sin extensión del navegador. El registro opcional te da historial.',
            'body' => "Puedes completar un intercambio entero sin crear nunca una cuenta. Nunca exigimos:\n\n- Una dirección de correo electrónico\n- Una conexión de cartera\n- Una extensión del navegador\n- Documentos KYC para tamaños de intercambio habituales\n\n**Entonces, ¿por qué registrarse?** Una cuenta opcional te ofrece:\n\n- Un historial de cada intercambio que has hecho\n- Seguimiento vitalicio de comisiones y estadísticas de volumen\n- Pago más rápido (recordamos tus direcciones de recepción preferidas)\n- Recibos por correo y respuestas a tickets en una sola bandeja de entrada\n\nEl registro son dos campos y tarda diez segundos. Puedes eliminar tu cuenta en cualquier momento desde **Cuenta → Ajustes**.",
        ],

        'supported-browsers' => [
            'category' => 'getting-started',
            'title' => 'Compatibilidad de navegadores y dispositivos',
            'summary' => 'Funciona en cualquier navegador moderno, móvil o de escritorio. No necesitas app.',
            'body' => "La plataforma funciona en cualquier navegador lanzado en los últimos 24 meses:\n\n- **Escritorio:** Chrome, Edge, Safari, Firefox, Brave, Arc\n- **Móvil:** Safari (iOS 15+), Chrome (Android 10+), Samsung Internet\n\nNo necesitas tener instalada una extensión de cartera: nunca pedimos a tu navegador que firme transacciones. Todo sucede en HTTPS estándar, sin canalizaciones Web3.\n\nSi la página parece rota, borra las cookies y prueba una ventana de incógnito. Si sigue fallando, [abre un ticket](/help?tab=open#tickets) e incluye la versión de tu navegador.",
        ],

        // ── Swapping ────────────────────────────────────────────────
        'floating-vs-fixed' => [
            'category' => 'swapping',
            'title' => 'Tasa flotante frente a tasa fija',
            'summary' => 'Cuándo bloquear la tasa y cuándo dejarla correr. Compensaciones explicadas con claridad.',
            'body' => "Cada cotización de intercambio utiliza uno de los dos modelos de tasa:\n\n**Tasa flotante** (por defecto): tu importe final de recepción se calcula *en el momento en que tu depósito se confirma en la cadena*. Si el mercado se mueve a tu favor durante la espera, recibes más. Si se mueve en contra, recibes algo menos. El diferencial es **más ajustado** que en la tasa fija, por lo que la tasa principal parece mejor.\n\n**Tasa fija**: el importe de recepción se bloquea en el instante en que inicias el intercambio. La volatilidad no puede comerse tu resultado. El diferencial es **algo más amplio** porque nuestros socios cubren el riesgo de precio por ti.\n\n**Regla práctica:** elige tasa fija cuando intercambies un importe grande o cuando el mercado se mueva bruscamente. Elige flotante en los demás casos.",
        ],

        'why-swap-slow' => [
            'category' => 'swapping',
            'title' => '¿Por qué tarda tanto mi intercambio?',
            'summary' => 'Casi siempre es la red. Te explicamos cómo leer el estado y qué hacer.',
            'body' => "Los intercambios dependen de **dos ciclos de confirmación**: el tuyo y el nuestro.\n\n1. **Tu depósito debe alcanzar el número requerido de confirmaciones de la red.** Esta es la parte lenta en Bitcoin (1–6 confirmaciones × 10 minutos), Monero (10 confirmaciones × 2 minutos) o Ethereum congestionado.\n2. **El exchange tiene que liquidar y difundir el pago.** Eso suele tardar de segundos a un par de minutos.\n\nSi tu estado se queda en *A la espera del depósito*, puede que tu transacción aún no haya salido de tu cartera. Comprueba si tu cartera muestra un estado pendiente y confirma que la comisión de red fue suficiente para ser minada.\n\nSi tu estado permanece en *Confirmando* más de **tres horas**, tu transacción está marcada para revisión. [Abre un ticket](/help?tab=open#tickets) con el ID de la transacción y la rastrearemos manualmente en cadena.",
        ],

        'network-confirmations' => [
            'category' => 'swapping',
            'title' => 'Confirmaciones de red explicadas',
            'summary' => 'Por qué algunas cadenas tardan más y qué es realmente una confirmación.',
            'body' => "Una *confirmación* es un nuevo bloque añadido a la blockchain encima del bloque que contiene tu transacción. Cada nuevo bloque hace que la transacción sea exponencialmente más difícil de revertir.\n\nCada cadena tiene requisitos de confirmación distintos:\n\n- **Bitcoin (BTC):** 1–3 confirmaciones, ~10 minutos por bloque\n- **Ethereum (ETH/ERC20):** 30 confirmaciones, ~12 segundos cada una\n- **Tron (TRX/TRC20):** 19 confirmaciones, ~3 segundos cada una\n- **Solana (SOL):** 32 confirmaciones, ~400 ms cada una\n- **Monero (XMR):** 10 confirmaciones, ~2 minutos cada una\n\nPuedes acelerar *tu* parte adjuntando una comisión de red más alta al enviar. **No puedes** acelerar la cadena en sí: confirma cuando confirma.",
        ],

        'wrong-address' => [
            'category' => 'swapping',
            'title' => 'Envié a la dirección equivocada: ¿qué hago ahora?',
            'summary' => 'Qué se puede y qué no se puede recuperar tras un depósito mal enrutado.',
            'body' => "Hay tres modos de fallo; los resultados son diferentes en cada caso.\n\n**1. Enviaste a la dirección de depósito pero en la red equivocada.** Ejemplo: depositaste USDT en BNB Smart Chain en una dirección generada para USDT en Tron. Los fondos están *técnicamente* en un contrato que no coincide con la orden. Abre un ticket con el ID de la transacción: la recuperación manual es a veces posible, pero siempre lenta.\n\n**2. Enviaste el activo correcto pero a una dirección totalmente ajena.** No podemos ayudar aquí: los fondos llegaron a una dirección que no controlamos.\n\n**3. La dirección de recepción que indicaste era errónea.** Este es el caso más arriesgado. Si nuestro socio ya ha enviado el pago, no podemos revertirlo. Comprueba siempre dos veces la dirección de recepción antes de pulsar Confirmar.\n\n**Prevención:** la plataforma siempre muestra la etiqueta de red (ETH / TRX / BSC) junto al ticker en el Paso 2. Si la red de tu cartera no coincide con la etiqueta, no envíes.",
        ],

        'memo-tag-required' => [
            'category' => 'swapping',
            'title' => 'Memo, tag o ID de destino obligatorios',
            'summary' => 'Algunos activos requieren un segundo valor junto a la dirección. Omitirlo provoca pérdidas.',
            'body' => "Algunas blockchains encaminan las transferencias usando **dos** valores: la dirección (la misma para todos en ese exchange) más un memo, tag o ID de destino por cliente.\n\nLos activos que requieren memo/tag incluyen:\n\n- **XRP (Ripple):** Destination tag\n- **XLM (Stellar):** Memo\n- **TON, EOS, Cosmos, Algorand:** Memo / nota\n- **HBAR (Hedera):** Memo\n- **Algunas variantes de USDT/USDC alojadas en exchanges**\n\nCuando la plataforma detecta un activo que requiere memo, aparece un campo adicional en el Paso 2. Rellénalo **exactamente** como te lo proporciona tu cartera. Si lo omites, el depósito llega a la cartera caliente del exchange sin instrucciones para acreditártelo, y la recuperación requiere la ayuda del operador del exchange.",
        ],

        // ── Fees & limits ──────────────────────────────────────────
        'where-fees-come-from' => [
            'category' => 'fees-limits',
            'title' => '¿De dónde salen las comisiones?',
            'summary' => 'No hay un cargo aparte. El coste está integrado en la tasa cotizada.',
            'body' => "Tres elementos van incluidos en la tasa que ves en la pantalla de cotización:\n\n1. **El precio medio del mercado:** lo que el activo cuesta ahora mismo en los exchanges principales.\n2. **Diferencial del socio:** normalmente 0,25 %–0,50 %. Así es como ganan nuestros socios de liquidez.\n3. **Comisiones de red:** lo que cuesta difundir tanto tu depósito como nuestro pago. Son muy volátiles (el gas de Ethereum puede multiplicarse por 10 en minutos).\n\n**Nunca** cobramos una comisión de servicio aparte sobre la tasa mostrada. La cotización que ves es lo que recibes (dentro de la ventana de tasa flotante, si no bloqueaste la tasa).\n\nPara intercambios grandes (>10 000 $ equivalentes), pregunta por precios OTC: los diferenciales se ajustan considerablemente con el tamaño.",
        ],

        'minimums-maximums' => [
            'category' => 'fees-limits',
            'title' => 'Mínimos y máximos explicados',
            'summary' => 'Por qué cada par tiene su propio mínimo y cómo se fija el máximo en vivo.',
            'body' => "Los **mínimos** existen por una razón: las comisiones de red. Si intercambias un importe menor que el coste de difundir las dos partes de la operación, el socio pierde dinero. El mínimo varía por par y se muestra justo debajo del campo de importe en cuanto preparas una cotización.\n\nLos **máximos** no son un número fijo: se establecen según la liquidez disponible ese día. Cuando introduces un importe grande, el sistema comprueba la profundidad del libro de órdenes del socio y muestra una estimación. Para importes muy grandes, la cotización puede indicar *Tasa reducida por encima de X*: es el sistema avisándote de que el precio se deslizará si presionas más.\n\nSi el máximo se queda corto para lo que necesitas, normalmente puedes dividir la orden en dos o tres intercambios más pequeños sin perder mucho en el diferencial.",
        ],

        'partner-spread-explained' => [
            'category' => 'fees-limits',
            'title' => 'Por qué mi tasa difiere de CoinGecko',
            'summary' => 'Razones honestas por las que tu tasa cotizada no es el precio que aparece en el ticker.',
            'body' => "CoinGecko y otros agregadores muestran un *precio medio de mercado ponderado por volumen* en docenas de exchanges. Tu cotización es lo que puedes **operar realmente** ahora mismo, para **tu tamaño**, teniendo en cuenta:\n\n- El diferencial bid-ask del socio (siempre cruzas el diferencial)\n- Comisiones de red para ambas partes del intercambio\n- Margen de volatilidad (más pronunciado en tasa flotante)\n- Deslizamiento en importes mayores\n\nPara pares principales (BTC↔ETH↔USDT) la diferencia con CoinGecko suele ser **inferior al 0,6 %**. Para pares exóticos o estables de baja liquidez, puede ser del 1–2 %. Si ves una cotización muy alejada del precio principal, refresca: la cotización puede estar caducada.",
        ],

        // ── Security ───────────────────────────────────────────────
        'non-custodial-explained' => [
            'category' => 'security',
            'title' => '¿Qué significa realmente no custodio?',
            'summary' => 'Nunca guardamos tus fondos. Esto es lo que ocurre entre bastidores.',
            'body' => "Los exchanges custodiales mantienen tus activos en sus carteras hasta que retiras. No custodio significa que **nunca** tocamos tus activos en una cartera que controlemos.\n\nLo que ocurre realmente durante un intercambio:\n\n1. La dirección de depósito que ves es una dirección de contrato inteligente **temporal y de un solo uso** controlada por la capa de liquidación de nuestro socio.\n2. En el momento en que tu depósito se confirma, el activo se intercambia *atómicamente* en nuestro socio y el activo resultante se difunde a **tu** dirección de recepción.\n3. Mantenemos los fondos durante **segundos**, nunca minutos, y nunca bajo un saldo visible para el usuario.\n\nVentajas: sin riesgo de información privilegiada, sin límites de retirada, sin cuentas congeladas. Contrapartida: no hay saldo que recuperar si envías a la dirección equivocada; por eso el Paso 2 tiene varias confirmaciones.",
        ],

        'phishing-warning' => [
            'category' => 'security',
            'title' => 'Protección contra phishing y estafas',
            'summary' => 'Cómo verificar que estás en el sitio real y qué nunca te pediremos.',
            'body' => "**Nunca te pediremos que:**\n\n- Envíes tus claves privadas, frase semilla o passphrase de la cartera\n- Instales una extensión para «conectar» tu cartera\n- Muevas fondos a una «dirección de verificación»\n- Pagues una «comisión de liberación» por un intercambio ya en curso\n- Concedas acceso remoto a tu ordenador\n\n**Para verificar el sitio real:**\n\n- Comprueba la URL en la barra del navegador; añade el sitio a favoritos tras tu primera visita\n- El certificado TLS debe ser válido (icono del candado)\n- Nuestro equipo de soporte solo responderá desde la dirección de correo indicada en el pie de página\n\nSi alguien te pide cualquiera de las cosas anteriores, incluso desde un correo o chat que *parece* nuestro, supón que es un intento de phishing. Repórtalo mediante el formulario de contacto.",
        ],

        'private-keys-never-asked' => [
            'category' => 'security',
            'title' => 'Nunca te pediremos tus claves privadas',
            'summary' => 'Ningún operador legítimo pide jamás la semilla de tu cartera. Nunca.',
            'body' => "Tus **claves privadas** (o frase de recuperación, o frase semilla) son lo único que se interpone entre tú y la pérdida total de tus fondos. Cualquiera que te las pida está intentando robarte. Siempre.\n\n**No existe ningún escenario** en el que un operador legítimo de intercambios, exchange, agente de soporte o «validador de carteras» necesite tus claves privadas. Podemos completar todos los intercambios, reembolsos y procesos de recuperación sin ellas.\n\nSi alguna vez has compartido tu semilla con alguien, considera la cartera comprometida:\n\n1. Mueve todos los fondos a una cartera nueva generada en un dispositivo limpio de inmediato.\n2. Deja de usar la cartera comprometida para recibir cualquier cosa.\n3. Restablece todas las cuentas vinculadas y los 2FA.\n\nBuena higiene operativa: guarda tu semilla sin conexión, escríbela en papel o acero, no la teclees nunca en un sitio web o caja de chat. Nunca.",
        ],

        // ── Account ────────────────────────────────────────────────
        'creating-account' => [
            'category' => 'account',
            'title' => 'Crear una cuenta',
            'summary' => 'Opcional, tarda diez segundos y te permite seguir tus intercambios en un solo lugar.',
            'body' => "Desde la página de inicio, haz clic en el avatar (arriba a la derecha) → **Iniciar sesión** → **Crear una cuenta**. Te pedimos:\n\n- Tu dirección de correo electrónico\n- Una contraseña (mínimo 12 caracteres)\n\nEso es todo. Sin número de teléfono, sin nombre, sin documentos.\n\nUna vez dentro verás **Cuenta → Panel** con:\n\n- Recuento de intercambios y volumen de toda tu vida\n- Comisiones totales pagadas (para comparar con otros servicios)\n- Tu par favorito\n- Un gráfico de intercambios de 14 días\n- Transacciones recientes con actualización de estado en un clic\n\nTu cuenta es puramente del lado del cliente: no usaremos el correo para marketing salvo que actives esa opción en **Cuenta → Ajustes**.",
        ],

        'password-reset' => [
            'category' => 'account',
            'title' => 'Olvidé / restablecer la contraseña',
            'summary' => 'Restablecer requiere un correo y un solo clic. El enlace es válido durante 60 minutos.',
            'body' => "Desde la página de [Inicio de sesión](/sign-in), haz clic en **¿Olvidaste tu contraseña?** e introduce tu correo. Enviamos un enlace de restablecimiento único que:\n\n- Caduca en 60 minutos\n- Solo puede usarse una vez\n- Siempre apunta a una URL de este dominio: nunca copies un enlace desde otro lugar\n\nSi el correo no llega:\n\n- Revisa la carpeta de spam (añade el remitente a la lista blanca)\n- Confirma que el correo coincide con el que usaste al registrarte\n- Espera dos minutos: nuestro límite restringe los restablecimientos a uno cada dos minutos por correo\n\nSi has perdido el acceso al correo con el que te registraste, [abre un ticket](/help?tab=open#tickets): podemos verificar manualmente tu identidad con los detalles históricos de tus intercambios.",
        ],

        'account-deletion' => [
            'category' => 'account',
            'title' => 'Eliminar mi cuenta',
            'summary' => 'La eliminación de la cuenta es irreversible. Esto es exactamente lo que se borra.',
            'body' => "Ve a **Cuenta → Ajustes → Zona de peligro → Eliminar cuenta**.\n\nLo que ocurre de inmediato:\n\n- Tu inicio de sesión queda deshabilitado\n- Tu correo se elimina de nuestra lista de marketing (si estabas en ella)\n- Tus datos personales de perfil (nombre, idioma, preferencias) se borran\n\nLo que se conserva (y por qué):\n\n- Registros anonimizados de transacciones, durante **5 años**, por cumplimiento AML / contable\n- Estos registros ya no pueden vincularse a tu identidad una vez eliminada tu cuenta\n\nLa eliminación es **irreversible**: no podemos recuperar una cuenta una vez borrada. Si tienes dudas, cierra la sesión y vuelve más tarde.",
        ],
    ],
];

/**
 * Map well-known coins to a public block explorer URL.
 * Returns null when no explorer is known — caller should hide the link.
 */

type Kind = 'address' | 'tx';

const MAP: Record<string, { tx: (h: string) => string; address: (a: string) => string }> = {
    btc: {
        tx:      (h) => `https://blockstream.info/tx/${encodeURIComponent(h)}`,
        address: (a) => `https://blockstream.info/address/${encodeURIComponent(a)}`,
    },
    eth: {
        tx:      (h) => `https://etherscan.io/tx/${encodeURIComponent(h)}`,
        address: (a) => `https://etherscan.io/address/${encodeURIComponent(a)}`,
    },
    bnb: {
        tx:      (h) => `https://bscscan.com/tx/${encodeURIComponent(h)}`,
        address: (a) => `https://bscscan.com/address/${encodeURIComponent(a)}`,
    },
    bsc: {
        tx:      (h) => `https://bscscan.com/tx/${encodeURIComponent(h)}`,
        address: (a) => `https://bscscan.com/address/${encodeURIComponent(a)}`,
    },
    sol: {
        tx:      (h) => `https://solscan.io/tx/${encodeURIComponent(h)}`,
        address: (a) => `https://solscan.io/account/${encodeURIComponent(a)}`,
    },
    trx: {
        tx:      (h) => `https://tronscan.org/#/transaction/${encodeURIComponent(h)}`,
        address: (a) => `https://tronscan.org/#/address/${encodeURIComponent(a)}`,
    },
    matic: {
        tx:      (h) => `https://polygonscan.com/tx/${encodeURIComponent(h)}`,
        address: (a) => `https://polygonscan.com/address/${encodeURIComponent(a)}`,
    },
};

export function explorerUrl(ticker: string | null | undefined, value: string | null | undefined, kind: Kind): string | null {
    if (!ticker || !value) return null;
    const key = ticker.toLowerCase();
    const entry = MAP[key];
    if (!entry) return null;
    return kind === 'tx' ? entry.tx(value) : entry.address(value);
}

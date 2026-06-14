/**
 * Registry of crypto SVG logos shipped by the `cryptocurrency-icons` package.
 *
 * We deliberately curate the brace-expanded glob to the ~60 most-used tickers.
 * The package itself ships ~150 SVGs — pulling them all in via eager glob
 * embeds 50 KB of URL strings the UI never references.
 *
 * If your buyer's deployment needs a coin not on this list, the upstream API
 * already returns an `image` URL for every currency and `CoinIcon` falls back
 * to that automatically.
 */

const modules = import.meta.glob<string>(
    '../../../node_modules/cryptocurrency-icons/svg/color/{1inch,ada,aave,algo,arb,atom,avax,bch,bnb,btc,btg,busd,cake,celo,comp,crv,dai,dash,doge,dot,egld,enj,eos,etc,eth,fil,flow,ftm,grt,hbar,icp,inj,kava,ksm,link,ltc,mana,matic,mkr,near,neo,oneinch,op,paxg,qnt,rune,sand,shib,snx,sol,sui,sushi,trx,uni,usdc,usdp,usdt,vet,wbtc,weth,xlm,xmr,xrp,xtz,yfi,zec,zil}.svg',
    { query: '?url', import: 'default', eager: true },
);

const registry = new Map<string, string>();
for (const [path, url] of Object.entries(modules)) {
    const m = path.match(/\/([a-z0-9-]+)\.svg$/i);
    if (m?.[1]) registry.set(m[1].toLowerCase(), url);
}

const aliases: Record<string, string> = {
    weth: 'eth',
    wbtc: 'btc',
};

export function localCoinIcon(ticker: string | null | undefined): string | undefined {
    if (!ticker) return undefined;
    const t = ticker.toLowerCase();
    return registry.get(t) ?? registry.get(aliases[t] ?? '') ?? undefined;
}

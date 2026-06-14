import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { useT } from '@/lib/i18n';
import { formatAmount, shorten } from '@/lib/utils';

interface PageProps {
    transaction: {
        id: string;
        from: string;
        to: string;
        amount_send: number;
        amount_receive: number;
        payin_address: string | null;
        payout_address: string | null;
        payin_hash: string | null;
        payout_hash: string | null;
        status: string;
        created_at: string | null;
        valid_until: string | null;
    };
}

export default function Track({ transaction }: PageProps) {
    const t = useT();
    return (
        <PublicLayout>
            <Head title={`#${shorten(transaction.id, 6, 4)} — ${t('status.' + transaction.status)}`} />
            <section className="container-edge max-w-2xl py-16">
                <h1 className="text-2xl font-bold mb-1">
                    {transaction.from.toUpperCase()} → {transaction.to.toUpperCase()}
                </h1>
                <p className="text-muted-3 text-sm font-mono">{transaction.id}</p>

                <div className="mt-6 surface-card rounded-2xl p-6 border border-line-1 grid gap-4">
                    <Row label={t('amount.you_send')} value={`${formatAmount(transaction.amount_send)} ${transaction.from.toUpperCase()}`} />
                    <Row label={t('amount.you_get')}  value={`${formatAmount(transaction.amount_receive)} ${transaction.to.toUpperCase()}`} />
                    <Row label="Status" value={t(`status.${transaction.status}`)} />
                    {transaction.payin_hash &&
                        <Row label="Pay-in tx"  value={shorten(transaction.payin_hash, 10, 8)} mono />}
                    {transaction.payout_hash &&
                        <Row label="Pay-out tx" value={shorten(transaction.payout_hash, 10, 8)} mono />}
                </div>
            </section>
        </PublicLayout>
    );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-3 uppercase tracking-wider text-xs">{label}</span>
            <span className={mono ? 'font-mono' : 'font-semibold'}>{value}</span>
        </div>
    );
}

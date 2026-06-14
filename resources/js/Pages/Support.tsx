import { useState } from 'react';
import { toast } from 'sonner';
import PublicLayout from '@/layouts/PublicLayout';
import { useT } from '@/lib/i18n';
import { api } from '@/lib/api';
import { Head } from '@inertiajs/react';

export default function Support() {
    const t = useT();
    const [submitting, setSubmitting] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setSubmitting(true);
        try {
            await api.openTicket({
                email: String(f.get('email') ?? ''),
                subject: String(f.get('subject') ?? ''),
                message: String(f.get('message') ?? ''),
                transaction_id: String(f.get('transaction_id') ?? '') || undefined,
            });
            toast.success(t('support.success'));
            e.currentTarget.reset();
        } catch {
            toast.error(t('support.error'));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <PublicLayout>
            <Head title={t('support.title')} />
            <section className="container-edge max-w-3xl py-16">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('support.title')}</h1>
                <p className="mt-2 text-muted-3 max-w-xl">{t('support.intro')}</p>

                <form onSubmit={onSubmit} className="mt-8 grid gap-4">
                    <div className="field">
                        <label className="field-label" htmlFor="sup-email">{t('support.email')}</label>
                        <input id="sup-email" name="email" type="email" required autoComplete="email" />
                    </div>
                    <div className="field">
                        <label className="field-label" htmlFor="sup-tx">{t('support.tx_id')}</label>
                        <input id="sup-tx" name="transaction_id" autoComplete="off" />
                    </div>
                    <div className="field">
                        <label className="field-label" htmlFor="sup-subject">{t('support.subject')}</label>
                        <input id="sup-subject" name="subject" required maxLength={200} />
                    </div>
                    <div className="field">
                        <label className="field-label" htmlFor="sup-message">{t('support.message')}</label>
                        <textarea id="sup-message" name="message" required rows={6} maxLength={5000} />
                    </div>
                    <button type="submit" disabled={submitting} className="cta justify-self-start sm:max-w-xs">
                        {submitting ? <span className="spinner" /> : t('support.submit')}
                    </button>
                </form>
            </section>
        </PublicLayout>
    );
}

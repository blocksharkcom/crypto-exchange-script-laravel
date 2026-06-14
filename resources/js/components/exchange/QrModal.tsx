import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Modal } from '@/components/ui/Modal';
import { useT } from '@/lib/i18n';

interface Props {
    open: boolean;
    onClose: () => void;
    address: string;
    label?: string;
}

export function QrModal({ open, onClose, address, label }: Props) {
    const t = useT();
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!open || !ref.current) return;
        void QRCode.toCanvas(ref.current, address, {
            margin: 1,
            width: 240,
            color: { dark: '#0a0a0c', light: '#ffffff' },
            errorCorrectionLevel: 'M',
        });
    }, [open, address]);

    return (
        <Modal open={open} onClose={onClose} title={t('deposit.qr')} size="sm">
            <div className="px-6 pb-6 flex flex-col items-center text-center">
                <div className="p-4 rounded-2xl bg-white">
                    <canvas ref={ref} aria-label={label} />
                </div>
                <div className="mt-4 text-xs text-muted-3 uppercase tracking-wider">{t('deposit.to_address')}</div>
                <div className="mt-1 font-mono text-sm break-all text-[color:var(--text-1)] max-w-xs">
                    {address}
                </div>
            </div>
        </Modal>
    );
}

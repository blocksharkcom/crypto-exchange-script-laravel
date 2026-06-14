import type { ReactNode } from 'react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export interface Column<T> {
    key: string;
    header: string;
    cell: (row: T) => ReactNode;
    className?: string;
    headerClassName?: string;
}

interface Props<T> {
    rows: T[];
    columns: Column<T>[];
    rowKey: (row: T) => string | number;
    empty?: string;
    dense?: boolean;
}

export default function DataTable<T>({ rows, columns, rowKey, empty, dense }: Props<T>) {
    const t = useT();
    if (rows.length === 0) {
        return (
            <div className="surface-card-2 rounded-xl border border-line-1 px-4 py-10 text-center text-sm text-muted-3">
                {empty ?? t('admin.common.no_results')}
            </div>
        );
    }
    return (
        <div className="overflow-x-auto rounded-xl border border-line-1 surface-card">
            <table className="w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-wide text-muted-3 bg-[color:var(--surface-card-2)]">
                    <tr>
                        {columns.map((c) => (
                            <th
                                key={c.key}
                                className={cn('px-4 py-2.5 font-semibold whitespace-nowrap', c.headerClassName)}
                            >
                                {c.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr
                            key={rowKey(row)}
                            className="border-t border-line-1 hover:bg-[color:var(--surface-card-2)] transition-colors"
                        >
                            {columns.map((c) => (
                                <td
                                    key={c.key}
                                    className={cn(
                                        'px-4 align-middle',
                                        dense ? 'py-2' : 'py-3',
                                        c.className,
                                    )}
                                >
                                    {c.cell(row)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

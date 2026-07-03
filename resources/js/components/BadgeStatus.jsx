import React from 'react';

function BadgeStatus({ status }) {
    const statusClass = {
        pending: 'bg-yellow-100 text-yellow-700',
        approved: 'bg-green-100 text-green-700',
        final_submitted: 'bg-blue-100 text-blue-700',
        revision: 'bg-orange-100 text-orange-700',
        completed: 'bg-slate-200 text-slate-700',
        rejected: 'bg-red-100 text-red-700',
    };

    const statusText = {
        pending: 'Diajukan',
        approved: 'Nomor Disetujui',
        final_submitted: 'Menunggu Verifikasi Final',
        revision: 'Perlu Revisi Final',
        completed: 'Selesai / Closed',
        rejected: 'Ditolak',
    };

    return (
        <span
            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                statusClass[status] || 'bg-slate-100 text-slate-600'
            }`}
        >
            {statusText[status] || status || '-'}
        </span>
    );
}

export default BadgeStatus;
import React from 'react';

function BadgeStatus({ status }) {
    const statusClass = {
        pending: 'bg-yellow-100 text-yellow-700',
        approved: 'bg-green-100 text-green-700',
        final_submitted: 'bg-blue-100 text-blue-700',
        completed: 'bg-slate-200 text-slate-700',
        rejected: 'bg-red-100 text-red-700',
    };

    const statusText = {
        pending: 'Menunggu',
        approved: 'Disetujui',
        final_submitted: 'Dokumen Final Dikirim',
        completed: 'Selesai',
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

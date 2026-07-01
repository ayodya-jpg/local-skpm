import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
    Check,
    Download,
    Eye,
    FileCheck,
    X,
} from 'lucide-react';

import BadgeStatus from '../components/BadgeStatus';
import { apiGet, apiSend, getErrorMessage } from '../services/api';

function ApprovalNomorSuratPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await apiGet('/nomor-surat');
            setItems(data.nomor_surats || data.data || []);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: getErrorMessage(error),
                confirmButtonColor: '#d71920',
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return '-';

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return dateValue;
        }

        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const openDownload = (url) => {
        window.open(url, '_blank');
    };

    const handleApprove = async (item) => {
        const result = await Swal.fire({
            icon: 'question',
            title: 'Setujui Pengajuan?',
            html: `
                <div style="text-align:left">
                    <p>Nomor surat untuk pengajuan berikut akan dibuat otomatis:</p>
                    <br/>
                    <b>${item.judul_surat}</b>
                    <br/>
                    <small>Pastikan dokumen awal sudah dicek sebelum disetujui.</small>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Ya, Setujui',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#64748b',
        });

        if (!result.isConfirmed) return;

        try {
            const data = await apiSend(`/nomor-surat/${item.id}/approve`, 'POST');

            await fetchData();

            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: data.message || 'Pengajuan berhasil disetujui.',
                timer: 1800,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: getErrorMessage(error),
                confirmButtonColor: '#d71920',
            });
        }
    };

    const handleReject = async (item) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Tolak Pengajuan',
            input: 'textarea',
            inputLabel: 'Alasan penolakan',
            inputPlaceholder: 'Masukkan alasan penolakan...',
            showCancelButton: true,
            confirmButtonText: 'Tolak',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#d71920',
            cancelButtonColor: '#64748b',
            inputValidator: (value) => {
                if (!value) {
                    return 'Alasan penolakan wajib diisi.';
                }

                return null;
            },
        });

        if (!result.isConfirmed) return;

        try {
            await apiSend(`/nomor-surat/${item.id}/reject`, 'POST', {
                rejected_reason: result.value,
            });

            await fetchData();

            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'Pengajuan berhasil ditolak.',
                timer: 1800,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: getErrorMessage(error),
                confirmButtonColor: '#d71920',
            });
        }
    };

    const handleComplete = async (item) => {
        const result = await Swal.fire({
            icon: 'question',
            title: 'Selesaikan Pengajuan?',
            html: `
                <div style="text-align:left">
                    <p>Pastikan dokumen final sudah dicek dan sesuai.</p>
                    <br/>
                    <b>${item.judul_surat}</b>
                </div>
            `,
            input: 'textarea',
            inputLabel: 'Catatan penyelesaian',
            inputPlaceholder: 'Opsional, contoh: Dokumen final sudah sesuai.',
            showCancelButton: true,
            confirmButtonText: 'Ya, Selesai',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#64748b',
        });

        if (!result.isConfirmed) return;

        try {
            await apiSend(`/nomor-surat/${item.id}/complete`, 'POST', {
                completed_note: result.value || '',
            });

            await fetchData();

            Swal.fire({
                icon: 'success',
                title: 'Selesai',
                text: 'Pengajuan nomor surat telah selesai.',
                timer: 1800,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: getErrorMessage(error),
                confirmButtonColor: '#d71920',
            });
        }
    };

    const renderAction = (item) => {
        if (item.status === 'pending') {
            return (
                <div className="flex flex-wrap gap-2">
                    {item.file_dokumen ? (
                        <button
                            onClick={() => openDownload(`/nomor-surat/${item.id}/download-awal`)}
                            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-semibold transition"
                        >
                            <Eye size={14} />
                            Dokumen Awal
                        </button>
                    ) : (
                        <span className="text-xs text-slate-400">
                            Tidak ada dokumen
                        </span>
                    )}

                    <button
                        onClick={() => handleApprove(item)}
                        className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl text-xs font-semibold transition"
                    >
                        <Check size={14} />
                        Approve
                    </button>

                    <button
                        onClick={() => handleReject(item)}
                        className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-xs font-semibold transition"
                    >
                        <X size={14} />
                        Reject
                    </button>
                </div>
            );
        }

        if (item.status === 'approved') {
            return (
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-green-700">
                        Nomor sudah keluar.
                    </p>

                    <p className="text-xs text-slate-500 leading-relaxed">
                        Menunggu unit upload dokumen final.
                    </p>

                    {item.file_dokumen ? (
                        <button
                            onClick={() => openDownload(`/nomor-surat/${item.id}/download-awal`)}
                            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition"
                        >
                            <Download size={14} />
                            Dokumen Awal
                        </button>
                    ) : null}
                </div>
            );
        }

        if (item.status === 'final_submitted') {
            return (
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => openDownload(`/nomor-surat/${item.id}/download-final`)}
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-semibold transition"
                    >
                        <Eye size={14} />
                        Dokumen Final
                    </button>

                    <button
                        onClick={() => handleComplete(item)}
                        className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl text-xs font-semibold transition"
                    >
                        <FileCheck size={14} />
                        Selesai
                    </button>
                </div>
            );
        }

        if (item.status === 'completed') {
            return (
                <div className="flex flex-wrap items-center gap-2">
                    {item.file_dokumen_final ? (
                        <button
                            onClick={() => openDownload(`/nomor-surat/${item.id}/download-final`)}
                            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition"
                        >
                            <Download size={14} />
                            Dokumen Final
                        </button>
                    ) : null}

                    <span className="text-xs font-semibold text-slate-500">
                        Selesai
                    </span>
                </div>
            );
        }

        if (item.status === 'rejected') {
            return (
                <span className="text-xs text-red-500 font-semibold">
                    Ditolak
                </span>
            );
        }

        return (
            <span className="text-xs text-slate-400">
                -
            </span>
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <p className="text-slate-500">Memuat data approval...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
            <div className="mb-7">
                <h2 className="text-2xl font-bold text-slate-950">
                    Approval Pengajuan Nomor Surat
                </h2>

                <p className="text-slate-500 mt-2">
                    Cek dokumen awal, approve nomor surat, cek dokumen final, lalu selesaikan pengajuan.
                </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1150px]">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">No</th>
                                <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">Judul</th>
                                <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">Pemohon</th>
                                <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">Tanggal</th>
                                <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">Kode</th>
                                <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">Nomor Surat</th>
                                <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">Status</th>
                                <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">Aksi</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {items.length > 0 ? (
                                items.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className="align-top hover:bg-slate-50/70 transition"
                                    >
                                        <td className="px-5 py-5 text-slate-700">
                                            {index + 1}
                                        </td>

                                        <td className="px-5 py-5">
                                            <p className="font-bold text-slate-900">
                                                {item.judul_surat}
                                            </p>

                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                Tujuan: {item.tujuan_surat || '-'}
                                            </p>
                                        </td>

                                        <td className="px-5 py-5">
                                            <p className="font-bold text-slate-800">
                                                {item.user?.name || '-'}
                                            </p>

                                            <p className="text-xs text-slate-500 capitalize mt-1">
                                                {item.user?.unit || '-'}
                                            </p>
                                        </td>

                                        <td className="px-5 py-5 text-slate-700 whitespace-nowrap">
                                            {formatDate(item.tanggal_surat)}
                                        </td>

                                        <td className="px-5 py-5 text-slate-700">
                                            {item.kode_perihal?.kode || '-'} / {item.kode_pemilik?.kode || '-'}
                                        </td>

                                        <td className="px-5 py-5 font-bold text-red-700 whitespace-nowrap">
                                            {item.nomor_surat || '-'}
                                        </td>

                                        <td className="px-5 py-5">
                                            <BadgeStatus status={item.status} />
                                        </td>

                                        <td className="px-5 py-5">
                                            {renderAction(item)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-5 py-10 text-center text-slate-500">
                                        Belum ada pengajuan nomor surat.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ApprovalNomorSuratPage;

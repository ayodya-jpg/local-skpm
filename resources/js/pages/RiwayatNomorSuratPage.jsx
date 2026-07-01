import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
    Download,
    Upload,
} from 'lucide-react';

import BadgeStatus from '../components/BadgeStatus';
import { apiGet, apiSendForm, getErrorMessage } from '../services/api';

function RiwayatNomorSuratPage() {
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

    const openDownload = (url) => {
        window.open(url, '_blank');
    };

    const handleUploadFinal = async (item) => {
        const result = await Swal.fire({
            icon: 'info',
            title: 'Upload Dokumen Final',
            html: `
                <div style="text-align:left">
                    <p>Upload dokumen yang sudah diberi nomor surat:</p>
                    <br/>
                    <b>${item.nomor_surat || '-'}</b>
                    <br/><br/>
                    <input id="file_dokumen_final" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" class="swal2-file" />
                    <p style="font-size:12px;color:#64748b;margin-top:8px">
                        Format: PDF, DOC, DOCX, JPG, JPEG, PNG. Maksimal 5MB.
                    </p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Upload',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#d71920',
            cancelButtonColor: '#64748b',
            preConfirm: () => {
                const fileInput = document.getElementById('file_dokumen_final');
                const file = fileInput?.files?.[0];

                if (!file) {
                    Swal.showValidationMessage('File dokumen final wajib dipilih.');
                    return false;
                }

                const maxSize = 5 * 1024 * 1024;

                if (file.size > maxSize) {
                    Swal.showValidationMessage('Ukuran file maksimal 5MB.');
                    return false;
                }

                return file;
            },
        });

        if (!result.isConfirmed || !result.value) return;

        const formData = new FormData();
        formData.append('file_dokumen_final', result.value);

        try {
            await apiSendForm(`/nomor-surat/${item.id}/upload-final`, 'POST', formData);

            await fetchData();

            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'Dokumen final berhasil diupload dan menunggu pengecekan SEKPiM.',
                timer: 2000,
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
                <span className="text-xs text-yellow-700 font-semibold">
                    Menunggu approval SEKPiM
                </span>
            );
        }

        if (item.status === 'approved') {
            return (
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleUploadFinal(item)}
                        className="flex items-center gap-1 bg-[#d71920] hover:bg-[#bd1118] text-white px-3 py-2 rounded-lg text-xs font-semibold"
                    >
                        <Upload size={14} />
                        Upload Final
                    </button>

                    {item.file_dokumen ? (
                        <button
                            onClick={() => openDownload(`/nomor-surat/${item.id}/download-awal`)}
                            className="flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold"
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
                    <span className="text-xs text-blue-700 font-semibold">
                        Menunggu pengecekan SEKPiM
                    </span>

                    {item.file_dokumen_final ? (
                        <button
                            onClick={() => openDownload(`/nomor-surat/${item.id}/download-final`)}
                            className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-xs font-semibold"
                        >
                            <Download size={14} />
                            Dokumen Final
                        </button>
                    ) : null}
                </div>
            );
        }

        if (item.status === 'completed') {
            return (
                <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-green-700 font-semibold">
                        Proses selesai
                    </span>

                    {item.file_dokumen_final ? (
                        <button
                            onClick={() => openDownload(`/nomor-surat/${item.id}/download-final`)}
                            className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-xs font-semibold"
                        >
                            <Download size={14} />
                            Dokumen Final
                        </button>
                    ) : null}
                </div>
            );
        }

        if (item.status === 'rejected') {
            return (
                <div>
                    <p className="text-xs text-red-600 font-semibold">
                        Pengajuan ditolak
                    </p>

                    {item.rejected_reason ? (
                        <p className="text-xs text-slate-500 mt-1">
                            Alasan: {item.rejected_reason}
                        </p>
                    ) : null}
                </div>
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
            <div className="bg-white rounded-2xl shadow border border-slate-100 p-6">
                <p className="text-slate-500">Memuat riwayat pengajuan...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow border border-slate-100 p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-950">
                    Riwayat Pengajuan Nomor Surat
                </h2>

                <p className="text-slate-500 mt-1">
                    Pantau status pengajuan, lihat nomor surat, dan upload dokumen final setelah disetujui.
                </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full min-w-[1100px]">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">No</th>
                            <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">Judul</th>
                            <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">Tanggal</th>
                            <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">Kode</th>
                            <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">Nomor Surat</th>
                            <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">Status</th>
                            <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {items.length > 0 ? (
                            items.map((item, index) => (
                                <tr key={item.id} className="border-t border-slate-100 align-top">
                                    <td className="px-5 py-4">{index + 1}</td>

                                    <td className="px-5 py-4">
                                        <p className="font-semibold text-slate-900">
                                            {item.judul_surat}
                                        </p>

                                        <p className="text-xs text-slate-500 mt-1">
                                            Tujuan: {item.tujuan_surat || '-'}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        {item.tanggal_surat}
                                    </td>

                                    <td className="px-5 py-4">
                                        {item.kode_perihal?.kode || '-'} / {item.kode_pemilik?.kode || '-'}
                                    </td>

                                    <td className="px-5 py-4 font-bold text-red-700">
                                        {item.nomor_surat || '-'}
                                    </td>

                                    <td className="px-5 py-4">
                                        <BadgeStatus status={item.status} />
                                    </td>

                                    <td className="px-5 py-4">
                                        {renderAction(item)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-5 py-8 text-center text-slate-500">
                                    Belum ada pengajuan nomor surat.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default RiwayatNomorSuratPage;

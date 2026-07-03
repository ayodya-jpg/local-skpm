import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
    Calendar,
    CheckCircle,
    Clock,
    Download,
    Eye,
    ExternalLink,
    FileText,
    RefreshCcw,
    RotateCcw,
    Upload,
    XCircle,
} from 'lucide-react';

import BadgeStatus from '../components/BadgeStatus';
import { apiGet, apiSendForm, getErrorMessage } from '../services/api';

function RiwayatNomorSuratPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);

    const [filter, setFilter] = useState({
        search: '',
        status: 'all',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (silent = false) => {
        try {
            if (silent) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const data = await apiGet('/nomor-surat');

            setItems(data.nomor_surats || []);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: getErrorMessage(error),
                confirmButtonColor: '#d71920',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;

        setFilter((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const getFileExtension = (path) => {
        if (!path) return '';

        const cleanPath = String(path).split('?')[0];
        const parts = cleanPath.split('.');

        return parts.length > 1 ? parts.pop().toLowerCase() : '';
    };

    const openDownload = (url) => {
        window.open(url, '_blank');
    };

    const openPreview = (fileData) => {
        setPreviewFile(fileData);
    };

    const refreshSelectedRequest = (updatedItems) => {
        if (!selectedRequest) return;

        const freshItem = updatedItems.find((item) => item.id === selectedRequest.id);

        if (freshItem) {
            setSelectedRequest(freshItem);
        } else {
            setSelectedRequest(null);
        }
    };

    const handleUploadFinal = async (item) => {
        const isRevision = item.status === 'revision';

        const result = await Swal.fire({
            icon: isRevision ? 'warning' : 'info',
            title: isRevision ? 'Upload Ulang Dokumen Final' : 'Upload Dokumen Final',
            html: `
                <div style="text-align:left">
                    ${
                        isRevision
                            ? '<p>Dokumen final sebelumnya diminta revisi. Silakan upload ulang dokumen yang sudah diperbaiki.</p>'
                            : '<p>Upload dokumen final yang sudah diberi nomor surat.</p>'
                    }
                    <br/>
                    <b>${item.nomor_surat || '-'}</b>
                    ${
                        item.revision_note
                            ? `<div style="margin-top:12px;padding:10px;border-radius:10px;background:#fff7ed;border:1px solid #fed7aa;color:#c2410c;font-size:13px">
                                <b>Catatan revisi:</b><br/>${item.revision_note}
                            </div>`
                            : ''
                    }
                    <br/>
                    <input id="file_dokumen_final" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" class="swal2-file" />
                    <p style="font-size:12px;color:#64748b;margin-top:8px">
                        Format: PDF, DOC, DOCX, JPG, JPEG, PNG. Maksimal 5MB.
                    </p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: isRevision ? 'Upload Ulang' : 'Upload',
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

        const payload = new FormData();
        payload.append('file_dokumen_final', result.value);

        try {
            await apiSendForm(`/nomor-surat/${item.id}/upload-final`, 'POST', payload);

            const data = await apiGet('/nomor-surat');
            const updatedItems = data.nomor_surats || [];

            setItems(updatedItems);
            refreshSelectedRequest(updatedItems);

            await Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: isRevision
                    ? 'Dokumen final revisi berhasil diupload dan menunggu pengecekan ulang SEKPiM.'
                    : 'Dokumen final berhasil diupload dan menunggu pengecekan SEKPiM.',
                timer: 2200,
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

    const formatStatusTanggal = (statusTanggal) => {
        const labels = {
            ondate: 'On Date',
            backdate: 'Back Date',
        };

        return labels[statusTanggal] || '-';
    };

    const filteredItems = items.filter((item) => {
        const keyword = filter.search.toLowerCase();

        const matchSearch =
            !keyword ||
            String(item.judul_surat || '').toLowerCase().includes(keyword) ||
            String(item.nomor_surat || '').toLowerCase().includes(keyword) ||
            String(item.tujuan_surat || '').toLowerCase().includes(keyword) ||
            String(item.nama_pic_unit_pemohon || '').toLowerCase().includes(keyword);

        const matchStatus =
            filter.status === 'all' ||
            item.status === filter.status;

        return matchSearch && matchStatus;
    });

    const totalOpen = items.length;
    const totalReview = items.filter((item) => [
        'pending',
        'final_submitted',
        'revision',
    ].includes(item.status)).length;
    const totalClose = items.filter((item) => item.status === 'completed').length;

    if (loading) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <p className="text-slate-500">Memuat riwayat pengajuan...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center">
                                <FileText size={28} />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-slate-950">
                                    Riwayat Nomor Surat
                                </h2>

                                <p className="text-slate-500 mt-1">
                                    Lihat status pengajuan, preview dokumen, dan upload dokumen final.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition disabled:opacity-60"
                    >
                        <RefreshCcw
                            size={16}
                            className={refreshing ? 'animate-spin' : ''}
                        />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <SummaryCard
                    title="Open / Total"
                    value={totalOpen}
                    icon={<FileText size={25} />}
                    color="bg-blue-50 text-blue-700"
                />

                <SummaryCard
                    title="Review / Tindak Lanjut"
                    value={totalReview}
                    icon={<Clock size={25} />}
                    color="bg-yellow-50 text-yellow-700"
                />

                <SummaryCard
                    title="Close / Selesai"
                    value={totalClose}
                    icon={<CheckCircle size={25} />}
                    color="bg-green-50 text-green-700"
                />
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">
                            Cari Pengajuan
                        </label>

                        <input
                            type="text"
                            name="search"
                            value={filter.search}
                            onChange={handleFilterChange}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Cari judul, nomor, tujuan, atau PIC..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">
                            Status
                        </label>

                        <select
                            name="status"
                            value={filter.status}
                            onChange={handleFilterChange}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="all">Semua Status</option>
                            <option value="pending">Diajukan</option>
                            <option value="approved">Nomor Disetujui</option>
                            <option value="final_submitted">Menunggu Verifikasi Final</option>
                            <option value="revision">Perlu Revisi Final</option>
                            <option value="completed">Selesai / Closed</option>
                            <option value="rejected">Ditolak</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <div className="mb-5">
                    <h3 className="text-lg font-bold text-slate-950">
                        Daftar Riwayat
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                        Klik judul atau tombol buka untuk melihat detail dan dokumen.
                    </p>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full min-w-[1050px]">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">
                                    Judul / Nomor
                                </th>

                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">
                                    PIC / TTD
                                </th>

                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">
                                    Tanggal
                                </th>

                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">
                                    Status Tanggal
                                </th>

                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">
                                    Status
                                </th>

                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">
                                    Detail
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="align-top hover:bg-slate-50/70 transition"
                                    >
                                        <td className="px-4 py-4">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedRequest(item)}
                                                className="text-left group"
                                            >
                                                <p className="font-bold text-sm text-slate-900 group-hover:text-red-700 transition">
                                                    {item.judul_surat || '-'}
                                                </p>

                                                <p className="text-xs font-bold text-red-700 mt-1 group-hover:underline">
                                                    {item.nomor_surat || 'Nomor belum tersedia'}
                                                </p>

                                                <p className="text-xs text-slate-500 mt-1">
                                                    {item.kode_perihal?.kode || '-'} / {item.kode_pemilik?.kode || '-'}
                                                </p>
                                            </button>
                                        </td>

                                        <td className="px-4 py-4">
                                            <p className="text-sm font-bold text-slate-800">
                                                {item.nama_pic_unit_pemohon || '-'}
                                            </p>

                                            <p className="text-xs text-slate-500 mt-1">
                                                TTD: {item.penandatangan_surat || '-'}
                                            </p>
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
                                            <div className="inline-flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" />
                                                {formatDate(item.tanggal_surat)}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                                                    item.status_tanggal === 'backdate'
                                                        ? 'bg-orange-50 text-orange-700'
                                                        : 'bg-green-50 text-green-700'
                                                }`}
                                            >
                                                {formatStatusTanggal(item.status_tanggal)}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4">
                                            <BadgeStatus status={item.status} />
                                        </td>

                                        <td className="px-4 py-4">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedRequest(item)}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                                            >
                                                <Eye size={14} />
                                                Buka
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-4 py-10 text-center text-slate-500 text-sm"
                                    >
                                        Tidak ada data riwayat.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedRequest ? (
                <RequestDetailModal
                    item={selectedRequest}
                    formatDate={formatDate}
                    formatStatusTanggal={formatStatusTanggal}
                    onClose={() => setSelectedRequest(null)}
                    onUploadFinal={handleUploadFinal}
                    openPreview={openPreview}
                />
            ) : null}

            {previewFile ? (
                <FilePreviewModal
                    file={previewFile}
                    onClose={() => setPreviewFile(null)}
                    openDownload={openDownload}
                    getFileExtension={getFileExtension}
                />
            ) : null}
        </div>
    );
}

function SummaryCard({ title, value, icon, color }) {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-500">
                        {title}
                    </p>

                    <h3 className="text-3xl font-bold text-slate-950 mt-2">
                        {value || 0}
                    </h3>
                </div>

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function RequestDetailModal({
    item,
    formatDate,
    formatStatusTanggal,
    onClose,
    onUploadFinal,
    openPreview,
}) {
    const canUploadFinal = ['approved', 'revision'].includes(item.status);

    const awalPreviewUrl = `/nomor-surat/${item.id}/preview-awal`;
    const awalDownloadUrl = `/nomor-surat/${item.id}/download-awal`;

    const finalPreviewUrl = `/nomor-surat/${item.id}/preview-final`;
    const finalDownloadUrl = `/nomor-surat/${item.id}/download-final`;

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 py-8">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 md:p-7 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-red-700">
                                Detail Riwayat Pengajuan
                            </p>

                            <h3 className="text-xl font-bold text-slate-950 mt-1">
                                {item.judul_surat || '-'}
                            </h3>

                            <p className="text-sm text-slate-500 mt-2">
                                Preview dokumen terlebih dahulu. Tombol download tersedia di halaman preview.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="p-6 md:p-7 space-y-6">
                    <div>
                        <p className="text-sm font-bold text-slate-800 mb-3">
                            Identitas Surat
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoBox
                                label="Nomor Surat"
                                value={item.nomor_surat || 'Nomor belum tersedia'}
                                highlight
                            />

                            <InfoBox
                                label="Status Pengajuan"
                                customValue={<BadgeStatus status={item.status} />}
                            />

                            <InfoBox
                                label="Tanggal Surat"
                                value={formatDate(item.tanggal_surat)}
                            />

                            <InfoBox
                                label="Status Tanggal"
                                value={formatStatusTanggal(item.status_tanggal)}
                            />

                            <InfoBox
                                label="Kode Perihal"
                                value={`${item.kode_perihal?.kode || '-'} - ${item.kode_perihal?.nama_perihal || '-'}`}
                            />

                            <InfoBox
                                label="Kode Pemilik Proses"
                                value={`${item.kode_pemilik?.kode || '-'} - ${item.kode_pemilik?.nama_pemilik || item.kode_pemilik?.unit || '-'}`}
                            />
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-bold text-slate-800 mb-3">
                            Pemohon dan Penanggung Jawab
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoBox
                                label="Nama Akun Pemohon"
                                value={item.user?.name || '-'}
                            />

                            <InfoBox
                                label="Unit Pemohon"
                                value={item.user?.unit || '-'}
                            />

                            <InfoBox
                                label="Nama PIC Unit Pemohon"
                                value={item.nama_pic_unit_pemohon || '-'}
                                highlight
                            />

                            <InfoBox
                                label="Penandatangan Surat / TTD"
                                value={item.penandatangan_surat || '-'}
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                        <p className="text-sm font-bold text-slate-700">
                            Tujuan Surat
                        </p>

                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                            {item.tujuan_surat || '-'}
                        </p>
                    </div>

                    {item.keterangan ? (
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                            <p className="text-sm font-bold text-slate-700">
                                Keterangan
                            </p>

                            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                                {item.keterangan}
                            </p>
                        </div>
                    ) : null}

                    {item.rejected_reason ? (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                            <p className="text-sm font-bold text-red-700">
                                Alasan Penolakan
                            </p>

                            <p className="text-sm text-red-700 mt-2 leading-relaxed">
                                {item.rejected_reason}
                            </p>
                        </div>
                    ) : null}

                    {item.revision_note ? (
                        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                            <p className="text-sm font-bold text-orange-700">
                                Catatan Revisi
                            </p>

                            <p className="text-sm text-orange-700 mt-2 leading-relaxed">
                                {item.revision_note}
                            </p>
                        </div>
                    ) : null}

                    <div className="border border-slate-200 rounded-2xl p-4">
                        <p className="text-sm font-bold text-slate-800 mb-4">
                            Aksi Dokumen
                        </p>

                        <div className="flex flex-wrap gap-3">
                            {item.file_dokumen ? (
                                <button
                                    type="button"
                                    onClick={() => openPreview({
                                        title: 'Preview Dokumen Awal',
                                        label: 'Dokumen Awal',
                                        previewUrl: awalPreviewUrl,
                                        downloadUrl: awalDownloadUrl,
                                        filePath: item.file_dokumen,
                                    })}
                                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                                >
                                    <Eye size={16} />
                                    Lihat Dokumen Awal
                                </button>
                            ) : null}

                            {item.file_dokumen_final ? (
                                <button
                                    type="button"
                                    onClick={() => openPreview({
                                        title: 'Preview Dokumen Final',
                                        label: 'Dokumen Final',
                                        previewUrl: finalPreviewUrl,
                                        downloadUrl: finalDownloadUrl,
                                        filePath: item.file_dokumen_final,
                                    })}
                                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
                                >
                                    <Eye size={16} />
                                    Lihat Dokumen Final
                                </button>
                            ) : null}

                            {canUploadFinal ? (
                                <button
                                    type="button"
                                    onClick={() => onUploadFinal(item)}
                                    className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition text-white ${
                                        item.status === 'revision'
                                            ? 'bg-orange-500 hover:bg-orange-600'
                                            : 'bg-[#d71920] hover:bg-[#bd1118]'
                                    }`}
                                >
                                    <Upload size={16} />
                                    {item.status === 'revision'
                                        ? 'Upload Ulang Dokumen Final'
                                        : 'Upload Dokumen Final'}
                                </button>
                            ) : null}

                            {!item.file_dokumen && !item.file_dokumen_final && !canUploadFinal ? (
                                <p className="text-sm text-slate-500">
                                    Belum ada dokumen yang dapat dilihat atau diunggah pada status ini.
                                </p>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FilePreviewModal({
    file,
    onClose,
    openDownload,
    getFileExtension,
}) {
    const extension = getFileExtension(file.filePath);
    const canInlinePreview = ['pdf', 'jpg', 'jpeg', 'png'].includes(extension);
    const isImage = ['jpg', 'jpeg', 'png'].includes(extension);

    return (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center px-4 py-8">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">
                <div className="p-5 md:p-6 border-b border-slate-100 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-red-700">
                            {file.title}
                        </p>

                        <h3 className="text-lg font-bold text-slate-950 mt-1">
                            {file.label}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                            {canInlinePreview
                                ? 'Dokumen ditampilkan untuk dicek terlebih dahulu. Gunakan tombol download jika ingin mengunduh file.'
                                : 'Preview langsung untuk DOC/DOCX tidak tersedia di browser. Silakan gunakan tombol download untuk membuka file.'}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                    >
                        ×
                    </button>
                </div>

                <div className="p-4 md:p-5 bg-slate-50 flex-1 overflow-auto">
                    {canInlinePreview ? (
                        isImage ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-center min-h-[60vh]">
                                <img
                                    src={file.previewUrl}
                                    alt={file.label}
                                    className="max-w-full max-h-[70vh] rounded-xl object-contain"
                                />
                            </div>
                        ) : (
                            <iframe
                                src={file.previewUrl}
                                title={file.label}
                                className="w-full h-[70vh] bg-white rounded-2xl border border-slate-200"
                            />
                        )
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 min-h-[50vh] flex flex-col items-center justify-center text-center">
                            <FileText size={56} className="text-slate-300" />

                            <h4 className="text-lg font-bold text-slate-800 mt-4">
                                Preview tidak tersedia
                            </h4>

                            <p className="text-sm text-slate-500 mt-2 max-w-md leading-relaxed">
                                File dengan format .{extension || 'unknown'} tidak dapat ditampilkan langsung oleh browser. Silakan download file untuk melihat isinya.
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-xs text-slate-400">
                        Tipe file: {extension ? `.${extension}` : '-'}
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => window.open(file.previewUrl, '_blank')}
                            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                            <ExternalLink size={16} />
                            Buka Tab Baru
                        </button>

                        <button
                            type="button"
                            onClick={() => openDownload(file.downloadUrl)}
                            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-[#d71920] hover:bg-[#bd1118] text-white transition"
                        >
                            <Download size={16} />
                            Download
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoBox({ label, value, customValue, highlight = false }) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                {label}
            </p>

            <div
                className={`mt-2 text-sm font-bold ${
                    highlight ? 'text-red-700' : 'text-slate-800'
                }`}
            >
                {customValue || value || '-'}
            </div>
        </div>
    );
}

export default RiwayatNomorSuratPage;
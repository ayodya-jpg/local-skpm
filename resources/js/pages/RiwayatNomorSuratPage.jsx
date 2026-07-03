import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import {
    CalendarDays,
    CheckCircle,
    Clock,
    Download,
    Eye,
    ExternalLink,
    FileText,
    Filter,
    Paperclip,
    RefreshCcw,
    Search,
    Send,
    Sparkles,
    Upload,
} from 'lucide-react';

import BadgeStatus from '../components/BadgeStatus';
import { apiGet, apiSendForm, getErrorMessage } from '../services/api';

function RiwayatNomorSuratPage() {
    const currentDate = new Date();

    const [items, setItems] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [filter, setFilter] = useState({
        search: '',
        status: 'all',
        bulan: 'all',
        tahun: 'all',
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

            const params = new URLSearchParams();

            if (filter.status !== 'all') params.append('status', filter.status);
            if (filter.bulan !== 'all') params.append('bulan', filter.bulan);
            if (filter.tahun !== 'all') params.append('tahun', filter.tahun);
            if (filter.search) params.append('search', filter.search);

            const response = await apiGet(`/nomor-surat?${params.toString()}`);

            const rows =
                response.nomor_surats ||
                response.nomor_surat_requests ||
                response.requests ||
                response.data ||
                [];

            setItems(Array.isArray(rows) ? rows : []);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal Memuat Data',
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

    const handleApplyFilter = () => {
        fetchData(false);
    };

    const handleResetFilter = () => {
        setFilter({
            search: '',
            status: 'all',
            bulan: 'all',
            tahun: 'all',
        });

        setTimeout(() => {
            fetchData(false);
        }, 100);
    };

    const refreshSelectedRequest = async () => {
        try {
            const response = await apiGet('/nomor-surat');

            const rows =
                response.nomor_surats ||
                response.nomor_surat_requests ||
                response.requests ||
                response.data ||
                [];

            setItems(Array.isArray(rows) ? rows : []);

            if (selectedRequest) {
                const freshItem = rows.find((item) => item.id === selectedRequest.id);

                if (freshItem) {
                    setSelectedRequest(freshItem);
                }
            }
        } catch (error) {
            console.log(error);
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

        const formData = new FormData();
        formData.append('file_dokumen_final', result.value);

        try {
            await apiSendForm(`/nomor-surat/${item.id}/upload-final`, 'POST', formData);

            await refreshSelectedRequest();

            Swal.fire({
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
                title: 'Gagal Upload',
                text: getErrorMessage(error),
                confirmButtonColor: '#d71920',
            });
        }
    };

    const openPreview = (fileData) => {
        setPreviewFile(fileData);
    };

    const openDownload = (url) => {
        window.open(url, '_blank');
    };

    const getFileExtension = (path) => {
        if (!path) return '';

        const cleanPath = String(path).split('?')[0];
        const parts = cleanPath.split('.');

        return parts.length > 1 ? parts.pop().toLowerCase() : '';
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

    const years = [
        currentDate.getFullYear() - 1,
        currentDate.getFullYear(),
        currentDate.getFullYear() + 1,
    ];

    const stats = useMemo(() => {
        return {
            total: items.length,
            pending: items.filter((item) => item.status === 'pending').length,
            approved: items.filter((item) => item.status === 'approved').length,
            completed: items.filter((item) => item.status === 'completed').length,
            revision: items.filter((item) => item.status === 'revision').length,
            finalSubmitted: items.filter((item) => item.status === 'final_submitted').length,
        };
    }, [items]);

    const filteredItems = useMemo(() => {
        const keyword = filter.search.toLowerCase();

        return items.filter((item) => {
            const searchableText = [
                item.nomor_surat,
                item.judul_surat,
                item.tujuan_surat,
                item.nama_pic_unit_pemohon,
                item.penandatangan_surat,
                item.kode_perihal?.kode,
                item.kode_pemilik?.kode,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            const matchSearch = !keyword || searchableText.includes(keyword);
            const matchStatus = filter.status === 'all' || item.status === filter.status;

            let matchBulan = true;

            if (filter.bulan !== 'all') {
                const date = new Date(item.tanggal_surat);
                matchBulan = String(date.getMonth() + 1) === String(filter.bulan);
            }

            let matchTahun = true;

            if (filter.tahun !== 'all') {
                const date = new Date(item.tanggal_surat);
                matchTahun = String(date.getFullYear()) === String(filter.tahun);
            }

            return matchSearch && matchStatus && matchBulan && matchTahun;
        });
    }, [items, filter]);

    if (loading) {
        return <RiwayatSkeleton />;
    }

    return (
        <div className="space-y-7 no-scrollbar">
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#d71920] via-[#a90f1b] to-[#210711] text-white shadow-xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.24),_transparent_32%)]"></div>
                <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative p-6 md:p-8">
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-black">
                                <Sparkles size={14} />
                                Riwayat Pengajuan Nomor Surat
                            </div>

                            <h2 className="text-2xl md:text-4xl font-black tracking-tight mt-5">
                                Pantau Progres Pengajuan Anda
                            </h2>

                            <p className="text-white/75 mt-3 max-w-2xl leading-relaxed">
                                Lihat status pengajuan nomor surat, dokumen awal, dokumen final, catatan revisi, hingga status penyelesaian dari SEKPiM.
                            </p>
                        </div>

                        <div className="bg-white/10 border border-white/15 rounded-[28px] p-5 min-w-[260px] backdrop-blur-xl">
                            <p className="text-sm text-white/70 font-semibold">
                                Total Riwayat
                            </p>

                            <div className="flex items-end gap-2 mt-2">
                                <h3 className="text-5xl font-black">
                                    {stats.total}
                                </h3>

                                <p className="text-sm text-white/60 mb-2">
                                    pengajuan
                                </p>
                            </div>

                            <p className="text-xs text-white/60 mt-3">
                                Berdasarkan data pengajuan yang dapat Anda akses.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
                <StatCard
                    title="Total"
                    value={stats.total}
                    icon={<FileText size={23} />}
                    tone="blue"
                />

                <StatCard
                    title="Pending"
                    value={stats.pending}
                    icon={<Clock size={23} />}
                    tone="yellow"
                />

                <StatCard
                    title="Approved"
                    value={stats.approved}
                    icon={<Send size={23} />}
                    tone="green"
                />

                <StatCard
                    title="Revisi"
                    value={stats.revision}
                    icon={<RefreshCcw size={23} />}
                    tone="orange"
                />

                <StatCard
                    title="Completed"
                    value={stats.completed}
                    icon={<CheckCircle size={23} />}
                    tone="red"
                />
            </div>

            <div className="bg-white/90 backdrop-blur-xl border border-white shadow-sm rounded-[28px] p-5 md:p-6">
                <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <Filter size={19} className="text-red-700" />

                            <h3 className="text-lg font-black text-slate-950">
                                Filter Riwayat
                            </h3>
                        </div>

                        <p className="text-sm text-slate-500 mt-1">
                            Cari pengajuan berdasarkan nomor, perihal, PIC, status, bulan, atau tahun.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 w-full xl:w-auto">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-slate-500 mb-2">
                                Pencarian
                            </label>

                            <div className="relative">
                                <Search
                                    size={17}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    name="search"
                                    value={filter.search}
                                    onChange={handleFilterChange}
                                    className="form-control pl-11"
                                    placeholder="Cari nomor/perihal/PIC..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 mb-2">
                                Status
                            </label>

                            <select
                                name="status"
                                value={filter.status}
                                onChange={handleFilterChange}
                                className="form-control"
                            >
                                <option value="all">Semua</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="final_submitted">Final Submitted</option>
                                <option value="revision">Revision</option>
                                <option value="completed">Completed</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 mb-2">
                                Bulan
                            </label>

                            <select
                                name="bulan"
                                value={filter.bulan}
                                onChange={handleFilterChange}
                                className="form-control"
                            >
                                <option value="all">Semua</option>
                                <option value="1">Januari</option>
                                <option value="2">Februari</option>
                                <option value="3">Maret</option>
                                <option value="4">April</option>
                                <option value="5">Mei</option>
                                <option value="6">Juni</option>
                                <option value="7">Juli</option>
                                <option value="8">Agustus</option>
                                <option value="9">September</option>
                                <option value="10">Oktober</option>
                                <option value="11">November</option>
                                <option value="12">Desember</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 mb-2">
                                Tahun
                            </label>

                            <select
                                name="tahun"
                                value={filter.tahun}
                                onChange={handleFilterChange}
                                className="form-control"
                            >
                                <option value="all">Semua</option>

                                {years.map((year) => (
                                    <option key={year} value={String(year)}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-5">
                    <button
                        type="button"
                        onClick={handleApplyFilter}
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#d71920] hover:bg-[#bd1118] text-white text-sm font-black transition"
                    >
                        <Search size={16} />
                        Terapkan Filter
                    </button>

                    <button
                        type="button"
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-black transition disabled:opacity-60"
                    >
                        <RefreshCcw
                            size={16}
                            className={refreshing ? 'animate-spin' : ''}
                        />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={handleResetFilter}
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-black transition"
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl border border-white shadow-sm rounded-[28px] p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                    <div>
                        <h3 className="text-lg font-black text-slate-950">
                            Daftar Riwayat Pengajuan
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                            Menampilkan {filteredItems.length} pengajuan dari total {items.length} data.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-50 text-red-700 text-sm font-black">
                        <CalendarDays size={16} />
                        Tahun {filter.tahun === 'all' ? 'Semua' : filter.tahun}
                    </div>
                </div>

                {filteredItems.length > 0 ? (
                    <>
                        <div className="hidden xl:block overflow-x-auto border border-slate-200 rounded-3xl no-scrollbar">
                            <table className="w-full min-w-[1100px]">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="text-left px-4 py-4 text-xs font-black text-slate-600">
                                            No.
                                        </th>

                                        <th className="text-left px-4 py-4 text-xs font-black text-slate-600">
                                            Nomor / Perihal
                                        </th>

                                        <th className="text-left px-4 py-4 text-xs font-black text-slate-600">
                                            PIC / TTD
                                        </th>

                                        <th className="text-left px-4 py-4 text-xs font-black text-slate-600">
                                            Tanggal
                                        </th>

                                        <th className="text-left px-4 py-4 text-xs font-black text-slate-600">
                                            Status
                                        </th>

                                        <th className="text-left px-4 py-4 text-xs font-black text-slate-600">
                                            Dokumen
                                        </th>

                                        <th className="text-left px-4 py-4 text-xs font-black text-slate-600">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filteredItems.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition align-top">
                                            <td className="px-4 py-4 text-sm font-black text-slate-500">
                                                {index + 1}
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="text-sm font-black text-slate-950">
                                                    {item.nomor_surat || 'Nomor belum tersedia'}
                                                </p>

                                                <p className="text-sm text-slate-600 mt-1 max-w-[320px] line-clamp-2">
                                                    {item.judul_surat || '-'}
                                                </p>

                                                <p className="text-xs text-slate-400 mt-1">
                                                    {item.kode_perihal?.kode || '-'} / {item.kode_pemilik?.kode || '-'}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="text-sm font-bold text-slate-700">
                                                    {item.nama_pic_unit_pemohon || '-'}
                                                </p>

                                                <p className="text-xs text-slate-500 mt-1">
                                                    TTD: {item.penandatangan_surat || '-'}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <p className="text-sm font-bold text-slate-700">
                                                    {formatDate(item.tanggal_surat)}
                                                </p>

                                                <p className="text-xs text-slate-400 mt-1">
                                                    {formatStatusTanggal(item.status_tanggal)}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4">
                                                <BadgeStatus status={item.status} />
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex flex-col gap-2">
                                                    {item.file_dokumen ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => openPreview({
                                                                title: 'Preview Dokumen Awal',
                                                                label: 'Dokumen Awal',
                                                                previewUrl: `/nomor-surat/${item.id}/preview-awal`,
                                                                downloadUrl: `/nomor-surat/${item.id}/download-awal`,
                                                                filePath: item.file_dokumen,
                                                            })}
                                                            className="inline-flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-red-700 transition"
                                                        >
                                                            <Paperclip size={14} />
                                                            Dokumen Awal
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">
                                                            Dokumen awal kosong
                                                        </span>
                                                    )}

                                                    {item.file_dokumen_final ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => openPreview({
                                                                title: 'Preview Dokumen Final',
                                                                label: 'Dokumen Final',
                                                                previewUrl: `/nomor-surat/${item.id}/preview-final`,
                                                                downloadUrl: `/nomor-surat/${item.id}/download-final`,
                                                                filePath: item.file_dokumen_final,
                                                            })}
                                                            className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 hover:text-blue-800 transition"
                                                        >
                                                            <Paperclip size={14} />
                                                            Dokumen Final
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">
                                                            Final belum ada
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedRequest(item)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition"
                                                    >
                                                        <Eye size={14} />
                                                        Detail
                                                    </button>

                                                    {['approved', 'revision'].includes(item.status) ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUploadFinal(item)}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-black transition ${
                                                                item.status === 'revision'
                                                                    ? 'bg-orange-500 hover:bg-orange-600'
                                                                    : 'bg-[#d71920] hover:bg-[#bd1118]'
                                                            }`}
                                                        >
                                                            <Upload size={14} />
                                                            Upload Final
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="xl:hidden space-y-4">
                            {filteredItems.map((item) => (
                                <MobileRiwayatCard
                                    key={item.id}
                                    item={item}
                                    formatDate={formatDate}
                                    formatStatusTanggal={formatStatusTanggal}
                                    onOpen={() => setSelectedRequest(item)}
                                    onUploadFinal={() => handleUploadFinal(item)}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <EmptyState />
                )}
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

function StatCard({ title, value, icon, tone }) {
    const tones = {
        blue: 'bg-blue-50 text-blue-700',
        yellow: 'bg-yellow-50 text-yellow-700',
        green: 'bg-green-50 text-green-700',
        orange: 'bg-orange-50 text-orange-700',
        red: 'bg-red-50 text-red-700',
    };

    return (
        <div className="bg-white/90 backdrop-blur-xl rounded-[28px] border border-white shadow-sm p-5 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-bold text-slate-500">
                        {title}
                    </p>

                    <h3 className="text-4xl font-black text-slate-950 mt-2">
                        {value || 0}
                    </h3>
                </div>

                <div className={`w-13 h-13 rounded-2xl flex items-center justify-center ${tones[tone] || tones.red}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function MobileRiwayatCard({
    item,
    formatDate,
    formatStatusTanggal,
    onOpen,
    onUploadFinal,
}) {
    return (
        <div className="bg-white border border-slate-200 rounded-[28px] p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-black text-slate-950">
                        {item.nomor_surat || 'Nomor belum tersedia'}
                    </p>

                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                        {item.judul_surat || '-'}
                    </p>
                </div>

                <BadgeStatus status={item.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
                <SmallInfo label="PIC" value={item.nama_pic_unit_pemohon || '-'} />
                <SmallInfo label="Tanggal" value={formatDate(item.tanggal_surat)} />
                <SmallInfo label="Status Tanggal" value={formatStatusTanggal(item.status_tanggal)} />
                <SmallInfo label="Kode" value={`${item.kode_perihal?.kode || '-'} / ${item.kode_pemilik?.kode || '-'}`} />
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
                <button
                    type="button"
                    onClick={onOpen}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition"
                >
                    <Eye size={14} />
                    Detail
                </button>

                {['approved', 'revision'].includes(item.status) ? (
                    <button
                        type="button"
                        onClick={onUploadFinal}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-black transition ${
                            item.status === 'revision'
                                ? 'bg-orange-500 hover:bg-orange-600'
                                : 'bg-[#d71920] hover:bg-[#bd1118]'
                        }`}
                    >
                        <Upload size={14} />
                        Upload Final
                    </button>
                ) : null}
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

    return (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center px-4 py-8">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto no-scrollbar">
                <div className="p-6 md:p-7 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-black text-red-700">
                                Detail Riwayat Pengajuan
                            </p>

                            <h3 className="text-2xl font-black text-slate-950 mt-1">
                                {item.judul_surat || '-'}
                            </h3>

                            <p className="text-sm text-slate-500 mt-2">
                                Periksa status, dokumen, dan catatan proses pengajuan nomor surat.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black transition"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="p-6 md:p-7 space-y-6">
                    <div>
                        <p className="text-sm font-black text-slate-800 mb-3">
                            Informasi Surat
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoBox label="Nomor Surat" value={item.nomor_surat || 'Nomor belum tersedia'} highlight />
                            <InfoBox label="Status" customValue={<BadgeStatus status={item.status} />} />
                            <InfoBox label="Tanggal Surat" value={formatDate(item.tanggal_surat)} />
                            <InfoBox label="Status Tanggal" value={formatStatusTanggal(item.status_tanggal)} />
                            <InfoBox label="Kode Perihal" value={`${item.kode_perihal?.kode || '-'} - ${item.kode_perihal?.nama_perihal || '-'}`} />
                            <InfoBox label="Kode Pemilik Proses" value={`${item.kode_pemilik?.kode || '-'} - ${item.kode_pemilik?.nama_pemilik || item.kode_pemilik?.unit || '-'}`} />
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-black text-slate-800 mb-3">
                            Penanggung Jawab
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoBox label="Nama PIC Unit Pemohon" value={item.nama_pic_unit_pemohon || '-'} highlight />
                            <InfoBox label="Penandatangan Surat / TTD" value={item.penandatangan_surat || '-'} />
                            <InfoBox label="Unit Pemohon" value={item.user?.unit || '-'} />
                            <InfoBox label="Akun Pemohon" value={item.user?.name || '-'} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <TextPanel title="Tujuan Surat" value={item.tujuan_surat || '-'} />
                        <TextPanel title="Keterangan" value={item.keterangan || '-'} />
                    </div>

                    {item.revision_note ? (
                        <div className="bg-orange-50 border border-orange-100 rounded-3xl p-4">
                            <p className="text-sm font-black text-orange-700">
                                Catatan Revisi
                            </p>

                            <p className="text-sm text-orange-700 mt-2 leading-relaxed">
                                {item.revision_note}
                            </p>
                        </div>
                    ) : null}

                    {item.rejected_reason ? (
                        <div className="bg-red-50 border border-red-100 rounded-3xl p-4">
                            <p className="text-sm font-black text-red-700">
                                Alasan Penolakan
                            </p>

                            <p className="text-sm text-red-700 mt-2 leading-relaxed">
                                {item.rejected_reason}
                            </p>
                        </div>
                    ) : null}

                    <div className="border border-slate-200 rounded-3xl p-4">
                        <p className="text-sm font-black text-slate-800 mb-4">
                            Aksi Dokumen
                        </p>

                        <div className="flex flex-wrap gap-3">
                            {item.file_dokumen ? (
                                <button
                                    type="button"
                                    onClick={() => openPreview({
                                        title: 'Preview Dokumen Awal',
                                        label: 'Dokumen Awal',
                                        previewUrl: `/nomor-surat/${item.id}/preview-awal`,
                                        downloadUrl: `/nomor-surat/${item.id}/download-awal`,
                                        filePath: item.file_dokumen,
                                    })}
                                    className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-black bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
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
                                        previewUrl: `/nomor-surat/${item.id}/preview-final`,
                                        downloadUrl: `/nomor-surat/${item.id}/download-final`,
                                        filePath: item.file_dokumen_final,
                                    })}
                                    className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-black bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
                                >
                                    <Eye size={16} />
                                    Lihat Dokumen Final
                                </button>
                            ) : null}

                            {canUploadFinal ? (
                                <button
                                    type="button"
                                    onClick={() => onUploadFinal(item)}
                                    className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-black transition text-white ${
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
                                    Belum ada dokumen yang dapat ditampilkan pada status ini.
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
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-8">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">
                <div className="p-5 md:p-6 border-b border-slate-100 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-black text-red-700">
                            {file.title}
                        </p>

                        <h3 className="text-lg font-black text-slate-950 mt-1">
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
                        className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black transition"
                    >
                        ×
                    </button>
                </div>

                <div className="p-4 md:p-5 bg-slate-50 flex-1 overflow-auto no-scrollbar">
                    {canInlinePreview ? (
                        isImage ? (
                            <div className="bg-white rounded-3xl border border-slate-200 p-4 flex items-center justify-center min-h-[60vh]">
                                <img
                                    src={file.previewUrl}
                                    alt={file.label}
                                    className="max-w-full max-h-[70vh] rounded-2xl object-contain"
                                />
                            </div>
                        ) : (
                            <iframe
                                src={file.previewUrl}
                                title={file.label}
                                className="w-full h-[70vh] bg-white rounded-3xl border border-slate-200"
                            />
                        )
                    ) : (
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 min-h-[50vh] flex flex-col items-center justify-center text-center">
                            <FileText size={56} className="text-slate-300" />

                            <h4 className="text-lg font-black text-slate-800 mt-4">
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
                            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-black bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                            <ExternalLink size={16} />
                            Buka Tab Baru
                        </button>

                        <button
                            type="button"
                            onClick={() => openDownload(file.downloadUrl)}
                            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-black bg-[#d71920] hover:bg-[#bd1118] text-white transition"
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
        <div className="bg-white border border-slate-200 rounded-3xl p-4">
            <p className="text-xs font-black text-slate-500 uppercase tracking-wide">
                {label}
            </p>

            <div className={`mt-2 text-sm font-black ${highlight ? 'text-red-700' : 'text-slate-800'}`}>
                {customValue || value || '-'}
            </div>
        </div>
    );
}

function TextPanel({ title, value }) {
    return (
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-4">
            <p className="text-sm font-black text-slate-700">
                {title}
            </p>

            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {value}
            </p>
        </div>
    );
}

function SmallInfo({ label, value }) {
    return (
        <div className="bg-slate-50 rounded-2xl px-3 py-3">
            <p className="text-xs font-black text-slate-400 uppercase">
                {label}
            </p>

            <p className="text-sm font-black text-slate-800 mt-1 line-clamp-2">
                {value || '-'}
            </p>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="text-center py-16">
            <div className="w-20 h-20 rounded-[28px] bg-slate-50 text-slate-300 flex items-center justify-center mx-auto">
                <FileText size={42} />
            </div>

            <h3 className="text-xl font-black text-slate-900 mt-5">
                Belum ada riwayat pengajuan
            </h3>

            <p className="text-slate-500 mt-2 max-w-xl mx-auto leading-relaxed">
                Data pengajuan akan muncul setelah Anda mengirim pengajuan nomor surat atau mengubah filter pencarian.
            </p>
        </div>
    );
}

function RiwayatSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-64 bg-white rounded-[32px]"></div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                <div className="h-32 bg-white rounded-[28px]"></div>
                <div className="h-32 bg-white rounded-[28px]"></div>
                <div className="h-32 bg-white rounded-[28px]"></div>
                <div className="h-32 bg-white rounded-[28px]"></div>
                <div className="h-32 bg-white rounded-[28px]"></div>
            </div>

            <div className="h-48 bg-white rounded-[28px]"></div>
            <div className="h-96 bg-white rounded-[28px]"></div>
        </div>
    );
}

export default RiwayatNomorSuratPage;
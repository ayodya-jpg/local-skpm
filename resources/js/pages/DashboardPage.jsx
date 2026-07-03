import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
    ArrowLeft,
    Building2,
    CheckCircle,
    Clock,
    Download,
    Eye,
    ExternalLink,
    FileText,
    RefreshCcw,
    ShieldAlert,
    Upload,
} from 'lucide-react';

import BadgeStatus from '../components/BadgeStatus';
import { apiGet, apiSendForm, getErrorMessage } from '../services/api';

function DashboardPage() {
    const currentDate = new Date();

    const [user, setUser] = useState(null);

    const [filter, setFilter] = useState({
        bulan: String(currentDate.getMonth() + 1),
        tahun: String(currentDate.getFullYear()),
    });

    const [units, setUnits] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [detail, setDetail] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!user) return;

        if (selectedUnit) {
            fetchUnitDetail(selectedUnit, true);
        } else {
            fetchUnits(true);
        }
    }, [filter]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);

            const userData = await apiGet('/me');
            setUser(userData.user);

            const unitsData = await apiGet(getUnitsUrl());
            setUnits(unitsData.units || []);
            setLastUpdated(new Date());
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

    const fetchUnits = async (silent = false) => {
        try {
            if (!silent) {
                setRefreshing(true);
            }

            const unitsData = await apiGet(getUnitsUrl());

            setUnits(unitsData.units || []);
            setLastUpdated(new Date());
        } catch (error) {
            if (!silent) {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: getErrorMessage(error),
                    confirmButtonColor: '#d71920',
                });
            }
        } finally {
            setRefreshing(false);
        }
    };

    const fetchUnitDetail = async (unit, silent = false) => {
        try {
            if (!silent) {
                setDetailLoading(true);
            }

            const unitDetail = await apiGet(getUnitDetailUrl(unit));

            setDetail(unitDetail);
            setSelectedUnit(unit);
            setLastUpdated(new Date());
        } catch (error) {
            setSelectedUnit(null);
            setDetail(null);

            Swal.fire({
                icon: 'error',
                title: 'Akses Ditolak / Gagal',
                text: getErrorMessage(error),
                confirmButtonColor: '#d71920',
            });
        } finally {
            setDetailLoading(false);
        }
    };

    const getUnitsUrl = () => {
        const params = new URLSearchParams();

        params.append('bulan', filter.bulan);
        params.append('tahun', filter.tahun);

        return `/dashboard-units?${params.toString()}`;
    };

    const getUnitDetailUrl = (unit) => {
        const params = new URLSearchParams();

        params.append('bulan', filter.bulan);
        params.append('tahun', filter.tahun);

        return `/dashboard-units/${encodeURIComponent(unit)}?${params.toString()}`;
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;

        setFilter((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleRefresh = () => {
        if (selectedUnit) {
            fetchUnitDetail(selectedUnit, false);
            return;
        }

        fetchUnits(false);
    };

    const handleBackToUnits = () => {
        setSelectedUnit(null);
        setDetail(null);
        setSelectedRequest(null);
        setPreviewFile(null);
        fetchUnits(true);
    };

    const canOpenUnit = (unitItem) => {
        if (!user) return false;

        return unitItem.can_open_detail === true;
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

    const openPreview = (fileData) => {
        setPreviewFile(fileData);
    };

    const refreshSelectedRequest = (updatedDetail) => {
        if (!selectedRequest || !updatedDetail) return;

        const allItems = [
            ...(updatedDetail.latest_requests || []),
            ...(updatedDetail.need_follow_up || []),
        ];

        const freshItem = allItems.find((item) => item.id === selectedRequest.id);

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

        const formData = new FormData();
        formData.append('file_dokumen_final', result.value);

        try {
            await apiSendForm(`/nomor-surat/${item.id}/upload-final`, 'POST', formData);

            if (selectedUnit) {
                const updatedDetail = await apiGet(getUnitDetailUrl(selectedUnit));
                setDetail(updatedDetail);
                refreshSelectedRequest(updatedDetail);
            }

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

    const formatTime = (date) => {
        if (!date) return '-';

        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
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

    if (loading) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <p className="text-slate-500">Memuat dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3">
                            {selectedUnit ? (
                                <button
                                    type="button"
                                    onClick={handleBackToUnits}
                                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                            ) : null}

                            <div>
                                <h2 className="text-2xl font-bold text-slate-950">
                                    {selectedUnit
                                        ? `Dashboard Unit ${String(selectedUnit).toUpperCase()}`
                                        : 'Dashboard Unit'}
                                </h2>

                                <p className="text-slate-500 mt-2">
                                    {selectedUnit
                                        ? 'Klik judul atau nomor surat untuk melihat detail pengajuan. Dokumen dapat dipreview terlebih dahulu sebelum diunduh.'
                                        : user?.unit === 'sekpim'
                                            ? 'Pilih salah satu unit untuk melihat detail dashboard pengajuan nomor surat.'
                                            : 'Anda dapat melihat ringkasan semua unit, tetapi hanya bisa membuka detail unit sendiri.'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                                    user?.unit === 'sekpim'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-blue-100 text-blue-700'
                                }`}
                            >
                                {user?.unit === 'sekpim'
                                    ? 'Mode Admin SEKPiM'
                                    : `Mode Unit ${user?.unit || '-'}`}
                            </span>

                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                                Ringkasan semua unit aktif
                            </span>

                            <span className="text-xs text-slate-400">
                                Update terakhir: {formatTime(lastUpdated)}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">
                                Bulan
                            </label>

                            <select
                                name="bulan"
                                value={filter.bulan}
                                onChange={handleFilterChange}
                                className="w-full lg:w-44 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                            >
                                <option value="all">Semua Bulan</option>
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
                            <label className="block text-xs font-bold text-slate-500 mb-2">
                                Tahun
                            </label>

                            <select
                                name="tahun"
                                value={filter.tahun}
                                onChange={handleFilterChange}
                                className="w-full lg:w-36 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                            >
                                <option value="all">Semua Tahun</option>
                                {years.map((year) => (
                                    <option key={year} value={String(year)}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={refreshing || detailLoading}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition disabled:opacity-60"
                        >
                            <RefreshCcw
                                size={16}
                                className={refreshing || detailLoading ? 'animate-spin' : ''}
                            />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {!selectedUnit ? (
                <UnitDashboardList
                    units={units}
                    user={user}
                    canOpenUnit={canOpenUnit}
                    onOpenUnit={fetchUnitDetail}
                />
            ) : (
                <UnitDashboardDetail
                    detail={detail}
                    loading={detailLoading}
                    formatDate={formatDate}
                    onOpenRequest={setSelectedRequest}
                />
            )}

            {selectedRequest ? (
                <RequestDetailModal
                    item={selectedRequest}
                    user={user}
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

function UnitDashboardList({ units, user, canOpenUnit, onOpenUnit }) {
    if (!units.length) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center">
                <Building2 size={42} className="mx-auto text-slate-300" />

                <h3 className="text-lg font-bold text-slate-800 mt-4">
                    Belum ada data pengajuan
                </h3>

                <p className="text-slate-500 mt-2">
                    Data unit akan muncul setelah ada pengajuan nomor surat.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {units.map((unit) => {
                    const allowed = canOpenUnit(unit);

                    return (
                        <button
                            key={unit.unit}
                            type="button"
                            onClick={() => {
                                if (!allowed) return;
                                onOpenUnit(unit.unit);
                            }}
                            disabled={!allowed}
                            className={`text-left bg-white rounded-3xl border p-6 transition shadow-sm ${
                                allowed
                                    ? 'border-slate-100 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                                    : 'border-slate-200 cursor-not-allowed'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-red-50 text-red-700">
                                        <Building2 size={26} />
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-950 mt-4">
                                        Unit {unit.nama_unit}
                                    </h3>

                                    <p className="text-sm text-slate-500 mt-1">
                                        {allowed
                                            ? 'Klik untuk melihat detail lengkap dashboard unit.'
                                            : 'Anda hanya dapat melihat ringkasan umum unit ini.'}
                                    </p>
                                </div>

                                {!allowed ? (
                                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                                        <ShieldAlert size={13} />
                                        Ringkasan
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                                        Detail
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-3 mt-6">
                                <MiniStat
                                    label="Open"
                                    value={unit.total_pengajuan}
                                />

                                <MiniStat
                                    label="Review"
                                    value={unit.menunggu_tindak_lanjut}
                                />

                                <MiniStat
                                    label="Close"
                                    value={unit.total_completed}
                                />
                            </div>

                            <div className="mt-5 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-500 rounded-full transition-all"
                                    style={{
                                        width: `${
                                            unit.total_pengajuan > 0
                                                ? Math.round((unit.total_completed / unit.total_pengajuan) * 100)
                                                : 0
                                        }%`,
                                    }}
                                />
                            </div>

                            <p className="text-xs text-slate-400 mt-2">
                                Progress close:{' '}
                                {unit.total_pengajuan > 0
                                    ? Math.round((unit.total_completed / unit.total_pengajuan) * 100)
                                    : 0}
                                %
                            </p>
                        </button>
                    );
                })}
            </div>

            {user?.unit !== 'sekpim' ? (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 text-sm text-blue-700">
                    Anda dapat melihat ringkasan semua unit, tetapi hanya dapat membuka detail lengkap dashboard unit sendiri.
                </div>
            ) : (
                <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-sm text-red-700">
                    Admin SEKPiM dapat melihat ringkasan dan membuka detail lengkap seluruh unit.
                </div>
            )}
        </div>
    );
}

function UnitDashboardDetail({
    detail,
    loading,
    formatDate,
    onOpenRequest,
}) {
    if (loading || !detail) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <p className="text-slate-500">Memuat detail unit...</p>
            </div>
        );
    }

    const stats = detail.stats || {};

    const reviewTotal =
        (stats.total_pending || 0) +
        (stats.total_final_submitted || 0) +
        (stats.total_revision || 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <StatCard
                    title="Open / Total Pengajuan"
                    value={stats.total_pengajuan}
                    icon={<FileText size={26} />}
                    color="bg-blue-50 text-blue-700"
                />

                <StatCard
                    title="Review / Tindak Lanjut"
                    value={reviewTotal}
                    icon={<Clock size={26} />}
                    color="bg-yellow-50 text-yellow-700"
                />

                <StatCard
                    title="Close / Selesai"
                    value={stats.total_completed}
                    icon={<CheckCircle size={26} />}
                    color="bg-green-50 text-green-700"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <RequestTable
                    title="Pengajuan Terbaru"
                    description="Klik judul atau nomor surat untuk membuka detail pengajuan."
                    items={detail.latest_requests || []}
                    formatDate={formatDate}
                    onOpenRequest={onOpenRequest}
                />

                <RequestTable
                    title="Review / Tindak Lanjut"
                    description="Daftar pengajuan yang masih perlu diproses, diverifikasi, atau diperbaiki."
                    items={detail.need_follow_up || []}
                    formatDate={formatDate}
                    onOpenRequest={onOpenRequest}
                />
            </div>
        </div>
    );
}

function MiniStat({ label, value }) {
    return (
        <div className="rounded-2xl bg-slate-50 px-3 py-3">
            <p className="text-xs font-semibold text-slate-500">
                {label}
            </p>

            <p className="text-xl font-bold text-slate-950 mt-1">
                {value || 0}
            </p>
        </div>
    );
}

function StatCard({ title, value, icon, color }) {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-500">
                        {title}
                    </p>

                    <h3 className="text-3xl font-bold text-slate-950 mt-2">
                        {value || 0}
                    </h3>
                </div>

                <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

function RequestTable({
    title,
    description,
    items,
    formatDate,
    onOpenRequest,
}) {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-950">
                    {title}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                    {description}
                </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full min-w-[760px]">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">
                                Judul / Nomor
                            </th>

                            <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">
                                Pemohon
                            </th>

                            <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">
                                Tanggal
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
                        {items.length > 0 ? (
                            items.map((item) => (
                                <tr key={item.id} className="align-top hover:bg-slate-50/70 transition">
                                    <td className="px-4 py-4">
                                        <button
                                            type="button"
                                            onClick={() => onOpenRequest(item)}
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
                                        <p className="text-sm font-semibold text-slate-700">
                                            {item.nama_pic_unit_pemohon || item.user?.name || '-'}
                                        </p>

                                        <p className="text-xs text-slate-400 mt-1 capitalize">
                                            PIC Unit Pemohon
                                        </p>
                                    </td>

                                    <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
                                        {formatDate(item.tanggal_surat)}
                                    </td>

                                    <td className="px-4 py-4">
                                        <BadgeStatus status={item.status} />
                                    </td>

                                    <td className="px-4 py-4">
                                        <button
                                            type="button"
                                            onClick={() => onOpenRequest(item)}
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
                                <td colSpan="5" className="px-4 py-8 text-center text-slate-500 text-sm">
                                    Tidak ada data.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function RequestDetailModal({
    item,
    user,
    formatDate,
    formatStatusTanggal,
    onClose,
    onUploadFinal,
    openPreview,
}) {
    const isOwnRequest = item.user?.id === user?.id;
    const canUploadFinal = isOwnRequest && ['approved', 'revision'].includes(item.status);

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
                                Detail Pengajuan Surat
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

                    {!isOwnRequest && user?.unit !== 'sekpim' ? (
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                            <p className="text-sm text-blue-700 leading-relaxed">
                                Pengajuan ini bukan milik akun Anda. Anda hanya dapat melihat informasi detail, tidak dapat mengunggah dokumen final.
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

export default DashboardPage;
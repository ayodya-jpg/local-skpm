import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import {
    ArrowLeft,
    BarChart3,
    Building2,
    CheckCircle,
    Clock,
    Download,
    Eye,
    ExternalLink,
    FileText,
    RefreshCcw,
    Search,
    ShieldAlert,
    Sparkles,
    TrendingUp,
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
        search: '',
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
    }, [filter.bulan, filter.tahun]);

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

    const filteredUnits = useMemo(() => {
        const keyword = filter.search.toLowerCase();

        if (!keyword) return units;

        return units.filter((item) => {
            return (
                String(item.unit || '').toLowerCase().includes(keyword) ||
                String(item.nama_unit || '').toLowerCase().includes(keyword)
            );
        });
    }, [units, filter.search]);

    const globalStats = useMemo(() => {
        const totalPengajuan = units.reduce((sum, item) => sum + Number(item.total_pengajuan || 0), 0);
        const totalReview = units.reduce((sum, item) => sum + Number(item.menunggu_tindak_lanjut || 0), 0);
        const totalCompleted = units.reduce((sum, item) => sum + Number(item.total_completed || 0), 0);
        const totalUnits = units.length;

        const progress = totalPengajuan > 0
            ? Math.round((totalCompleted / totalPengajuan) * 100)
            : 0;

        return {
            totalPengajuan,
            totalReview,
            totalCompleted,
            totalUnits,
            progress,
        };
    }, [units]);

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-7 no-scrollbar">
            <DashboardHero
                user={user}
                selectedUnit={selectedUnit}
                lastUpdated={lastUpdated}
                formatTime={formatTime}
                onBack={handleBackToUnits}
                stats={globalStats}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <ExecutiveStatCard
                    title="Total Pengajuan"
                    value={selectedUnit ? detail?.stats?.total_pengajuan || 0 : globalStats.totalPengajuan}
                    description="Seluruh pengajuan pada filter aktif"
                    icon={<FileText size={24} />}
                    tone="blue"
                />

                <ExecutiveStatCard
                    title="Review"
                    value={
                        selectedUnit
                            ? (detail?.stats?.total_pending || 0) +
                              (detail?.stats?.total_final_submitted || 0) +
                              (detail?.stats?.total_revision || 0)
                            : globalStats.totalReview
                    }
                    description="Butuh tindak lanjut"
                    icon={<Clock size={24} />}
                    tone="yellow"
                />

                <ExecutiveStatCard
                    title="Selesai"
                    value={selectedUnit ? detail?.stats?.total_completed || 0 : globalStats.totalCompleted}
                    description="Sudah closed"
                    icon={<CheckCircle size={24} />}
                    tone="green"
                />

                <ExecutiveStatCard
                    title={selectedUnit ? 'Progress Unit' : 'Total Unit'}
                    value={selectedUnit ? `${calculateDetailProgress(detail)}%` : globalStats.totalUnits}
                    description={selectedUnit ? 'Persentase penyelesaian' : 'Unit dengan pengajuan'}
                    icon={<TrendingUp size={24} />}
                    tone="red"
                />
            </div>

            <div className="bg-white/90 backdrop-blur-xl border border-white shadow-sm rounded-[28px] p-5 md:p-6">
                <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
                    <div>
                        <h3 className="text-lg font-black text-slate-950">
                            Filter Dashboard
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                            Pilih periode dan cari unit untuk mempercepat monitoring data.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full xl:w-auto">
                        {!selectedUnit ? (
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-slate-500 mb-2">
                                    Cari Unit
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
                                        className="w-full xl:w-72 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="Cari nama unit..."
                                    />
                                </div>
                            </div>
                        ) : null}

                        <div>
                            <label className="block text-xs font-black text-slate-500 mb-2">
                                Bulan
                            </label>

                            <select
                                name="bulan"
                                value={filter.bulan}
                                onChange={handleFilterChange}
                                className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
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
                            <label className="block text-xs font-black text-slate-500 mb-2">
                                Tahun
                            </label>

                            <select
                                name="tahun"
                                value={filter.tahun}
                                onChange={handleFilterChange}
                                className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="all">Semua Tahun</option>

                                {years.map((year) => (
                                    <option key={year} value={String(year)}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={refreshing || detailLoading}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-black transition disabled:opacity-60"
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
            </div>

            {!selectedUnit ? (
                <UnitDashboardList
                    units={filteredUnits}
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

function DashboardHero({
    user,
    selectedUnit,
    lastUpdated,
    formatTime,
    onBack,
    stats,
}) {
    return (
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#d71920] via-[#a90f1b] to-[#210711] text-white shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.24),_transparent_32%)]"></div>
            <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative p-6 md:p-8">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-black">
                            <Sparkles size={14} />
                            {user?.unit === 'sekpim' ? 'Mode Admin SEKPiM' : `Mode Unit ${String(user?.unit || '-').toUpperCase()}`}
                        </div>

                        <h2 className="text-2xl md:text-4xl font-black tracking-tight mt-5">
                            {selectedUnit
                                ? `Dashboard Unit ${String(selectedUnit).toUpperCase()}`
                                : `Selamat datang, ${user?.name || 'User'}`}
                        </h2>

                        <p className="text-white/75 mt-3 max-w-2xl leading-relaxed">
                            {selectedUnit
                                ? 'Pantau detail pengajuan, dokumen, dan tindak lanjut dari unit yang dipilih.'
                                : 'Pantau performa pengajuan nomor surat seluruh unit dalam satu dashboard yang ringkas dan mudah dipahami.'}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-5">
                            {selectedUnit ? (
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-[#c4121a] hover:bg-red-50 font-black text-sm transition"
                                >
                                    <ArrowLeft size={16} />
                                    Kembali ke Semua Unit
                                </button>
                            ) : null}

                            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/15 text-sm font-bold">
                                Update terakhir: {formatTime(lastUpdated)}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white/10 border border-white/15 rounded-[28px] p-5 min-w-[260px] backdrop-blur-xl">
                        <p className="text-sm text-white/70 font-semibold">
                            Progress Close
                        </p>

                        <div className="flex items-end gap-2 mt-2">
                            <h3 className="text-5xl font-black">
                                {stats.progress || 0}%
                            </h3>

                            <p className="text-sm text-white/60 mb-2">
                                selesai
                            </p>
                        </div>

                        <div className="h-3 bg-white/15 rounded-full overflow-hidden mt-4">
                            <div
                                className="h-full bg-white rounded-full transition-all"
                                style={{
                                    width: `${stats.progress || 0}%`,
                                }}
                            />
                        </div>

                        <p className="text-xs text-white/60 mt-3">
                            Berdasarkan total pengajuan pada filter aktif.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function UnitDashboardList({ units, user, canOpenUnit, onOpenUnit }) {
    if (!units.length) {
        return (
            <EmptyState
                icon={<Building2 size={44} />}
                title="Belum ada data unit"
                description="Data unit akan muncul setelah ada pengajuan nomor surat pada periode yang dipilih."
            />
        );
    }

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {units.map((unit) => {
                    const allowed = canOpenUnit(unit);
                    const progress = unit.total_pengajuan > 0
                        ? Math.round((unit.total_completed / unit.total_pengajuan) * 100)
                        : 0;

                    return (
                        <button
                            key={unit.unit}
                            type="button"
                            onClick={() => {
                                if (!allowed) return;
                                onOpenUnit(unit.unit);
                            }}
                            disabled={!allowed}
                            className={`group text-left bg-white/90 backdrop-blur-xl rounded-[28px] border p-6 transition-all shadow-sm ${
                                allowed
                                    ? 'border-white hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                                    : 'border-slate-200 cursor-not-allowed opacity-80'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${
                                        allowed
                                            ? 'bg-red-50 text-red-700 group-hover:bg-[#d71920] group-hover:text-white'
                                            : 'bg-slate-100 text-slate-500'
                                    } transition`}>
                                        <Building2 size={27} />
                                    </div>

                                    <h3 className="text-xl font-black text-slate-950 mt-4">
                                        Unit {unit.nama_unit}
                                    </h3>

                                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                                        {allowed
                                            ? 'Klik untuk melihat detail lengkap dashboard unit.'
                                            : 'Anda hanya dapat melihat ringkasan umum unit ini.'}
                                    </p>
                                </div>

                                {!allowed ? (
                                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-black">
                                        <ShieldAlert size={13} />
                                        Ringkasan
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-black">
                                        Detail
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-3 mt-6">
                                <MiniStat label="Open" value={unit.total_pengajuan} />
                                <MiniStat label="Review" value={unit.menunggu_tindak_lanjut} />
                                <MiniStat label="Close" value={unit.total_completed} />
                            </div>

                            <div className="mt-5">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                                    <span>Progress Close</span>
                                    <span>{progress}%</span>
                                </div>

                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#d71920] to-[#ff5964] rounded-full transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {user?.unit !== 'sekpim' ? (
                <div className="bg-blue-50 border border-blue-100 rounded-3xl px-5 py-4 text-sm text-blue-700 leading-relaxed">
                    Anda dapat melihat ringkasan semua unit, tetapi hanya dapat membuka detail lengkap dashboard unit sendiri.
                </div>
            ) : (
                <div className="bg-red-50 border border-red-100 rounded-3xl px-5 py-4 text-sm text-red-700 leading-relaxed">
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
        return <DetailSkeleton />;
    }

    return (
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
                description="Pengajuan yang masih perlu diproses, diverifikasi, atau diperbaiki."
                items={detail.need_follow_up || []}
                formatDate={formatDate}
                onOpenRequest={onOpenRequest}
            />
        </div>
    );
}

function MiniStat({ label, value }) {
    return (
        <div className="rounded-2xl bg-slate-50 px-3 py-3">
            <p className="text-xs font-bold text-slate-500">
                {label}
            </p>

            <p className="text-2xl font-black text-slate-950 mt-1">
                {value || 0}
            </p>
        </div>
    );
}

function ExecutiveStatCard({ title, value, description, icon, tone }) {
    const tones = {
        blue: 'bg-blue-50 text-blue-700',
        yellow: 'bg-yellow-50 text-yellow-700',
        green: 'bg-green-50 text-green-700',
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

                    <p className="text-sm text-slate-500 mt-2">
                        {description}
                    </p>
                </div>

                <div className={`w-13 h-13 rounded-2xl flex items-center justify-center ${tones[tone] || tones.red}`}>
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
        <div className="bg-white/90 backdrop-blur-xl rounded-[28px] shadow-sm border border-white p-6">
            <div className="mb-5">
                <h3 className="text-lg font-black text-slate-950">
                    {title}
                </h3>

                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    {description}
                </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-3xl no-scrollbar">
                <table className="w-full min-w-[760px]">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left px-4 py-4 text-xs font-black text-slate-600">
                                Judul / Nomor
                            </th>

                            <th className="text-left px-4 py-4 text-xs font-black text-slate-600">
                                PIC
                            </th>

                            <th className="text-left px-4 py-4 text-xs font-black text-slate-600">
                                Tanggal
                            </th>

                            <th className="text-left px-4 py-4 text-xs font-black text-slate-600">
                                Status
                            </th>

                            <th className="text-left px-4 py-4 text-xs font-black text-slate-600">
                                Detail
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {items.length > 0 ? (
                            items.map((item) => (
                                <tr key={item.id} className="align-top hover:bg-slate-50/80 transition">
                                    <td className="px-4 py-4">
                                        <button
                                            type="button"
                                            onClick={() => onOpenRequest(item)}
                                            className="text-left group"
                                        >
                                            <p className="font-black text-sm text-slate-900 group-hover:text-red-700 transition">
                                                {item.judul_surat || '-'}
                                            </p>

                                            <p className="text-xs font-black text-red-700 mt-1 group-hover:underline">
                                                {item.nomor_surat || 'Nomor belum tersedia'}
                                            </p>

                                            <p className="text-xs text-slate-500 mt-1">
                                                {item.kode_perihal?.kode || '-'} / {item.kode_pemilik?.kode || '-'}
                                            </p>
                                        </button>
                                    </td>

                                    <td className="px-4 py-4">
                                        <p className="text-sm font-bold text-slate-700">
                                            {item.nama_pic_unit_pemohon || item.user?.name || '-'}
                                        </p>

                                        <p className="text-xs text-slate-400 mt-1">
                                            {item.user?.unit ? `Unit ${item.user.unit}` : 'PIC Unit'}
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
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                                        >
                                            <Eye size={14} />
                                            Buka
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-4 py-10 text-center text-slate-500 text-sm">
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
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center px-4 py-8">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto no-scrollbar">
                <div className="p-6 md:p-7 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-black text-red-700">
                                Detail Pengajuan Surat
                            </p>

                            <h3 className="text-2xl font-black text-slate-950 mt-1">
                                {item.judul_surat || '-'}
                            </h3>

                            <p className="text-sm text-slate-500 mt-2">
                                Preview dokumen terlebih dahulu. Tombol download tersedia di halaman preview.
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
                            Identitas Surat
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoBox label="Nomor Surat" value={item.nomor_surat || 'Nomor belum tersedia'} highlight />
                            <InfoBox label="Status Pengajuan" customValue={<BadgeStatus status={item.status} />} />
                            <InfoBox label="Tanggal Surat" value={formatDate(item.tanggal_surat)} />
                            <InfoBox label="Status Tanggal" value={formatStatusTanggal(item.status_tanggal)} />
                            <InfoBox label="Kode Perihal" value={`${item.kode_perihal?.kode || '-'} - ${item.kode_perihal?.nama_perihal || '-'}`} />
                            <InfoBox label="Kode Pemilik Proses" value={`${item.kode_pemilik?.kode || '-'} - ${item.kode_pemilik?.nama_pemilik || item.kode_pemilik?.unit || '-'}`} />
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-black text-slate-800 mb-3">
                            Pemohon dan Penanggung Jawab
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoBox label="Nama Akun Pemohon" value={item.user?.name || '-'} />
                            <InfoBox label="Unit Pemohon" value={item.user?.unit || '-'} />
                            <InfoBox label="Nama PIC Unit Pemohon" value={item.nama_pic_unit_pemohon || '-'} highlight />
                            <InfoBox label="Penandatangan Surat / TTD" value={item.penandatangan_surat || '-'} />
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

                    {!isOwnRequest && user?.unit !== 'sekpim' ? (
                        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-4">
                            <p className="text-sm text-blue-700 leading-relaxed">
                                Pengajuan ini bukan milik akun Anda. Anda hanya dapat melihat informasi detail, tidak dapat mengunggah dokumen final.
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
                                        previewUrl: awalPreviewUrl,
                                        downloadUrl: awalDownloadUrl,
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
                                        previewUrl: finalPreviewUrl,
                                        downloadUrl: finalDownloadUrl,
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

function EmptyState({ icon, title, description }) {
    return (
        <div className="bg-white/90 backdrop-blur-xl rounded-[28px] shadow-sm border border-white p-10 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto">
                {icon}
            </div>

            <h3 className="text-xl font-black text-slate-900 mt-5">
                {title}
            </h3>

            <p className="text-slate-500 mt-2 max-w-xl mx-auto leading-relaxed">
                {description}
            </p>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-64 bg-white rounded-[32px]"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="h-32 bg-white rounded-[28px]"></div>
                <div className="h-32 bg-white rounded-[28px]"></div>
                <div className="h-32 bg-white rounded-[28px]"></div>
                <div className="h-32 bg-white rounded-[28px]"></div>
            </div>

            <div className="h-40 bg-white rounded-[28px]"></div>
        </div>
    );
}

function DetailSkeleton() {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-pulse">
            <div className="h-80 bg-white rounded-[28px]"></div>
            <div className="h-80 bg-white rounded-[28px]"></div>
        </div>
    );
}

function calculateDetailProgress(detail) {
    if (!detail?.stats) return 0;

    const total = detail.stats.total_pengajuan || 0;
    const completed = detail.stats.total_completed || 0;

    if (total <= 0) return 0;

    return Math.round((completed / total) * 100);
}

export default DashboardPage;
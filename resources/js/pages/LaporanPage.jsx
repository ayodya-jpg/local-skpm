import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import {
    BarChart3,
    CalendarDays,
    CheckCircle,
    Download,
    Eye,
    FileSpreadsheet,
    FileText,
    Filter,
    RefreshCcw,
    Search,
    Sparkles,
} from 'lucide-react';

import BadgeStatus from '../components/BadgeStatus';
import { apiGet, getErrorMessage } from '../services/api';

function LaporanPage() {
    const currentDate = new Date();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [filter, setFilter] = useState({
        search: '',
        status: 'all',
        bulan: 'all',
        tahun: String(currentDate.getFullYear()),
        unit: 'all',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const getQueryParams = () => {
        const params = new URLSearchParams();

        if (filter.status !== 'all') params.append('status', filter.status);
        if (filter.bulan !== 'all') params.append('bulan', filter.bulan);
        if (filter.tahun !== 'all') params.append('tahun', filter.tahun);
        if (filter.unit !== 'all') params.append('unit', filter.unit);
        if (filter.search) params.append('search', filter.search);

        return params.toString();
    };

    const fetchData = async (silent = false) => {
        try {
            if (silent) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await apiGet(
                `/laporan/surat-keluar/data?${getQueryParams()}`
            );

            const rows =
                response.data ||
                response.laporan ||
                response.items ||
                response.nomor_surat_requests ||
                [];

            setItems(Array.isArray(rows) ? rows : []);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal Memuat Laporan',
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
            tahun: String(currentDate.getFullYear()),
            unit: 'all',
        });

        setTimeout(() => {
            fetchData(false);
        }, 100);
    };

    const handleExportExcel = () => {
        window.open(
            `/laporan/surat-keluar/export-excel?${getQueryParams()}`,
            '_blank'
        );
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

    const getBulanName = (bulan) => {
        const months = {
            1: 'Januari',
            2: 'Februari',
            3: 'Maret',
            4: 'April',
            5: 'Mei',
            6: 'Juni',
            7: 'Juli',
            8: 'Agustus',
            9: 'September',
            10: 'Oktober',
            11: 'November',
            12: 'Desember',
        };

        return months[bulan] || bulan || '-';
    };

    const years = [
        currentDate.getFullYear() - 1,
        currentDate.getFullYear(),
        currentDate.getFullYear() + 1,
    ];

    const units = useMemo(() => {
        const uniqueUnits = new Set();

        items.forEach((item) => {
            if (item.unit) uniqueUnits.add(item.unit);
            if (item.user?.unit) uniqueUnits.add(item.user.unit);
        });

        return Array.from(uniqueUnits).sort();
    }, [items]);

    const filteredItems = useMemo(() => {
        const keyword = filter.search.toLowerCase();

        return items.filter((item) => {
            const searchableText = [
                item.nomor_surat,
                item.perihal,
                item.judul_surat,
                item.tujuan_surat,
                item.nama_pic_unit_pemohon,
                item.penandatangan_surat,
                item.unit,
                item.user?.unit,
                item.kode_perihal,
                item.kode_perihal?.kode,
                item.kode_pemilik_proses,
                item.kode_pemilik?.kode,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            const matchSearch = !keyword || searchableText.includes(keyword);

            const itemStatus = item.status || '-';
            const matchStatus =
                filter.status === 'all' || itemStatus === filter.status;

            const itemUnit = item.unit || item.user?.unit || '-';
            const matchUnit =
                filter.unit === 'all' ||
                String(itemUnit).toLowerCase() ===
                    String(filter.unit).toLowerCase();

            let matchBulan = true;

            if (filter.bulan !== 'all') {
                const itemBulan =
                    item.bulan ||
                    new Date(
                        item.tanggal_surat || item.tanggal_pengajuan
                    ).getMonth() + 1;

                matchBulan = String(itemBulan) === String(filter.bulan);
            }

            let matchTahun = true;

            if (filter.tahun !== 'all') {
                const itemTahun =
                    item.tahun ||
                    new Date(
                        item.tanggal_surat || item.tanggal_pengajuan
                    ).getFullYear();

                matchTahun = String(itemTahun) === String(filter.tahun);
            }

            return matchSearch && matchStatus && matchUnit && matchBulan && matchTahun;
        });
    }, [items, filter]);

    const stats = useMemo(() => {
        const total = filteredItems.length;
        const completed = filteredItems.filter(
            (item) => item.status === 'completed'
        ).length;
        const finalSubmitted = filteredItems.filter(
            (item) => item.status === 'final_submitted'
        ).length;
        const approved = filteredItems.filter(
            (item) => item.status === 'approved'
        ).length;
        const revision = filteredItems.filter(
            (item) => item.status === 'revision'
        ).length;
        const pending = filteredItems.filter(
            (item) => item.status === 'pending'
        ).length;

        const uniqueUnits = new Set();

        filteredItems.forEach((item) => {
            const unit = item.unit || item.user?.unit;

            if (unit) uniqueUnits.add(unit);
        });

        return {
            total,
            completed,
            finalSubmitted,
            approved,
            revision,
            pending,
            units: uniqueUnits.size,
        };
    }, [filteredItems]);

    if (loading) {
        return <LaporanSkeleton />;
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
                                Laporan Surat Keluar
                            </div>

                            <h2 className="text-2xl md:text-4xl font-black tracking-tight mt-5">
                                Rekap Surat Keluar Siap Export
                            </h2>

                            <p className="text-white/75 mt-3 max-w-2xl leading-relaxed">
                                Preview data surat keluar berdasarkan periode,
                                status, unit, dan kata kunci tertentu. Data dapat
                                diexport ke Excel untuk kebutuhan arsip dan
                                pelaporan SEKPiM.
                            </p>
                        </div>

                        <div className="bg-white/10 border border-white/15 rounded-[28px] p-5 min-w-[260px] backdrop-blur-xl">
                            <p className="text-sm text-white/70 font-semibold">
                                Data Siap Export
                            </p>

                            <div className="flex items-end gap-2 mt-2">
                                <h3 className="text-5xl font-black">
                                    {stats.total}
                                </h3>

                                <p className="text-sm text-white/60 mb-2">
                                    baris
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleExportExcel}
                                className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white text-[#c4121a] hover:bg-red-50 text-sm font-black transition"
                            >
                                <Download size={17} />
                                Export Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-5">
                <StatCard
                    title="Total Data"
                    value={stats.total}
                    icon={<FileSpreadsheet size={23} />}
                    tone="blue"
                />

                <StatCard
                    title="Completed"
                    value={stats.completed}
                    icon={<CheckCircle size={23} />}
                    tone="green"
                />

                <StatCard
                    title="Final"
                    value={stats.finalSubmitted}
                    icon={<FileText size={23} />}
                    tone="purple"
                />

                <StatCard
                    title="Approved"
                    value={stats.approved}
                    icon={<Eye size={23} />}
                    tone="yellow"
                />

                <StatCard
                    title="Pending"
                    value={stats.pending}
                    icon={<CalendarDays size={23} />}
                    tone="orange"
                />

                <StatCard
                    title="Unit"
                    value={stats.units}
                    icon={<BarChart3 size={23} />}
                    tone="red"
                />
            </div>

            <div className="bg-white/90 backdrop-blur-xl border border-white shadow-sm rounded-[28px] p-5 md:p-6">
                <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <Filter size={19} className="text-red-700" />

                            <h3 className="text-lg font-black text-slate-950">
                                Filter Laporan
                            </h3>
                        </div>

                        <p className="text-sm text-slate-500 mt-1">
                            Gunakan filter untuk menentukan data yang akan
                            ditampilkan dan diexport.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 w-full xl:w-auto">
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
                                    placeholder="Cari nomor/perihal/PIC/unit..."
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
                                <option value="final_submitted">
                                    Final Submitted
                                </option>
                                <option value="revision">Revision</option>
                                <option value="completed">Completed</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 mb-2">
                                Unit
                            </label>

                            <select
                                name="unit"
                                value={filter.unit}
                                onChange={handleFilterChange}
                                className="form-control"
                            >
                                <option value="all">Semua</option>

                                {units.map((unit) => (
                                    <option key={unit} value={unit}>
                                        {String(unit).toUpperCase()}
                                    </option>
                                ))}
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

                    <button
                        type="button"
                        onClick={handleExportExcel}
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white text-sm font-black transition"
                    >
                        <Download size={16} />
                        Export Excel
                    </button>
                </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl border border-white shadow-sm rounded-[28px] p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                    <div>
                        <h3 className="text-lg font-black text-slate-950">
                            Preview Laporan Surat Keluar
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                            Menampilkan {filteredItems.length} data dari total{' '}
                            {items.length} baris laporan.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-green-50 text-green-700 text-sm font-black">
                        <FileSpreadsheet size={16} />
                        Excel Ready
                    </div>
                </div>

                {filteredItems.length > 0 ? (
                    <>
                        <div className="hidden xl:block overflow-x-auto border border-slate-200 rounded-3xl no-scrollbar">
                            <table className="w-full min-w-[1400px]">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="text-left px-4 py-4 text-xs font-black text-slate-600">
                                            No.
                                        </th>

                                        <th className="text-left px-4 py-4 text-xs font-black text-slate-600">
                                            Bulan / Tahun
                                        </th>

                                        <th className="text-left px-4 py-4 text-xs font-black text-slate-600">
                                            Nomor Urut
                                        </th>

                                        <th className="text-left px-4 py-4 text-xs font-black text-slate-600">
                                            Kode
                                        </th>

                                        <th className="text-left px-4 py-4 text-xs font-black text-slate-600">
                                            Nomor Surat
                                        </th>

                                        <th className="text-left px-4 py-4 text-xs font-black text-slate-600">
                                            Perihal
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
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filteredItems.map((item, index) => (
                                        <tr
                                            key={item.id || index}
                                            className="hover:bg-slate-50/80 transition align-top"
                                        >
                                            <td className="px-4 py-4 text-sm font-black text-slate-500">
                                                {index + 1}
                                            </td>

                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <p className="text-sm font-black text-slate-900">
                                                    {getBulanName(item.bulan)}
                                                </p>

                                                <p className="text-xs text-slate-500 mt-1">
                                                    {item.tahun || '-'}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="text-sm font-black text-red-700">
                                                    {item.nomor_urut || '-'}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="text-sm font-black text-slate-800">
                                                    {item.kode_perihal?.kode ||
                                                        item.kode_perihal ||
                                                        '-'}
                                                </p>

                                                <p className="text-xs text-slate-500 mt-1">
                                                    {item.kode_pemilik?.kode ||
                                                        item.kode_pemilik_proses ||
                                                        '-'}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="text-sm font-black text-slate-950 max-w-[240px]">
                                                    {item.nomor_surat || '-'}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="text-sm text-slate-700 max-w-[320px] line-clamp-2">
                                                    {item.perihal ||
                                                        item.judul_surat ||
                                                        '-'}
                                                </p>

                                                <p className="text-xs text-slate-400 mt-1">
                                                    Tujuan:{' '}
                                                    {item.tujuan_surat || '-'}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="text-sm font-bold text-slate-700">
                                                    {item.nama_pic_unit_pemohon ||
                                                        '-'}
                                                </p>

                                                <p className="text-xs text-slate-500 mt-1">
                                                    TTD:{' '}
                                                    {item.penandatangan_surat ||
                                                        '-'}
                                                </p>

                                                <p className="text-xs font-black text-red-700 mt-1 uppercase">
                                                    Unit{' '}
                                                    {item.unit ||
                                                        item.user?.unit ||
                                                        '-'}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <p className="text-sm font-bold text-slate-700">
                                                    {formatDate(
                                                        item.tanggal_pengajuan ||
                                                            item.tanggal_surat
                                                    )}
                                                </p>

                                                <p className="text-xs text-slate-400 mt-1">
                                                    {formatStatusTanggal(
                                                        item.status_tanggal
                                                    )}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4">
                                                <BadgeStatus
                                                    status={item.status}
                                                />
                                            </td>

                                            <td className="px-4 py-4">
                                                {item.link_dokumen ? (
                                                    <a
                                                        href={
                                                            item.link_dokumen
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-black transition"
                                                    >
                                                        <Eye size={14} />
                                                        Lihat
                                                    </a>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-black">
                                                        Belum Ada
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="xl:hidden space-y-4">
                            {filteredItems.map((item, index) => (
                                <MobileLaporanCard
                                    key={item.id || index}
                                    item={item}
                                    index={index}
                                    formatDate={formatDate}
                                    formatStatusTanggal={formatStatusTanggal}
                                    getBulanName={getBulanName}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <EmptyState />
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, tone }) {
    const tones = {
        blue: 'bg-blue-50 text-blue-700',
        green: 'bg-green-50 text-green-700',
        purple: 'bg-purple-50 text-purple-700',
        yellow: 'bg-yellow-50 text-yellow-700',
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

                <div
                    className={`w-13 h-13 rounded-2xl flex items-center justify-center ${
                        tones[tone] || tones.red
                    }`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

function MobileLaporanCard({
    item,
    index,
    formatDate,
    formatStatusTanggal,
    getBulanName,
}) {
    return (
        <div className="bg-white border border-slate-200 rounded-[28px] p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-black text-red-700">
                        Baris #{index + 1}
                    </p>

                    <p className="text-sm font-black text-slate-950 mt-1">
                        {item.nomor_surat || '-'}
                    </p>

                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                        {item.perihal || item.judul_surat || '-'}
                    </p>
                </div>

                <BadgeStatus status={item.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
                <SmallInfo label="Bulan" value={getBulanName(item.bulan)} />
                <SmallInfo label="Tahun" value={item.tahun || '-'} />
                <SmallInfo label="Nomor Urut" value={item.nomor_urut || '-'} />
                <SmallInfo
                    label="Tanggal"
                    value={formatDate(
                        item.tanggal_pengajuan || item.tanggal_surat
                    )}
                />
                <SmallInfo
                    label="PIC"
                    value={item.nama_pic_unit_pemohon || '-'}
                />
                <SmallInfo
                    label="Status Tanggal"
                    value={formatStatusTanggal(item.status_tanggal)}
                />
            </div>

            <div className="mt-4">
                {item.link_dokumen ? (
                    <a
                        href={item.link_dokumen}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-black transition"
                    >
                        <Eye size={14} />
                        Lihat Dokumen
                    </a>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-black">
                        Dokumen Belum Ada
                    </span>
                )}
            </div>
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
                <FileSpreadsheet size={42} />
            </div>

            <h3 className="text-xl font-black text-slate-900 mt-5">
                Tidak ada data laporan
            </h3>

            <p className="text-slate-500 mt-2 max-w-xl mx-auto leading-relaxed">
                Coba ubah filter status, unit, bulan, tahun, atau kata kunci
                pencarian untuk menampilkan data laporan surat keluar.
            </p>
        </div>
    );
}

function LaporanSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-64 bg-white rounded-[32px]"></div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
                <div className="h-32 bg-white rounded-[28px]"></div>
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

export default LaporanPage;
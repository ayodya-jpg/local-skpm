import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
    Download,
    FileSpreadsheet,
    RefreshCcw,
    Search,
} from 'lucide-react';

import { apiGet, getErrorMessage } from '../services/api';

function LaporanPage() {
    const currentDate = new Date();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [filter, setFilter] = useState({
        bulan: String(currentDate.getMonth() + 1),
        tahun: String(currentDate.getFullYear()),
        unit: 'all',
        status: 'all',
        search: '',
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

            const data = await apiGet(getDataUrl());

            setItems(data.data || []);
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

    const getQueryParams = () => {
        const params = new URLSearchParams();

        params.append('bulan', filter.bulan);
        params.append('tahun', filter.tahun);
        params.append('unit', filter.unit);
        params.append('status', filter.status);

        if (filter.search) {
            params.append('search', filter.search);
        }

        return params.toString();
    };

    const getDataUrl = () => {
        return `/laporan/surat-keluar/data?${getQueryParams()}`;
    };

    const handleApplyFilter = () => {
        fetchData(true);
    };

    const handleExportExcel = () => {
        window.open(
            `/laporan/surat-keluar/export-excel?${getQueryParams()}`,
            '_blank'
        );
    };

    const resetFilter = () => {
        setFilter({
            bulan: String(currentDate.getMonth() + 1),
            tahun: String(currentDate.getFullYear()),
            unit: 'all',
            status: 'all',
            search: '',
        });

        setTimeout(() => {
            fetchData(true);
        }, 150);
    };

    const years = [
        currentDate.getFullYear() - 1,
        currentDate.getFullYear(),
        currentDate.getFullYear() + 1,
    ];

    const totalOpen = items.length;

    const totalReview = items.filter((item) => [
        'Diajukan',
        'Menunggu Verifikasi Final',
        'Perlu Revisi Final',
    ].includes(item.status)).length;

    const totalClose = items.filter((item) => (
        item.status === 'Selesai / Closed'
    )).length;

    if (loading) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <p className="text-slate-500">Memuat laporan surat keluar...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center">
                            <FileSpreadsheet size={30} />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-slate-950">
                                Laporan Surat Keluar
                            </h2>

                            <p className="text-slate-500 mt-1">
                                Preview dan export data surat keluar sesuai format template Excel.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
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

                        <button
                            type="button"
                            onClick={handleExportExcel}
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition"
                        >
                            <Download size={16} />
                            Export Excel
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <SummaryCard
                    title="Open / Total"
                    value={totalOpen}
                    color="bg-blue-50 text-blue-700"
                />

                <SummaryCard
                    title="Review / Tindak Lanjut"
                    value={totalReview}
                    color="bg-yellow-50 text-yellow-700"
                />

                <SummaryCard
                    title="Close / Selesai"
                    value={totalClose}
                    color="bg-green-50 text-green-700"
                />
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-2 mb-5">
                    <Search size={18} className="text-slate-400" />

                    <h3 className="text-lg font-bold text-slate-950">
                        Filter Laporan
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">
                            Bulan
                        </label>

                        <select
                            name="bulan"
                            value={filter.bulan}
                            onChange={handleFilterChange}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
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
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="all">Semua Tahun</option>

                            {years.map((year) => (
                                <option key={year} value={String(year)}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">
                            Unit
                        </label>

                        <input
                            type="text"
                            name="unit"
                            value={filter.unit === 'all' ? '' : filter.unit}
                            onChange={(event) => {
                                setFilter((previous) => ({
                                    ...previous,
                                    unit: event.target.value || 'all',
                                }));
                            }}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Semua unit"
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

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">
                            Search
                        </label>

                        <input
                            type="text"
                            name="search"
                            value={filter.search}
                            onChange={handleFilterChange}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Judul, nomor, PIC..."
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-5">
                    <button
                        type="button"
                        onClick={handleApplyFilter}
                        className="px-5 py-3 rounded-xl bg-[#d71920] hover:bg-[#bd1118] text-white text-sm font-bold transition"
                    >
                        Terapkan Filter
                    </button>

                    <button
                        type="button"
                        onClick={resetFilter}
                        className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition"
                    >
                        Reset Filter
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <div className="mb-5">
                    <h3 className="text-lg font-bold text-slate-950">
                        Preview Data Export
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                        Data di bawah ini adalah data yang akan masuk ke file Excel.
                    </p>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full min-w-[1600px]">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">No</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">Bulan</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">Tahun</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">Nomor Urut</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">Kode Perihal</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">Kode Pemilik</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">Nama PIC</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">No. Surat</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">Perihal</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">Tanggal Pengajuan</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">Penandatangan</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">Status Tanggal</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">Keterangan</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">Link Dokumen</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {items.length > 0 ? (
                                items.map((item, index) => (
                                    <tr
                                        key={`${item.nomor_surat}-${index}`}
                                        className="align-top hover:bg-slate-50/70"
                                    >
                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {index + 1}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {item.bulan}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {item.tahun}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {item.nomor_urut}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {item.kode_perihal}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {item.kode_pemilik_proses}
                                        </td>

                                        <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                                            {item.nama_pic_unit_pemohon}
                                        </td>

                                        <td className="px-4 py-4 text-sm font-bold text-red-700">
                                            {item.nomor_surat}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-700">
                                            {item.perihal}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {item.tanggal_pengajuan}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {item.penandatangan_surat}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {item.status}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {item.status_tanggal}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-slate-600">
                                            {item.keterangan}
                                        </td>

                                        <td className="px-4 py-4 text-sm text-blue-700 max-w-[320px] truncate">
                                            {item.link_dokumen !== '-' ? (
                                                <a
                                                    href={item.link_dokumen}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="hover:underline"
                                                >
                                                    {item.link_dokumen}
                                                </a>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="15"
                                        className="px-4 py-10 text-center text-slate-500 text-sm"
                                    >
                                        Tidak ada data laporan.
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

function SummaryCard({ title, value, color }) {
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
                    <FileSpreadsheet size={25} />
                </div>
            </div>
        </div>
    );
}

export default LaporanPage;
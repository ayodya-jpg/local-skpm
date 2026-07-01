import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
    CheckCircle,
    Clock,
    FileCheck,
    FileText,
    RefreshCcw,
    XCircle,
} from 'lucide-react';

import { apiGet, getErrorMessage } from '../services/api';

function DashboardPage() {
    const currentDate = new Date();

    const [user, setUser] = useState(null);

    const [filter, setFilter] = useState({
        bulan: String(currentDate.getMonth() + 1),
        tahun: String(currentDate.getFullYear()),
    });

    const [stats, setStats] = useState({
        total_pengajuan: 0,
        total_pending: 0,
        total_approved: 0,
        total_final_submitted: 0,
        total_completed: 0,
        total_rejected: 0,
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        fetchInitialData();

        const interval = setInterval(() => {
            fetchDashboardData(true);
        }, 5000);

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchDashboardData(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [filter]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);

            const userData = await apiGet('/me');
            const dashboardData = await apiGet(getDashboardUrl());

            setUser(userData.user);
            setDashboardStats(dashboardData);
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

    const fetchDashboardData = async (silent = false) => {
        try {
            if (!silent) {
                setRefreshing(true);
            }

            const dashboardData = await apiGet(getDashboardUrl());

            setDashboardStats(dashboardData);
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

    const getDashboardUrl = () => {
        const params = new URLSearchParams();

        params.append('bulan', filter.bulan);
        params.append('tahun', filter.tahun);

        return `/dashboard-data?${params.toString()}`;
    };

    const setDashboardStats = (dashboardData) => {
        setStats({
            total_pengajuan: dashboardData.total_pengajuan || 0,
            total_pending: dashboardData.total_pending || 0,
            total_approved: dashboardData.total_approved || 0,
            total_final_submitted: dashboardData.total_final_submitted || 0,
            total_completed: dashboardData.total_completed || 0,
            total_rejected: dashboardData.total_rejected || 0,
        });
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;

        setFilter((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const formatTime = (date) => {
        if (!date) return '-';

        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const isSekpim = user?.unit === 'sekpim';

    const years = [
        currentDate.getFullYear() - 1,
        currentDate.getFullYear(),
        currentDate.getFullYear() + 1,
    ];

    if (loading) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <p className="text-slate-500">Memuat data dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-950">
                            Dashboard SEKPiM
                        </h2>

                        <p className="text-slate-500 mt-2">
                            {isSekpim
                                ? 'Ringkasan seluruh pengajuan nomor surat dari semua unit.'
                                : 'Ringkasan pengajuan nomor surat unit Anda.'}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                                    isSekpim
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-blue-100 text-blue-700'
                                }`}
                            >
                                {isSekpim
                                    ? 'Mode Admin SEKPiM'
                                    : `Mode Unit ${user?.unit || '-'}`}
                            </span>

                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                                Realtime aktif
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
                            onClick={() => fetchDashboardData(false)}
                            disabled={refreshing}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition disabled:opacity-60"
                        >
                            <RefreshCcw
                                size={16}
                                className={refreshing ? 'animate-spin' : ''}
                            />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
                <StatCard
                    title="Total Pengajuan"
                    value={stats.total_pengajuan}
                    icon={<FileText size={26} />}
                    color="bg-blue-50 text-blue-700"
                />

                <StatCard
                    title="Menunggu"
                    value={stats.total_pending}
                    icon={<Clock size={26} />}
                    color="bg-yellow-50 text-yellow-700"
                />

                <StatCard
                    title="Disetujui"
                    value={stats.total_approved}
                    icon={<CheckCircle size={26} />}
                    color="bg-green-50 text-green-700"
                />

                <StatCard
                    title="Selesai"
                    value={stats.total_completed}
                    icon={<FileCheck size={26} />}
                    color="bg-slate-100 text-slate-700"
                />

                <StatCard
                    title="Ditolak"
                    value={stats.total_rejected}
                    icon={<XCircle size={26} />}
                    color="bg-red-50 text-red-700"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-lg font-bold text-slate-950">
                        Informasi Sistem
                    </h3>

                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                        <InfoRow
                            label="Format Nomor Surat"
                            value="001/KU/SEKPIM/2026"
                        />

                        <InfoRow
                            label="Alur Pengajuan"
                            value="User mengajukan nomor surat, admin SEKPiM melakukan approval, user upload dokumen final, lalu admin menyelesaikan pengajuan."
                        />

                        <InfoRow
                            label="Reset Nomor"
                            value="Nomor urut otomatis kembali dari 001 setiap tahun baru."
                        />

                        <InfoRow
                            label="Filter Bulan"
                            value="Data dashboard dapat difilter berdasarkan bulan dan tahun surat."
                        />

                        <InfoRow
                            label="Realtime Dashboard"
                            value="Data dashboard otomatis diperbarui setiap 5 detik tanpa refresh halaman."
                        />
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-lg font-bold text-slate-950">
                        Status Pengajuan
                    </h3>

                    <div className="mt-4 space-y-4">
                        <ProgressItem
                            label="Menunggu Approval"
                            value={stats.total_pending}
                            total={stats.total_pengajuan}
                            color="bg-yellow-500"
                        />

                        <ProgressItem
                            label="Disetujui"
                            value={stats.total_approved}
                            total={stats.total_pengajuan}
                            color="bg-green-500"
                        />

                        <ProgressItem
                            label="Dokumen Final Dikirim"
                            value={stats.total_final_submitted}
                            total={stats.total_pengajuan}
                            color="bg-blue-500"
                        />

                        <ProgressItem
                            label="Selesai"
                            value={stats.total_completed}
                            total={stats.total_pengajuan}
                            color="bg-slate-500"
                        />

                        <ProgressItem
                            label="Ditolak"
                            value={stats.total_rejected}
                            total={stats.total_pengajuan}
                            color="bg-red-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }) {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-500">
                        {title}
                    </p>

                    <h3 className="text-3xl font-bold text-slate-950 mt-2">
                        {value}
                    </h3>
                </div>

                <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 last:border-b-0">
            <p className="font-semibold text-slate-800">
                {label}
            </p>

            <p className="text-slate-500 leading-relaxed">
                {value}
            </p>
        </div>
    );
}

function ProgressItem({ label, value, total, color }) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

    return (
        <div>
            <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-semibold text-slate-700">
                    {label}
                </span>

                <span className="text-slate-500">
                    {value} data
                </span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <p className="text-xs text-slate-400 mt-1">
                {percentage}% dari total pengajuan
            </p>
        </div>
    );
}

export default DashboardPage;

import React, { useMemo, useState } from 'react';
import {
    Bell,
    Building2,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    FilePlus,
    FileSpreadsheet,
    History,
    Home,
    KeyRound,
    LayoutDashboard,
    LogOut,
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
    Sparkles,
    Users,
    X,
} from 'lucide-react';

import csrfToken from '../services/csrf';

import DashboardPage from '../pages/DashboardPage';
import UserManagementPage from '../pages/UserManagementPage';
import AjukanNomorSuratPage from '../pages/AjukanNomorSuratPage';
import RiwayatNomorSuratPage from '../pages/RiwayatNomorSuratPage';
import ApprovalNomorSuratPage from '../pages/ApprovalNomorSuratPage';
import KodePerihalPage from '../pages/KodePerihalPage';
import KodePemilikPage from '../pages/KodePemilikPage';
import LaporanPage from '../pages/LaporanPage';

function DashboardLayout({ user, setUser, page, setPage }) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [desktopCollapsed, setDesktopCollapsed] = useState(false);

    const isSekpim = user?.unit === 'sekpim';

    const pageTitleMap = {
        dashboard: 'Dashboard',
        'ajukan-nomor': 'Ajukan Nomor Surat',
        'riwayat-nomor': 'Riwayat Pengajuan',
        'approval-nomor': 'Approval Pengajuan',
        'laporan-surat-keluar': 'Laporan Surat Keluar',
        'kode-perihal': 'Kode Perihal',
        'kode-pemilik': 'Kode Pemilik',
        'user-management': 'User Management',
    };

    const pageDescriptionMap = {
        dashboard: 'Pantau ringkasan pengajuan, status surat, dan tindak lanjut terbaru.',
        'ajukan-nomor': 'Buat pengajuan nomor surat baru dengan data yang lengkap dan terstruktur.',
        'riwayat-nomor': 'Lihat perkembangan pengajuan nomor surat dan dokumen final Anda.',
        'approval-nomor': 'Kelola approval, revisi, dan penyelesaian pengajuan nomor surat.',
        'laporan-surat-keluar': 'Preview dan export laporan surat keluar ke format Excel.',
        'kode-perihal': 'Kelola master data kode perihal surat.',
        'kode-pemilik': 'Kelola master data kode pemilik proses.',
        'user-management': 'Kelola akun, status, dan akses pengguna sistem.',
    };

    const pageTitle = pageTitleMap[page] || 'Dashboard';
    const pageDescription = pageDescriptionMap[page] || pageDescriptionMap.dashboard;

    const menuGroups = useMemo(() => {
        return [
            {
                title: 'Utama',
                items: [
                    {
                        id: 'dashboard',
                        label: 'Dashboard',
                        icon: LayoutDashboard,
                        show: true,
                    },
                ],
            },
            {
                title: 'Penomoran',
                items: [
                    {
                        id: 'ajukan-nomor',
                        label: 'Ajukan Nomor',
                        icon: FilePlus,
                        show: true,
                    },
                    {
                        id: 'riwayat-nomor',
                        label: 'Riwayat Pengajuan',
                        icon: History,
                        show: true,
                    },
                    {
                        id: 'approval-nomor',
                        label: 'Approval',
                        icon: CheckCircle,
                        show: isSekpim,
                    },
                ],
            },
            {
                title: 'Laporan',
                items: [
                    {
                        id: 'laporan-surat-keluar',
                        label: 'Laporan Surat Keluar',
                        icon: FileSpreadsheet,
                        show: true,
                    },
                ],
            },
            {
                title: 'Master Data',
                items: [
                    {
                        id: 'kode-perihal',
                        label: 'Kode Perihal',
                        icon: KeyRound,
                        show: isSekpim,
                    },
                    {
                        id: 'kode-pemilik',
                        label: 'Kode Pemilik',
                        icon: Building2,
                        show: isSekpim,
                    },
                    {
                        id: 'user-management',
                        label: 'User Management',
                        icon: Users,
                        show: isSekpim,
                    },
                ],
            },
        ]
            .map((group) => ({
                ...group,
                items: group.items.filter((item) => item.show),
            }))
            .filter((group) => group.items.length > 0);
    }, [isSekpim]);

    const handleLogout = async () => {
        await fetch('/logout', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
        });

        localStorage.removeItem('sekpim_active_page');
        setPage('dashboard');
        setUser(null);
    };

    const handleChangePage = (pageId) => {
        setPage(pageId);
        setMobileSidebarOpen(false);
    };

    const getInitials = (name) => {
        if (!name) return 'U';

        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
    };

    const renderPage = () => {
        if (page === 'dashboard') return <DashboardPage />;

        if (page === 'ajukan-nomor') return <AjukanNomorSuratPage />;

        if (page === 'riwayat-nomor') return <RiwayatNomorSuratPage />;

        if (page === 'approval-nomor' && isSekpim) {
            return <ApprovalNomorSuratPage />;
        }

        if (page === 'laporan-surat-keluar') return <LaporanPage />;

        if (page === 'kode-perihal' && isSekpim) return <KodePerihalPage />;

        if (page === 'kode-pemilik' && isSekpim) return <KodePemilikPage />;

        if (page === 'user-management' && isSekpim) return <UserManagementPage />;

        return <DashboardPage />;
    };

    return (
        <div className="min-h-screen bg-[#f4f6fa] text-slate-800">
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => setMobileSidebarOpen(true)}
                        className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                    >
                        <Menu size={22} />
                    </button>

                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#d71920] to-[#8f0b15] text-white flex items-center justify-center shadow-sm">
                            <Sparkles size={20} />
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-black text-slate-950 leading-tight truncate">
                                SEKPiM
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                                Surat & Arsip
                            </p>
                        </div>
                    </div>

                    <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center font-black text-sm">
                        {getInitials(user?.name)}
                    </div>
                </div>
            </div>

            {mobileSidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        aria-label="Close sidebar"
                        onClick={() => setMobileSidebarOpen(false)}
                        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
                    />

                    <div className="relative w-[310px] max-w-[88vw] h-full bg-white shadow-2xl">
                        <SidebarContent
                            user={user}
                            page={page}
                            menuGroups={menuGroups}
                            collapsed={false}
                            mobile
                            onClose={() => setMobileSidebarOpen(false)}
                            onChangePage={handleChangePage}
                            onLogout={handleLogout}
                            getInitials={getInitials}
                        />
                    </div>
                </div>
            )}

            <div className="hidden lg:block fixed top-0 left-0 h-screen z-30">
                <SidebarContent
                    user={user}
                    page={page}
                    menuGroups={menuGroups}
                    collapsed={desktopCollapsed}
                    onChangePage={handleChangePage}
                    onLogout={handleLogout}
                    getInitials={getInitials}
                    onToggleCollapse={() => setDesktopCollapsed((value) => !value)}
                />
            </div>

            <main
                className={`min-h-screen transition-all duration-300 ${
                    desktopCollapsed ? 'lg:ml-[92px]' : 'lg:ml-[280px]'
                }`}
            >
                <section className="pt-[82px] lg:pt-0 px-4 md:px-6 lg:px-8 py-6 lg:py-8">
                    <div className="mb-7">
                        <div className="bg-white/85 backdrop-blur-xl border border-white shadow-sm rounded-[28px] p-5 md:p-6">
                            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                                <div>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                                        <Home size={15} />
                                        <span>/</span>
                                        <span>Sistem SEKPiM</span>
                                        <ChevronRight size={14} />
                                        <span className="font-semibold text-red-700">
                                            {pageTitle}
                                        </span>
                                    </div>

                                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 mt-3">
                                        {pageTitle}
                                    </h1>

                                    <p className="text-sm md:text-base text-slate-500 mt-2 max-w-3xl leading-relaxed">
                                        {pageDescription}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-red-700 font-black">
                                            {getInitials(user?.name)}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-xs text-slate-500">
                                                Login sebagai
                                            </p>

                                            <p className="text-sm font-black text-slate-900 truncate max-w-[180px]">
                                                {user?.name || '-'}
                                            </p>

                                            <p className="text-xs text-red-700 font-bold uppercase">
                                                Unit {user?.unit || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="w-12 h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-600 flex items-center justify-center transition relative"
                                    >
                                        <Bell size={19} />
                                        <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="animate-[fadeIn_0.25s_ease-in-out]">
                        {renderPage()}
                    </div>
                </section>
            </main>
        </div>
    );
}

function SidebarContent({
    user,
    page,
    menuGroups,
    collapsed,
    mobile = false,
    onClose,
    onChangePage,
    onLogout,
    getInitials,
    onToggleCollapse,
}) {
    return (
        <aside
            className={`h-full bg-gradient-to-b from-[#d71920] via-[#a90f1b] to-[#210711] text-white flex flex-col relative overflow-hidden shadow-2xl transition-all duration-300 ${
                collapsed ? 'w-[92px]' : 'w-[280px]'
            } ${mobile ? 'w-full' : ''}`}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),_transparent_34%)]"></div>
            <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 px-5 pt-6 pb-5">
                <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-3`}>
                    <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} min-w-0`}>
                        <div className="w-12 h-12 rounded-2xl bg-white text-[#d71920] flex items-center justify-center shadow-lg shrink-0">
                            <Sparkles size={24} />
                        </div>

                        {!collapsed && (
                            <div className="min-w-0">
                                <h2 className="text-lg font-black leading-tight truncate">
                                    SEKPiM
                                </h2>

                                <p className="text-xs text-white/70 truncate">
                                    Surat & Arsip
                                </p>
                            </div>
                        )}
                    </div>

                    {mobile ? (
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                        >
                            <X size={20} />
                        </button>
                    ) : null}
                </div>

                {!collapsed && (
                    <div className="mt-5">
                        <img
                            src="/images/logo-telkom.png"
                            alt="Logo Telkom University"
                            className="w-36 h-auto object-contain mx-auto drop-shadow-sm"
                        />
                    </div>
                )}
            </div>

            <div className="relative z-10 px-4 pb-4">
                <div
                    className={`rounded-3xl bg-white/10 border border-white/15 backdrop-blur-xl ${
                        collapsed ? 'p-3' : 'p-4'
                    }`}
                >
                    <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                        <div className="w-11 h-11 rounded-2xl bg-white text-[#d71920] flex items-center justify-center text-sm font-black shadow shrink-0">
                            {getInitials(user?.name)}
                        </div>

                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold leading-tight truncate">
                                    {user?.name || '-'}
                                </p>

                                <p className="text-xs text-white/70 truncate mt-0.5">
                                    {user?.username || 'user'}
                                </p>
                            </div>
                        )}
                    </div>

                    {!collapsed && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black bg-white text-[#c4121a] uppercase">
                                {user?.unit || '-'}
                            </span>

                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black bg-green-400/20 text-green-100 border border-green-300/20">
                                {user?.status || 'active'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <nav className="relative z-10 flex-1 px-4 space-y-5 overflow-y-auto pb-5 custom-scrollbar">
                {menuGroups.map((group) => (
                    <div key={group.title}>
                        {!collapsed && (
                            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45 font-black px-4 mb-2">
                                {group.title}
                            </p>
                        )}

                        <div className="space-y-1.5">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const active = page === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        title={collapsed ? item.label : undefined}
                                        onClick={() => onChangePage(item.id)}
                                        className={`w-full flex items-center ${
                                            collapsed ? 'justify-center px-0' : 'gap-3 px-4'
                                        } py-3 rounded-2xl text-sm font-bold transition-all duration-200 group ${
                                            active
                                                ? 'bg-white text-[#c4121a] shadow-lg shadow-black/10'
                                                : 'text-white/85 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <Icon
                                            size={19}
                                            className={active ? 'text-[#c4121a]' : 'text-white/85 group-hover:text-white'}
                                        />

                                        {!collapsed && (
                                            <span className="text-left truncate">
                                                {item.label}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="relative z-10 border-t border-white/15 bg-black/10 px-4 py-4 space-y-3">
                {!mobile && (
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className={`w-full flex items-center ${
                            collapsed ? 'justify-center' : 'justify-center gap-2'
                        } px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition`}
                    >
                        {collapsed ? (
                            <PanelLeftOpen size={18} />
                        ) : (
                            <>
                                <PanelLeftClose size={18} />
                                <span>Collapse</span>
                            </>
                        )}
                    </button>
                )}

                <button
                    type="button"
                    onClick={onLogout}
                    className={`w-full flex items-center ${
                        collapsed ? 'justify-center' : 'justify-center gap-2'
                    } px-4 py-3 rounded-2xl bg-white text-[#d71920] hover:bg-red-50 text-sm font-black transition shadow-lg shadow-black/10`}
                >
                    <LogOut size={18} />

                    {!collapsed && <span>Logout</span>}
                </button>

                {!collapsed && (
                    <p className="text-[11px] text-white/45 text-center leading-relaxed px-2">
                        Sistem internal SEKPiM Telkom University Surabaya.
                    </p>
                )}
            </div>
        </aside>
    );
}

export default DashboardLayout;
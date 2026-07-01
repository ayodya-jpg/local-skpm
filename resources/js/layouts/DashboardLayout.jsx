import React from 'react';
import {
    Building2,
    CheckCircle,
    FilePlus,
    History,
    Home,
    KeyRound,
    LayoutDashboard,
    LogOut,
    Users,
} from 'lucide-react';

import csrfToken from '../services/csrf';

import DashboardPage from '../pages/DashboardPage';
import UserManagementPage from '../pages/UserManagementPage';
import AjukanNomorSuratPage from '../pages/AjukanNomorSuratPage';
import RiwayatNomorSuratPage from '../pages/RiwayatNomorSuratPage';
import ApprovalNomorSuratPage from '../pages/ApprovalNomorSuratPage';
import KodePerihalPage from '../pages/KodePerihalPage';
import KodePemilikPage from '../pages/KodePemilikPage';

function DashboardLayout({ user, setUser, page, setPage }) {
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

    const getInitials = (name) => {
        if (!name) return 'U';

        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
    };

    const pageTitleMap = {
        dashboard: 'Dashboard',
        'ajukan-nomor': 'Ajukan Nomor Surat',
        'riwayat-nomor': 'Riwayat Pengajuan',
        'approval-nomor': 'Approval Pengajuan',
        'kode-perihal': 'Kode Perihal',
        'kode-pemilik': 'Kode Pemilik',
        'user-management': 'User Management',
    };

    const pageTitle = pageTitleMap[page] || 'Dashboard';

    const MenuButton = ({ id, icon, label }) => (
        <button
            onClick={() => setPage(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                page === id
                    ? 'bg-white text-[#c4121a] shadow-md'
                    : 'text-white/90 hover:bg-white/10'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen flex bg-[#f4f6fa] text-slate-800">
            <aside className="w-[250px] min-h-screen bg-gradient-to-b from-[#d71920] via-[#a90f1b] to-[#210711] text-white flex flex-col relative overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_34%)]"></div>

                <div className="relative z-10 px-5 pt-8 pb-8">
                    <div className="flex justify-center">
                        <img
                            src="/images/logo-telkom.png"
                            alt="Logo Telkom University"
                            className="w-36 h-auto object-contain -translate-x-3"
                        />
                    </div>
                </div>

                <nav className="relative z-10 flex-1 px-4 space-y-2 overflow-y-auto pb-4">
                    <MenuButton
                        id="dashboard"
                        icon={<LayoutDashboard size={18} />}
                        label="Dashboard"
                    />

                    <p className="text-[11px] uppercase tracking-wider text-white/50 font-bold px-4 pt-4">
                        Penomoran
                    </p>

                    <MenuButton
                        id="ajukan-nomor"
                        icon={<FilePlus size={18} />}
                        label="Ajukan Nomor"
                    />

                    <MenuButton
                        id="riwayat-nomor"
                        icon={<History size={18} />}
                        label="Riwayat Pengajuan"
                    />

                    {user.unit === 'sekpim' && (
                        <>
                            <MenuButton
                                id="approval-nomor"
                                icon={<CheckCircle size={18} />}
                                label="Approval"
                            />

                            <p className="text-[11px] uppercase tracking-wider text-white/50 font-bold px-4 pt-4">
                                Master Data
                            </p>

                            <MenuButton
                                id="kode-perihal"
                                icon={<KeyRound size={18} />}
                                label="Kode Perihal"
                            />

                            <MenuButton
                                id="kode-pemilik"
                                icon={<Building2 size={18} />}
                                label="Kode Pemilik"
                            />

                            <MenuButton
                                id="user-management"
                                icon={<Users size={18} />}
                                label="User Management"
                            />
                        </>
                    )}
                </nav>

                <div className="relative z-10 border-t border-white/15 bg-black/15">
                    <div className="px-5 py-4 flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#ef233c] flex items-center justify-center text-sm font-bold shadow">
                            {getInitials(user.name)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold leading-tight truncate">
                                {user.name}
                            </p>
                            <p className="text-xs text-white/70 capitalize">
                                Unit {user.unit}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-6 py-4 text-sm text-white/90 hover:bg-white/10 transition font-semibold"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 min-w-0">
                <section className="px-7 py-7">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                            {pageTitle}
                        </h1>

                        <div className="flex items-center gap-2 text-slate-500 mt-2 text-sm">
                            <Home size={15} />
                            <span>/</span>
                            <span>{pageTitle}</span>
                        </div>
                    </div>

                    {page === 'dashboard' && <DashboardPage />}

                    {page === 'ajukan-nomor' && <AjukanNomorSuratPage />}

                    {page === 'riwayat-nomor' && <RiwayatNomorSuratPage />}

                    {page === 'approval-nomor' && user.unit === 'sekpim' && (
                        <ApprovalNomorSuratPage />
                    )}

                    {page === 'kode-perihal' && user.unit === 'sekpim' && (
                        <KodePerihalPage />
                    )}

                    {page === 'kode-pemilik' && user.unit === 'sekpim' && (
                        <KodePemilikPage />
                    )}

                    {page === 'user-management' && user.unit === 'sekpim' && (
                        <UserManagementPage />
                    )}
                </section>
            </main>
        </div>
    );
}

export default DashboardLayout;

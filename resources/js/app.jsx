import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';

import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';

const pageToPath = {
    dashboard: '/app/d',
    'ajukan-nomor': '/app/n/add',
    'riwayat-nomor': '/app/n/history',
    'approval-nomor': '/app/n/apv',
    'kode-perihal': '/app/m/kp',
    'kode-pemilik': '/app/m/km',
    'user-management': '/app/u/m',
};

const pathToPage = {
    '/app': 'dashboard',
    '/app/d': 'dashboard',
    '/app/n/add': 'ajukan-nomor',
    '/app/n/history': 'riwayat-nomor',
    '/app/n/apv': 'approval-nomor',
    '/app/m/kp': 'kode-perihal',
    '/app/m/km': 'kode-pemilik',
    '/app/u/m': 'user-management',
};

const sekpimOnlyPages = [
    'approval-nomor',
    'kode-perihal',
    'kode-pemilik',
    'user-management',
];

function getInitialPage() {
    const currentPath = window.location.pathname;

    if (pathToPage[currentPath]) {
        return pathToPage[currentPath];
    }

    return localStorage.getItem('sekpim_active_page') || 'dashboard';
}

function App() {
    const [user, setUser] = useState(null);

    const [page, setPage] = useState(() => {
        return getInitialPage();
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();

        const handleBackForward = () => {
            const currentPath = window.location.pathname;
            const newPage = pathToPage[currentPath] || 'dashboard';

            setPage(newPage);
        };

        window.addEventListener('popstate', handleBackForward);

        return () => {
            window.removeEventListener('popstate', handleBackForward);
        };
    }, []);

    useEffect(() => {
        if (loading) return;

        if (!user) {
            if (window.location.pathname !== '/') {
                window.history.replaceState({}, '', '/');
            }

            return;
        }

        let nextPage = page;

        if (user.unit !== 'sekpim' && sekpimOnlyPages.includes(page)) {
            nextPage = 'dashboard';
            setPage('dashboard');
        }

        localStorage.setItem('sekpim_active_page', nextPage);

        const targetPath = pageToPath[nextPage] || '/app/d';

        if (window.location.pathname !== targetPath) {
            window.history.pushState({}, '', targetPath);
        }
    }, [page, user, loading]);

    const checkUser = async () => {
        try {
            const response = await fetch('/me', {
                headers: {
                    Accept: 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();

                if (
                    data.user.unit !== 'sekpim' &&
                    sekpimOnlyPages.includes(page)
                ) {
                    setPage('dashboard');
                    localStorage.setItem('sekpim_active_page', 'dashboard');
                    window.history.replaceState({}, '', '/app/d');
                }

                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.log('Belum login');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <LoginPage setUser={setUser} />;
    }

    return (
        <DashboardLayout
            user={user}
            setUser={setUser}
            page={page}
            setPage={setPage}
        />
    );
}

const container = document.getElementById('app');

if (container && !container._reactRoot) {
    container._reactRoot = createRoot(container);
}

if (container) {
    container._reactRoot.render(<App />);
}

import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';

import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
    const [user, setUser] = useState(null);

    const [page, setPage] = useState(() => {
        return localStorage.getItem('sekpim_active_page') || 'dashboard';
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    useEffect(() => {
        localStorage.setItem('sekpim_active_page', page);
    }, [page]);

    const checkUser = async () => {
        try {
            const response = await fetch('/me', {
                headers: {
                    Accept: 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);

                if (data.user.unit !== 'sekpim' && page === 'user-management') {
                    setPage('dashboard');
                    localStorage.setItem('sekpim_active_page', 'dashboard');
                }
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

createRoot(document.getElementById('app')).render(<App />);

import React, { useState } from 'react';
import csrfToken from '../services/csrf';

function LoginPage({ setUser }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError('Username atau password salah.');
                return;
            }

            setUser(data.user);
        } catch (error) {
            setError('Terjadi kesalahan saat login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen relative flex items-center justify-center bg-cover bg-center px-4"
            style={{
                backgroundImage: "url('/images/telkom.png')",
            }}
        >
            <div className="absolute inset-0 bg-black/35"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30"></div>

            <div className="relative z-10 w-full max-w-4xl">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] overflow-hidden rounded-[32px] bg-white/90 shadow-2xl shadow-black/30 backdrop-blur-xl border border-white/40">
                    <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-[#e31b23]/95 via-[#b5121b]/95 to-[#2b0710]/95 text-white">
                        <div>
                            <img
                                src="/images/logo-telkom.png"
                                alt="Logo Telkom University"
                                className="w-44 h-auto object-contain mb-14"
                            />

                            <h1 className="text-4xl font-bold leading-tight">
                                SEKPIM
                                <br />
                                Telkom University
                            </h1>

                            <p className="mt-5 text-white/85 leading-relaxed max-w-sm">
                                Sistem pengelolaan akses dan administrasi unit SEKPIM
                                Telkom University.
                            </p>
                        </div>

                        <p className="text-sm text-white/70">
                            © 2026 Telkom University
                        </p>
                    </div>

                    <div className="bg-white/95 p-8 sm:p-10 lg:p-12">
                        <div className="lg:hidden flex justify-center mb-8">
                            <img
                                src="/images/logo-telkom.png"
                                alt="Logo Telkom University"
                                className="w-40 h-auto object-contain"
                            />
                        </div>

                        <div className="mb-8">
                            <p className="text-sm font-semibold text-[#d71920] mb-2">
                                SEKPIM Dashboard
                            </p>

                            <h2 className="text-3xl font-bold text-slate-950">
                                Selamat Datang
                            </h2>

                            <p className="text-slate-500 mt-2 leading-relaxed">
                                Silakan masuk menggunakan username dan password yang telah terdaftar.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Username
                                </label>

                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                                    placeholder="Masukkan username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                                    placeholder="Masukkan password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#d71920] hover:bg-[#bd1118] disabled:bg-red-300 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-red-200 transition mt-2"
                            >
                                {loading ? 'Memproses...' : 'Login'}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-200">
                            <p className="text-xs text-center text-slate-400">
                                SEKPIM Telkom University Internal System
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;

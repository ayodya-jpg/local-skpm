import React, { useState } from 'react';
import Swal from 'sweetalert2';

import { apiSend, getErrorMessage } from '../services/api';

function LoginPage({ setUser }) {
    const [mode, setMode] = useState('login');

    const [loginForm, setLoginForm] = useState({
        username: '',
        password: '',
    });

    const [registerForm, setRegisterForm] = useState({
        name: '',
        username: '',
        email: '',
        unit: '',
        password: '',
        password_confirmation: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLoginChange = (event) => {
        const { name, value } = event.target;

        setLoginForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleRegisterChange = (event) => {
        const { name, value } = event.target;

        setRegisterForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const resetMessage = () => {
        setError('');
    };

    const switchMode = (nextMode) => {
        setMode(nextMode);
        resetMessage();
    };

    const handleLogin = async (event) => {
        event.preventDefault();

        resetMessage();
        setLoading(true);

        try {
            const data = await apiSend('/login', 'POST', {
                username: loginForm.username,
                password: loginForm.password,
            });

            localStorage.setItem('sekpim_login_success', 'true');
            setUser(data.user);
        } catch (error) {
            setError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (event) => {
        event.preventDefault();

        resetMessage();

        if (registerForm.password !== registerForm.password_confirmation) {
            setError('Konfirmasi password tidak sama.');
            return;
        }

        setLoading(true);

        try {
            const data = await apiSend('/register', 'POST', {
                name: registerForm.name,
                username: registerForm.username,
                email: registerForm.email,
                unit: registerForm.unit,
                password: registerForm.password,
                password_confirmation: registerForm.password_confirmation,
            });

            setRegisterForm({
                name: '',
                username: '',
                email: '',
                unit: '',
                password: '',
                password_confirmation: '',
            });

            await Swal.fire({
                icon: 'success',
                title: 'Pendaftaran Berhasil',
                text: data.message || 'Akun berhasil didaftarkan dan menunggu aktivasi admin SEKPiM.',
                confirmButtonColor: '#d71920',
            });

            setMode('login');
        } catch (error) {
            setError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen relative flex items-center justify-center bg-cover bg-center px-4 py-6"
            style={{
                backgroundImage: "url('/images/telkom.png')",
            }}
        >
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30"></div>

            <div className="relative z-10 w-full max-w-5xl">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_430px] overflow-hidden rounded-[32px] bg-white/90 shadow-2xl shadow-black/30 backdrop-blur-xl border border-white/40">
                    <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-[#e31b23]/95 via-[#b5121b]/95 to-[#2b0710]/95 text-white min-h-[620px]">
                        <div>
                            <img
                                src="/images/logo-telkom.png"
                                alt="Logo Telkom University"
                                className="w-44 h-auto object-contain mb-12"
                            />

                            <h1 className="text-4xl font-bold leading-tight">
                                SEKPIM
                                <br />
                                Telkom University
                            </h1>

                            <p className="mt-5 text-white/85 leading-relaxed max-w-sm">
                                Sistem pengajuan nomor surat, monitoring status, dan pengelolaan administrasi unit.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
                                <p className="text-sm font-bold">
                                    Pendaftaran Akun
                                </p>

                                <p className="text-sm text-white/75 mt-1 leading-relaxed">
                                    Akun baru otomatis menjadi user biasa dan harus menunggu aktivasi admin SEKPiM.
                                </p>
                            </div>

                            <p className="text-sm text-white/70">
                                © 2026 Telkom University
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/95 p-6 sm:p-8 lg:p-9 min-h-[620px] flex flex-col">
                        <div className="lg:hidden flex justify-center mb-6">
                            <img
                                src="/images/logo-telkom.png"
                                alt="Logo Telkom University"
                                className="w-36 h-auto object-contain"
                            />
                        </div>

                        <div className="mb-5 shrink-0">
                            <p className="text-sm font-semibold text-[#d71920] mb-1">
                                SEKPIM Dashboard
                            </p>

                            <h2 className="text-2xl font-bold text-slate-950">
                                {mode === 'login' ? 'Selamat Datang' : 'Daftar Akun'}
                            </h2>

                            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                {mode === 'login'
                                    ? 'Silakan masuk menggunakan akun yang telah terdaftar.'
                                    : 'Akun baru akan menunggu aktivasi admin SEKPiM.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl mb-5 shrink-0">
                            <button
                                type="button"
                                onClick={() => switchMode('login')}
                                className={`py-2.5 rounded-xl text-sm font-bold transition ${
                                    mode === 'login'
                                        ? 'bg-white text-[#d71920] shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Login
                            </button>

                            <button
                                type="button"
                                onClick={() => switchMode('register')}
                                className={`py-2.5 rounded-xl text-sm font-bold transition ${
                                    mode === 'register'
                                        ? 'bg-white text-[#d71920] shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Daftar
                            </button>
                        </div>

                        {error ? (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm whitespace-pre-line shrink-0">
                                {error}
                            </div>
                        ) : null}

                        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                            {mode === 'login' ? (
                                <form onSubmit={handleLogin} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Username
                                        </label>

                                        <input
                                            type="text"
                                            name="username"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                                            placeholder="Masukkan username"
                                            value={loginForm.username}
                                            onChange={handleLoginChange}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Password
                                        </label>

                                        <input
                                            type="password"
                                            name="password"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                                            placeholder="Masukkan password"
                                            value={loginForm.password}
                                            onChange={handleLoginChange}
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
                            ) : (
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Nama Lengkap
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                                            placeholder="Nama lengkap"
                                            value={registerForm.name}
                                            onChange={handleRegisterChange}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Username
                                            </label>

                                            <input
                                                type="text"
                                                name="username"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                                                placeholder="username"
                                                value={registerForm.username}
                                                onChange={handleRegisterChange}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Unit
                                            </label>

                                            <input
                                                type="text"
                                                name="unit"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                                                placeholder="logistik"
                                                value={registerForm.unit}
                                                onChange={handleRegisterChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                                            placeholder="Opsional"
                                            value={registerForm.email}
                                            onChange={handleRegisterChange}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Password
                                            </label>

                                            <input
                                                type="password"
                                                name="password"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                                                placeholder="Minimal 6 karakter"
                                                value={registerForm.password}
                                                onChange={handleRegisterChange}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Konfirmasi
                                            </label>

                                            <input
                                                type="password"
                                                name="password_confirmation"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                                                placeholder="Ulangi password"
                                                value={registerForm.password_confirmation}
                                                onChange={handleRegisterChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 border border-yellow-100 rounded-2xl px-4 py-3">
                                        <p className="text-xs text-yellow-700 leading-relaxed">
                                            Role otomatis menjadi user biasa. Admin SEKPiM akan menentukan aktivasi, role, dan penyesuaian unit.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#d71920] hover:bg-[#bd1118] disabled:bg-red-300 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-red-200 transition"
                                    >
                                        {loading ? 'Memproses...' : 'Daftar Akun'}
                                    </button>
                                </form>
                            )}
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-200 shrink-0">
                            <p className="text-xs text-center text-slate-400">
                                SEKPIM Telkom University Internal System
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                {`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }

                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }

                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #cbd5e1;
                        border-radius: 999px;
                    }

                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #94a3b8;
                    }
                `}
            </style>
        </div>
    );
}

export default LoginPage;
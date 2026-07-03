import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
    CheckCircle,
    Edit,
    Plus,
    Power,
    Shield,
    Trash2,
    UserX,
    Users,
} from 'lucide-react';

import { apiGet, apiSend, getErrorMessage } from '../services/api';

function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [form, setForm] = useState({
        name: '',
        username: '',
        unit: '',
        email: '',
        password: '',
        role: 'user',
        status: 'active',
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setFetching(true);

            const data = await apiGet('/user-management');

            setUsers(data.users || []);
        } catch (error) {
            showError(getErrorMessage(error));
        } finally {
            setFetching(false);
        }
    };

    const showSuccess = (message) => {
        Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: message,
            timer: 1700,
            showConfirmButton: false,
            confirmButtonColor: '#d00012',
        });
    };

    const showError = (message) => {
        Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: message,
            confirmButtonColor: '#d00012',
        });
    };

    const resetForm = () => {
        setForm({
            name: '',
            username: '',
            unit: '',
            email: '',
            password: '',
            role: 'user',
            status: 'active',
        });
        setEditingId(null);
    };

    const openCreateModal = () => {
        resetForm();
        setModalOpen(true);
    };

    const openEditModal = (user) => {
        setEditingId(user.id);
        setForm({
            name: user.name || '',
            username: user.username || '',
            unit: user.unit || '',
            email: user.email || '',
            password: '',
            role: user.role || 'user',
            status: user.status || 'pending',
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        resetForm();
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);

        const url = editingId
            ? `/user-management/${editingId}`
            : '/user-management';

        const method = editingId ? 'PUT' : 'POST';

        const payload = {
            name: form.name,
            username: form.username,
            email: form.email,
            unit: form.unit,
            role: form.role,
            status: form.status,
        };

        if (form.password) {
            payload.password = form.password;
        }

        if (!editingId && !form.password) {
            showError('Password wajib diisi untuk user baru.');
            setLoading(false);
            return;
        }

        try {
            const data = await apiSend(url, method, payload);

            await fetchUsers();
            closeModal();

            showSuccess(data.message || 'Data user berhasil disimpan.');
        } catch (error) {
            showError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleQuickStatus = async (user, action) => {
        const actionMap = {
            activate: {
                title: 'Aktifkan User?',
                text: `Akun ${user.name} akan diaktifkan dan dapat login ke sistem.`,
                confirmText: 'Ya, Aktifkan',
                url: `/user-management/${user.id}/activate`,
                color: '#16a34a',
            },
            deactivate: {
                title: 'Nonaktifkan User?',
                text: `Akun ${user.name} tidak dapat login sampai diaktifkan kembali.`,
                confirmText: 'Ya, Nonaktifkan',
                url: `/user-management/${user.id}/deactivate`,
                color: '#f97316',
            },
            reject: {
                title: 'Tolak User?',
                text: `Pendaftaran ${user.name} akan ditandai sebagai ditolak.`,
                confirmText: 'Ya, Tolak',
                url: `/user-management/${user.id}/reject`,
                color: '#d71920',
            },
        };

        const config = actionMap[action];

        const result = await Swal.fire({
            icon: 'question',
            title: config.title,
            text: config.text,
            showCancelButton: true,
            confirmButtonText: config.confirmText,
            cancelButtonText: 'Batal',
            confirmButtonColor: config.color,
            cancelButtonColor: '#64748b',
        });

        if (!result.isConfirmed) return;

        try {
            const data = await apiSend(config.url, 'POST');

            await fetchUsers();

            showSuccess(data.message || 'Status user berhasil diperbarui.');
        } catch (error) {
            showError(getErrorMessage(error));
        }
    };

    const handleDelete = async (user) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Hapus User?',
            html: `
                <div style="text-align:left">
                    <p>User berikut akan dihapus dari sistem:</p>
                    <br/>
                    <b>${user.name}</b>
                    <br/>
                    <small>${user.username}</small>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#d71920',
            cancelButtonColor: '#64748b',
        });

        if (!result.isConfirmed) return;

        try {
            const data = await apiSend(`/user-management/${user.id}`, 'DELETE');

            await fetchUsers();

            showSuccess(data.message || 'User berhasil dihapus.');
        } catch (error) {
            showError(getErrorMessage(error));
        }
    };

    const pendingUsers = users.filter((user) => user.status === 'pending');
    const activeUsers = users.filter((user) => user.status === 'active');
    const inactiveUsers = users.filter((user) => user.status === 'inactive');
    const rejectedUsers = users.filter((user) => user.status === 'rejected');

    return (
        <div className="space-y-7">
            <div className="bg-white rounded-3xl shadow-[0_12px_35px_rgba(15,23,42,0.08)] border border-slate-100 p-8">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#d00012] flex items-center justify-center">
                            <Users size={32} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-950">
                                User Management
                            </h2>

                            <p className="text-slate-500 mt-1">
                                Admin SEKPiM dapat mengaktifkan akun baru, mengubah unit, menentukan role, dan mengatur status user.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center justify-center gap-2 bg-[#e60012] hover:bg-[#c90010] text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-red-200 transition"
                    >
                        <Plus size={18} />
                        Tambah User
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <SummaryCard
                    title="Pending"
                    value={pendingUsers.length}
                    color="bg-yellow-50 text-yellow-700"
                />

                <SummaryCard
                    title="Active"
                    value={activeUsers.length}
                    color="bg-green-50 text-green-700"
                />

                <SummaryCard
                    title="Inactive"
                    value={inactiveUsers.length}
                    color="bg-orange-50 text-orange-700"
                />

                <SummaryCard
                    title="Rejected"
                    value={rejectedUsers.length}
                    color="bg-red-50 text-red-700"
                />
            </div>

            <div className="bg-white rounded-3xl shadow-[0_12px_35px_rgba(15,23,42,0.08)] border border-slate-100 p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-950">
                            Daftar User
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                            User yang mendaftar sendiri akan masuk dengan role user dan status pending.
                        </p>
                    </div>

                    <button
                        onClick={fetchUsers}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition"
                    >
                        Refresh
                    </button>
                </div>

                {fetching ? (
                    <div className="border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
                        Memuat data user...
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                        <table className="w-full min-w-[1200px] border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left px-5 py-4 text-sm font-bold text-slate-700 w-16">
                                        No
                                    </th>

                                    <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">
                                        Nama
                                    </th>

                                    <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">
                                        Username
                                    </th>

                                    <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">
                                        Unit
                                    </th>

                                    <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">
                                        Role
                                    </th>

                                    <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">
                                        Status
                                    </th>

                                    <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">
                                        Email
                                    </th>

                                    <th className="text-left px-5 py-4 text-sm font-bold text-slate-700 w-[330px]">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {users.length > 0 ? (
                                    users.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80 transition align-top"
                                        >
                                            <td className="px-5 py-5 text-slate-600">
                                                {index + 1}
                                            </td>

                                            <td className="px-5 py-5">
                                                <p className="font-bold text-slate-800">
                                                    {item.name}
                                                </p>

                                                <p className="text-xs text-slate-400 mt-1">
                                                    Dibuat: {formatDate(item.created_at)}
                                                </p>
                                            </td>

                                            <td className="px-5 py-5 text-slate-600">
                                                {item.username}
                                            </td>

                                            <td className="px-5 py-5">
                                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 capitalize">
                                                    {item.unit || '-'}
                                                </span>
                                            </td>

                                            <td className="px-5 py-5">
                                                <RoleBadge role={item.role} />
                                            </td>

                                            <td className="px-5 py-5">
                                                <StatusBadge status={item.status} />
                                            </td>

                                            <td className="px-5 py-5 text-slate-600">
                                                {item.email || '-'}
                                            </td>

                                            <td className="px-5 py-5">
                                                <div className="flex flex-wrap gap-2">
                                                    {item.status !== 'active' ? (
                                                        <button
                                                            onClick={() => handleQuickStatus(item, 'activate')}
                                                            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition"
                                                        >
                                                            <CheckCircle size={14} />
                                                            Aktifkan
                                                        </button>
                                                    ) : null}

                                                    {item.status === 'active' ? (
                                                        <button
                                                            onClick={() => handleQuickStatus(item, 'deactivate')}
                                                            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-xs font-semibold transition"
                                                        >
                                                            <Power size={14} />
                                                            Nonaktif
                                                        </button>
                                                    ) : null}

                                                    {item.status === 'pending' ? (
                                                        <button
                                                            onClick={() => handleQuickStatus(item, 'reject')}
                                                            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition"
                                                        >
                                                            <UserX size={14} />
                                                            Tolak
                                                        </button>
                                                    ) : null}

                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-xs font-semibold transition"
                                                    >
                                                        <Edit size={14} />
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-semibold transition"
                                                    >
                                                        <Trash2 size={14} />
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="px-6 py-12 text-center text-slate-500"
                                        >
                                            Belum ada data user.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modalOpen ? (
                <UserModal
                    editingId={editingId}
                    form={form}
                    loading={loading}
                    onChange={handleChange}
                    onClose={closeModal}
                    onSubmit={handleSubmit}
                />
            ) : null}
        </div>
    );
}

function SummaryCard({ title, value, color }) {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <p className="text-sm font-semibold text-slate-500">
                {title}
            </p>

            <div className="flex items-center justify-between mt-2">
                <h3 className="text-3xl font-bold text-slate-950">
                    {value}
                </h3>

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                    <Shield size={24} />
                </div>
            </div>
        </div>
    );
}

function RoleBadge({ role }) {
    const classes = {
        user: 'bg-blue-50 text-blue-700',
        admin: 'bg-red-50 text-red-700',
        approver: 'bg-purple-50 text-purple-700',
        super_admin: 'bg-slate-800 text-white',
    };

    const labels = {
        user: 'User',
        admin: 'Admin',
        approver: 'Approver',
        super_admin: 'Super Admin',
    };

    return (
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${classes[role] || 'bg-slate-100 text-slate-600'}`}>
            {labels[role] || role || '-'}
        </span>
    );
}

function StatusBadge({ status }) {
    const classes = {
        pending: 'bg-yellow-50 text-yellow-700',
        active: 'bg-green-50 text-green-700',
        inactive: 'bg-orange-50 text-orange-700',
        rejected: 'bg-red-50 text-red-700',
    };

    const labels = {
        pending: 'Pending',
        active: 'Active',
        inactive: 'Inactive',
        rejected: 'Rejected',
    };

    return (
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${classes[status] || 'bg-slate-100 text-slate-600'}`}>
            {labels[status] || status || '-'}
        </span>
    );
}

function UserModal({
    editingId,
    form,
    loading,
    onChange,
    onClose,
    onSubmit,
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-7 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-950">
                        {editingId ? 'Edit User' : 'Tambah User'}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                        Admin dapat menentukan unit, role, dan status user.
                    </p>
                </div>

                <form onSubmit={onSubmit} className="p-7 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Nama
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={onChange}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Nama lengkap user"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Username
                            </label>

                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={onChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="username"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={onChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Opsional"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Unit
                        </label>

                        <input
                            type="text"
                            name="unit"
                            value={form.unit}
                            onChange={onChange}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Contoh: sekpim, logistik, akademik, sdm"
                            required
                        />

                        <p className="text-xs text-slate-400 mt-2">
                            Gunakan huruf kecil agar konsisten, contoh: logistik.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={onChange}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder={editingId ? 'Kosongkan jika tidak ingin mengganti password' : 'Minimal 6 karakter'}
                            required={!editingId}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Role
                            </label>

                            <select
                                name="role"
                                value={form.role}
                                onChange={onChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                required
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="approver">Approver</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Status
                            </label>

                            <select
                                name="status"
                                value={form.status}
                                onChange={onChange}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                required
                            >
                                <option value="pending">Pending</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
                        <p className="text-xs text-blue-700 leading-relaxed">
                            User yang mendaftar sendiri tidak bisa memilih role. Role hanya bisa ditentukan dari halaman ini oleh admin SEKPiM.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-3 rounded-xl bg-[#e60012] hover:bg-[#c90010] disabled:bg-red-300 text-white font-semibold transition"
                        >
                            {loading
                                ? 'Menyimpan...'
                                : editingId
                                    ? 'Simpan Perubahan'
                                    : 'Tambah User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function formatDate(dateValue) {
    if (!dateValue) return '-';

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default UserManagementPage;
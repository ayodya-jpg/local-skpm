import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Edit, Plus, Trash2, Users } from 'lucide-react';
import csrfToken from '../services/csrf';

function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: '',
        username: '',
        unit: '',
        email: '',
        password: '',
    });

    useEffect(() => {
        fetchUsers();
    }, []);

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

    const fetchUsers = async () => {
        try {
            const response = await fetch('/user-management', {
                headers: {
                    Accept: 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                showError(data.message || 'Gagal mengambil data user.');
                return;
            }

            setUsers(data.users);
        } catch (error) {
            showError('Terjadi kesalahan saat mengambil data user.');
        }
    };

    const resetForm = () => {
        setForm({
            name: '',
            username: '',
            unit: '',
            email: '',
            password: '',
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
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        resetForm();
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const getFirstValidationError = (data) => {
        if (data.errors) {
            return Object.values(data.errors)[0][0];
        }

        return data.message || 'Terjadi kesalahan.';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = editingId
            ? `/user-management/${editingId}`
            : '/user-management';

        const method = editingId ? 'PUT' : 'POST';

        setLoading(true);

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                showError(getFirstValidationError(data));
                return;
            }

            closeModal();
            await fetchUsers();

            showSuccess(
                editingId
                    ? 'Data user berhasil diperbarui.'
                    : 'User baru berhasil ditambahkan.'
            );
        } catch (error) {
            showError('Terjadi kesalahan saat menyimpan user.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (user) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Hapus User?',
            text: `Yakin ingin menghapus user "${user.username}"?`,
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#d00012',
            cancelButtonColor: '#64748b',
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`/user-management/${user.id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                showError(data.message || 'Gagal menghapus user.');
                return;
            }

            await fetchUsers();

            Swal.fire({
                icon: 'success',
                title: 'Terhapus',
                text: 'User berhasil dihapus.',
                timer: 1700,
                showConfirmButton: false,
                confirmButtonColor: '#d00012',
            });
        } catch (error) {
            showError('Terjadi kesalahan saat menghapus user.');
        }
    };

    return (
        <div className="space-y-7">
            <div className="bg-white rounded-3xl shadow-[0_12px_35px_rgba(15,23,42,0.08)] border border-slate-100 p-8">
                <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#d00012] flex items-center justify-center">
                            <Users size={32} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-950">
                                User Management
                            </h2>
                            <p className="text-slate-500 mt-1">
                                Halaman ini hanya dapat diakses oleh admin unit SEKPiM.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-[#e60012] hover:bg-[#c90010] text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-red-200 transition"
                    >
                        <Plus size={18} />
                        Tambah User
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_12px_35px_rgba(15,23,42,0.08)] border border-slate-100 p-8">
                <h3 className="text-lg font-bold text-slate-950 mb-6">
                    Daftar User
                </h3>

                <div className="overflow-hidden border border-slate-200 rounded-2xl">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-6 py-4 text-sm font-bold text-slate-700 w-16">
                                    No
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">
                                    Nama
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">
                                    Username
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">
                                    Unit
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">
                                    Email
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-bold text-slate-700 w-56">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.length > 0 ? (
                                users.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80 transition"
                                    >
                                        <td className="px-6 py-5 text-slate-600">
                                            {index + 1}
                                        </td>

                                        <td className="px-6 py-5 font-semibold text-slate-800">
                                            {item.name}
                                        </td>

                                        <td className="px-6 py-5 text-slate-600">
                                            {item.username}
                                        </td>

                                        <td className="px-6 py-5">
                                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 capitalize">
                                                {item.unit}
                                            </span>
                                        </td>

                                        <td className="px-6 py-5 text-slate-600">
                                            {item.email}
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                                                >
                                                    <Edit size={15} />
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="flex items-center gap-2 bg-[#e60012] hover:bg-[#c90010] text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                                                >
                                                    <Trash2 size={15} />
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-6 py-12 text-center text-slate-500"
                                    >
                                        Belum ada data user.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalOpen && (
                <UserModal
                    editingId={editingId}
                    form={form}
                    loading={loading}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    closeModal={closeModal}
                />
            )}
        </div>
    );
}

function UserModal({
    editingId,
    form,
    loading,
    handleChange,
    handleSubmit,
    closeModal,
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="px-7 py-5 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-950">
                            {editingId ? 'Edit User' : 'Tambah User Baru'}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Lengkapi data user sesuai unit masing-masing.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeModal}
                        className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-500 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-7">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormInput
                            label="Nama"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Masukkan nama"
                            required
                        />

                        <FormInput
                            label="Username"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="Masukkan username"
                            required
                        />

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Unit
                            </label>
                            <select
                                name="unit"
                                value={form.unit}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                            >
                                <option value="">Pilih unit</option>
                                <option value="sekpim">SEKPiM / Superadmin</option>
                                <option value="logistik">Logistik</option>
                                <option value="keuangan">Keuangan</option>
                                <option value="sdm">SDM</option>
                                <option value="akademik">Akademik</option>
                                <option value="umum">Umum</option>
                            </select>
                        </div>

                        <FormInput
                            label="Email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Masukkan email"
                        />

                        <div className="md:col-span-2">
                            <FormInput
                                label="Password"
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder={
                                    editingId
                                        ? 'Kosongkan jika tidak ingin mengubah password'
                                        : 'Masukkan password'
                                }
                                required={!editingId}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-7 pt-5 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 rounded-xl bg-[#e60012] hover:bg-[#c90010] disabled:bg-red-300 text-white font-semibold transition"
                        >
                            {loading
                                ? 'Menyimpan...'
                                : editingId
                                    ? 'Update User'
                                    : 'Tambah User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function FormInput({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    required = false,
}) {
    return (
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
                {label}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
        </div>
    );
}

export default UserManagementPage;

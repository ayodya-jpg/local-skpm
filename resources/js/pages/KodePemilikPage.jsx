import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Edit, Plus, Trash2 } from 'lucide-react';

import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { apiGet, apiSend, getErrorMessage } from '../services/api';

function KodePemilikPage() {
    const [items, setItems] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        kode: '',
        nama_pemilik: '',
        unit: '',
        is_active: true,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await apiGet('/kode-pemilik');
            setItems(data.kode_pemiliks || []);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: getErrorMessage(error),
                confirmButtonColor: '#d71920',
            });
        }
    };

    const resetForm = () => {
        setForm({
            kode: '',
            nama_pemilik: '',
            unit: '',
            is_active: true,
        });
        setEditingId(null);
    };

    const openCreateModal = () => {
        resetForm();
        setModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingId(item.id);
        setForm({
            kode: item.kode || '',
            nama_pemilik: item.nama_pemilik || '',
            unit: item.unit || '',
            is_active: Boolean(item.is_active),
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        resetForm();
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = editingId
                ? `/kode-pemilik/${editingId}`
                : '/kode-pemilik';

            const method = editingId ? 'PUT' : 'POST';

            await apiSend(url, method, form);

            closeModal();
            await fetchData();

            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: editingId
                    ? 'Kode pemilik berhasil diperbarui.'
                    : 'Kode pemilik berhasil ditambahkan.',
                timer: 1600,
                showConfirmButton: false,
            });
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

    const handleDelete = async (item) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Hapus Kode?',
            text: `Yakin ingin menghapus kode "${item.kode}"?`,
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#d71920',
            cancelButtonColor: '#64748b',
        });

        if (!result.isConfirmed) return;

        try {
            await apiSend(`/kode-pemilik/${item.id}`, 'DELETE');
            await fetchData();

            Swal.fire({
                icon: 'success',
                title: 'Terhapus',
                text: 'Kode pemilik berhasil dihapus.',
                timer: 1600,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: getErrorMessage(error),
                confirmButtonColor: '#d71920',
            });
        }
    };

    return (
        <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow border border-slate-100 p-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-950">
                        Master Data Kode Pemilik
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Kelola kode pemilik, unit, atau prodi untuk format nomor surat.
                    </p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-[#d71920] hover:bg-[#bd1118] text-white text-sm font-semibold px-5 py-3 rounded-xl"
                >
                    <Plus size={18} />
                    Tambah Kode
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow border border-slate-100 p-6">
                <div className="overflow-hidden border border-slate-200 rounded-xl">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">
                                    No
                                </th>
                                <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">
                                    Kode
                                </th>
                                <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">
                                    Nama Pemilik
                                </th>
                                <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">
                                    Unit
                                </th>
                                <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">
                                    Status
                                </th>
                                <th className="text-left px-5 py-4 text-sm font-bold text-slate-700">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.length > 0 ? (
                                items.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className="border-t border-slate-100"
                                    >
                                        <td className="px-5 py-4">
                                            {index + 1}
                                        </td>

                                        <td className="px-5 py-4 font-bold text-red-700">
                                            {item.kode}
                                        </td>

                                        <td className="px-5 py-4">
                                            {item.nama_pemilik}
                                        </td>

                                        <td className="px-5 py-4 capitalize">
                                            {item.unit}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    item.is_active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {item.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="flex items-center gap-1 bg-amber-500 text-white px-3 py-2 rounded-lg text-xs font-semibold"
                                                >
                                                    <Edit size={14} />
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-semibold"
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
                                        colSpan="6"
                                        className="px-5 py-8 text-center text-slate-500"
                                    >
                                        Belum ada data kode pemilik.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalOpen && (
                <Modal
                    title={editingId ? 'Edit Kode Pemilik' : 'Tambah Kode Pemilik'}
                    subtitle="Isi data kode pemilik, unit, atau prodi."
                    onClose={closeModal}
                >
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <FormInput
                            label="Kode"
                            name="kode"
                            value={form.kode}
                            onChange={handleChange}
                            placeholder="Contoh: PRODI-SI"
                            required
                        />

                        <FormInput
                            label="Nama Pemilik"
                            name="nama_pemilik"
                            value={form.nama_pemilik}
                            onChange={handleChange}
                            placeholder="Contoh: Program Studi Sistem Informasi"
                            required
                        />

                        <FormInput
                            label="Unit"
                            name="unit"
                            value={form.unit}
                            onChange={handleChange}
                            placeholder="Contoh: sekpim / logistik / prodi-si"
                            required
                        />

                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={form.is_active}
                                onChange={handleChange}
                            />
                            Aktif
                        </label>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-5 py-3 bg-slate-100 rounded-xl font-semibold"
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-3 bg-[#d71920] text-white rounded-xl font-semibold"
                            >
                                {loading ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

export default KodePemilikPage;

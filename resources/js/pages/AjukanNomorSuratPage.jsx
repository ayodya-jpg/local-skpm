import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { FilePlus, Send } from 'lucide-react';

import { apiGet, apiSendForm, getErrorMessage } from '../services/api';

function AjukanNomorSuratPage() {
    const [kodePerihals, setKodePerihals] = useState([]);
    const [kodePemiliks, setKodePemiliks] = useState([]);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        judul_surat: '',
        tanggal_surat: new Date().toISOString().slice(0, 10),
        kode_perihal_id: '',
        kode_pemilik_id: '',
        tujuan_surat: '',
        keterangan: '',
        file_dokumen: null,
    });

    useEffect(() => {
        fetchMasterData();
    }, []);

    const fetchMasterData = async () => {
        try {
            const perihal = await apiGet('/kode-perihal');
            const pemilik = await apiGet('/kode-pemilik');

            setKodePerihals(perihal.kode_perihals || []);
            setKodePemiliks(pemilik.kode_pemiliks || []);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: 'Gagal mengambil data kode perihal atau kode pemilik.',
                confirmButtonColor: '#d71920',
            });
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        setForm({
            ...form,
            [name]: files ? files[0] : value,
        });
    };

    const resetForm = () => {
        setForm({
            judul_surat: '',
            tanggal_surat: new Date().toISOString().slice(0, 10),
            kode_perihal_id: '',
            kode_pemilik_id: '',
            tujuan_surat: '',
            keterangan: '',
            file_dokumen: null,
        });

        const fileInput = document.getElementById('file_dokumen');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();

        formData.append('judul_surat', form.judul_surat);
        formData.append('tanggal_surat', form.tanggal_surat);
        formData.append('kode_perihal_id', form.kode_perihal_id);
        formData.append('kode_pemilik_id', form.kode_pemilik_id);
        formData.append('tujuan_surat', form.tujuan_surat);
        formData.append('keterangan', form.keterangan || '');

        if (form.file_dokumen) {
            formData.append('file_dokumen', form.file_dokumen);
        }

        try {
            await apiSendForm('/nomor-surat', 'POST', formData);

            resetForm();

            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'Pengajuan nomor surat berhasil dikirim dan menunggu approval admin SEKPiM.',
                timer: 2000,
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

    return (
        <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow border border-slate-100 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-red-50 text-[#d71920] flex items-center justify-center">
                        <FilePlus size={28} />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-950">
                            Ajukan Nomor Surat
                        </h2>

                        <p className="text-slate-500 mt-1">
                            Isi form pengajuan nomor surat. Nomor surat akan dibuat otomatis setelah disetujui admin SEKPiM.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow border border-slate-100 p-6">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Judul Surat
                        </label>

                        <input
                            type="text"
                            name="judul_surat"
                            value={form.judul_surat}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Contoh: Permohonan Pengadaan Barang"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Tanggal Surat
                        </label>

                        <input
                            type="date"
                            name="tanggal_surat"
                            value={form.tanggal_surat}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Tujuan Surat
                        </label>

                        <input
                            type="text"
                            name="tujuan_surat"
                            value={form.tujuan_surat}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Contoh: Kepala Unit Logistik"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Kode Perihal
                        </label>

                        <select
                            name="kode_perihal_id"
                            value={form.kode_perihal_id}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                            required
                        >
                            <option value="">Pilih Kode Perihal</option>

                            {kodePerihals.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.kode} - {item.nama_perihal}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Kode Pemilik / Unit / Prodi
                        </label>

                        <select
                            name="kode_pemilik_id"
                            value={form.kode_pemilik_id}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                            required
                        >
                            <option value="">Pilih Kode Pemilik</option>

                            {kodePemiliks.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.kode} - {item.nama_pemilik}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Keterangan
                        </label>

                        <textarea
                            name="keterangan"
                            value={form.keterangan}
                            onChange={handleChange}
                            rows="4"
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Tambahkan keterangan jika diperlukan"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Upload Dokumen Opsional
                        </label>

                        <input
                            id="file_dokumen"
                            type="file"
                            name="file_dokumen"
                            onChange={handleChange}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white"
                        />

                        <p className="text-xs text-slate-500 mt-2">
                            Format yang didukung: PDF, DOC, DOCX, JPG, JPEG, PNG. Maksimal 5MB.
                        </p>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
                        >
                            Reset
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-[#d71920] hover:bg-[#bd1118] disabled:bg-red-300 text-white rounded-xl font-semibold transition"
                        >
                            <Send size={17} />
                            {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AjukanNomorSuratPage;

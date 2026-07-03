import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
    Calendar,
    FileText,
    Send,
    Upload,
} from 'lucide-react';

import { apiGet, apiSendForm, getErrorMessage } from '../services/api';

function AjukanNomorSuratPage() {
    const [kodePerihals, setKodePerihals] = useState([]);
    const [kodePemiliks, setKodePemiliks] = useState([]);

    const [form, setForm] = useState({
        kode_perihal_id: '',
        kode_pemilik_id: '',
        tanggal_surat: '',
        status_tanggal: 'ondate',
        judul_surat: '',
        tujuan_surat: '',
        nama_pic_unit_pemohon: '',
        penandatangan_surat: '',
        keterangan: '',
    });

    const [fileDokumen, setFileDokumen] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        fetchMasterData();
    }, []);

    const fetchMasterData = async () => {
        try {
            setFetching(true);

            const [perihalData, pemilikData] = await Promise.all([
                apiGet('/kode-perihal'),
                apiGet('/kode-pemilik'),
            ]);

            setKodePerihals(
                perihalData.kode_perihals ||
                perihalData.data ||
                []
            );

            setKodePemiliks(
                pemilikData.kode_pemiliks ||
                pemilikData.data ||
                []
            );
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: getErrorMessage(error),
                confirmButtonColor: '#d71920',
            });
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0] || null;

        if (!file) {
            setFileDokumen(null);
            return;
        }

        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
        ];

        const maxSize = 5 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {
            Swal.fire({
                icon: 'warning',
                title: 'Format Tidak Didukung',
                text: 'File harus berformat PDF, DOC, DOCX, JPG, JPEG, atau PNG.',
                confirmButtonColor: '#d71920',
            });

            event.target.value = '';
            setFileDokumen(null);
            return;
        }

        if (file.size > maxSize) {
            Swal.fire({
                icon: 'warning',
                title: 'File Terlalu Besar',
                text: 'Ukuran file maksimal 5MB.',
                confirmButtonColor: '#d71920',
            });

            event.target.value = '';
            setFileDokumen(null);
            return;
        }

        setFileDokumen(file);
    };

    const resetForm = () => {
        setForm({
            kode_perihal_id: '',
            kode_pemilik_id: '',
            tanggal_surat: '',
            status_tanggal: 'ondate',
            judul_surat: '',
            tujuan_surat: '',
            nama_pic_unit_pemohon: '',
            penandatangan_surat: '',
            keterangan: '',
        });

        setFileDokumen(null);

        const fileInput = document.getElementById('file_dokumen');

        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);

        const payload = new FormData();

        payload.append('kode_perihal_id', form.kode_perihal_id);
        payload.append('kode_pemilik_id', form.kode_pemilik_id);
        payload.append('tanggal_surat', form.tanggal_surat);
        payload.append('status_tanggal', form.status_tanggal);
        payload.append('judul_surat', form.judul_surat);
        payload.append('tujuan_surat', form.tujuan_surat);
        payload.append('nama_pic_unit_pemohon', form.nama_pic_unit_pemohon);
        payload.append('penandatangan_surat', form.penandatangan_surat);
        payload.append('keterangan', form.keterangan || '');

        if (fileDokumen) {
            payload.append('file_dokumen', fileDokumen);
        }

        try {
            const data = await apiSendForm('/nomor-surat', 'POST', payload);

            resetForm();

            await Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: data.message || 'Pengajuan nomor surat berhasil dikirim.',
                confirmButtonColor: '#d71920',
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

    if (fetching) {
        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <p className="text-slate-500">Memuat form pengajuan...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center">
                                <FileText size={28} />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-slate-950">
                                    Ajukan Nomor Surat
                                </h2>

                                <p className="text-slate-500 mt-1">
                                    Lengkapi data pengajuan sesuai kebutuhan penomoran dan arsip surat keluar.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
                        <p className="text-sm text-blue-700 leading-relaxed">
                            Setelah disetujui SEKPiM, nomor surat akan muncul dan Anda dapat upload dokumen final dari dashboard atau riwayat pengajuan.
                        </p>
                    </div>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 space-y-7"
            >
                <div>
                    <h3 className="text-lg font-bold text-slate-950">
                        Data Kode Surat
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                        Pilih kode perihal dan kode pemilik sesuai kebutuhan surat.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Kode Perihal
                            </label>

                            <select
                                name="kode_perihal_id"
                                value={form.kode_perihal_id}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                            >
                                <option value="">Pilih kode perihal</option>

                                {kodePerihals.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.kode} - {item.nama_perihal || item.nama || item.perihal}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Kode Pemilik Proses
                            </label>

                            <select
                                name="kode_pemilik_id"
                                value={form.kode_pemilik_id}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                            >
                                <option value="">Pilih kode pemilik proses</option>

                                {kodePemiliks.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.kode} - {item.nama_pemilik || item.nama || item.unit}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-7">
                    <h3 className="text-lg font-bold text-slate-950">
                        Data Surat
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                        Data ini akan digunakan sebagai dasar pencatatan surat keluar dan export Excel.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Tanggal Surat
                            </label>

                            <div className="relative">
                                <Calendar
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="date"
                                    name="tanggal_surat"
                                    value={form.tanggal_surat}
                                    onChange={handleChange}
                                    className="w-full border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Status Tanggal
                            </label>

                            <select
                                name="status_tanggal"
                                value={form.status_tanggal}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-2xl px-4 py-3 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                required
                            >
                                <option value="ondate">On Date</option>
                                <option value="backdate">Back Date</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Perihal / Judul Surat
                            </label>

                            <input
                                type="text"
                                name="judul_surat"
                                value={form.judul_surat}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Contoh: Permohonan Peminjaman Ruangan"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Tujuan Surat
                            </label>

                            <input
                                type="text"
                                name="tujuan_surat"
                                value={form.tujuan_surat}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Contoh: Kepala Unit / Pihak Eksternal"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Nama PIC Unit Pemohon
                            </label>

                            <input
                                type="text"
                                name="nama_pic_unit_pemohon"
                                value={form.nama_pic_unit_pemohon}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Contoh: Ayodya Ganas Wasesa"
                                required
                            />

                            <p className="text-xs text-slate-400 mt-2">
                                Isi nama PIC atau penanggung jawab dari unit pemohon.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Penandatangan Surat / TTD
                            </label>

                            <input
                                type="text"
                                name="penandatangan_surat"
                                value={form.penandatangan_surat}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Contoh: Kepala Unit Sekretariat Pimpinan"
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-5">
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Keterangan
                        </label>

                        <textarea
                            name="keterangan"
                            value={form.keterangan}
                            onChange={handleChange}
                            rows="4"
                            className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                            placeholder="Tambahkan keterangan jika ada"
                        />
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-7">
                    <h3 className="text-lg font-bold text-slate-950">
                        Dokumen Pendukung
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                        Upload draft atau dokumen awal jika tersedia.
                    </p>

                    <div className="mt-5 border-2 border-dashed border-slate-200 rounded-3xl p-6 bg-slate-50">
                        <label
                            htmlFor="file_dokumen"
                            className="cursor-pointer flex flex-col items-center justify-center text-center"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white text-red-700 flex items-center justify-center shadow-sm">
                                <Upload size={26} />
                            </div>

                            <p className="font-bold text-slate-800 mt-4">
                                Klik untuk upload dokumen awal
                            </p>

                            <p className="text-sm text-slate-500 mt-1">
                                PDF, DOC, DOCX, JPG, JPEG, PNG. Maksimal 5MB.
                            </p>

                            {fileDokumen ? (
                                <p className="text-sm font-semibold text-green-700 mt-3">
                                    File dipilih: {fileDokumen.name}
                                </p>
                            ) : null}
                        </label>

                        <input
                            id="file_dokumen"
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-sm text-slate-500">
                        Pastikan data sudah benar sebelum dikirim ke SEKPiM.
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={resetForm}
                            disabled={loading}
                            className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition disabled:opacity-60"
                        >
                            Reset
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#d71920] hover:bg-[#bd1118] text-white font-bold transition disabled:bg-red-300"
                        >
                            <Send size={18} />
                            {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default AjukanNomorSuratPage;
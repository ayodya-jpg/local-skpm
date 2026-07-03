import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import {
    Calendar,
    CheckCircle,
    ChevronRight,
    FileText,
    Info,
    Paperclip,
    Send,
    Sparkles,
    Upload,
    UserRound,
    X,
} from 'lucide-react';

import { apiGet, apiSendForm, getErrorMessage } from '../services/api';

function AjukanNomorSuratPage() {
    const today = new Date().toISOString().slice(0, 10);

    const [user, setUser] = useState(null);
    const [kodePerihals, setKodePerihals] = useState([]);
    const [kodePemiliks, setKodePemiliks] = useState([]);

    const [form, setForm] = useState({
        kode_perihal_id: '',
        kode_pemilik_id: '',
        tanggal_surat: today,
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
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setFetching(true);

            const [userData, perihalData, pemilikData] = await Promise.all([
                apiGet('/me'),
                apiGet('/kode-perihal'),
                apiGet('/kode-pemilik'),
            ]);

            const currentUser = userData.user;
            const perihals = perihalData.kode_perihals || perihalData.data || [];
            const pemiliks = pemilikData.kode_pemiliks || pemilikData.data || [];

            setUser(currentUser);
            setKodePerihals(perihals);
            setKodePemiliks(pemiliks);

            const ownKodePemilik = pemiliks.find((item) => {
                return String(item.unit || '').toLowerCase() === String(currentUser?.unit || '').toLowerCase();
            });

            setForm((previous) => ({
                ...previous,
                nama_pic_unit_pemohon: currentUser?.name || '',
                kode_pemilik_id: ownKodePemilik?.id ? String(ownKodePemilik.id) : previous.kode_pemilik_id,
            }));
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

    const selectedKodePerihal = useMemo(() => {
        return kodePerihals.find((item) => String(item.id) === String(form.kode_perihal_id));
    }, [kodePerihals, form.kode_perihal_id]);

    const selectedKodePemilik = useMemo(() => {
        return kodePemiliks.find((item) => String(item.id) === String(form.kode_pemilik_id));
    }, [kodePemiliks, form.kode_pemilik_id]);

    const completedFields = useMemo(() => {
        const fields = [
            form.kode_perihal_id,
            form.kode_pemilik_id,
            form.tanggal_surat,
            form.status_tanggal,
            form.judul_surat,
            form.tujuan_surat,
            form.nama_pic_unit_pemohon,
            form.penandatangan_surat,
        ];

        return fields.filter(Boolean).length;
    }, [form]);

    const progress = Math.round((completedFields / 8) * 100);

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

        const allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const maxSize = 5 * 1024 * 1024;

        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
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

    const removeFile = () => {
        setFileDokumen(null);

        const input = document.getElementById('file_dokumen');

        if (input) {
            input.value = '';
        }
    };

    const resetForm = () => {
        const ownKodePemilik = kodePemiliks.find((item) => {
            return String(item.unit || '').toLowerCase() === String(user?.unit || '').toLowerCase();
        });

        setForm({
            kode_perihal_id: '',
            kode_pemilik_id: ownKodePemilik?.id ? String(ownKodePemilik.id) : '',
            tanggal_surat: today,
            status_tanggal: 'ondate',
            judul_surat: '',
            tujuan_surat: '',
            nama_pic_unit_pemohon: user?.name || '',
            penandatangan_surat: '',
            keterangan: '',
        });

        removeFile();
    };

    const validateForm = () => {
        if (!form.kode_perihal_id) return 'Kode perihal wajib dipilih.';
        if (!form.kode_pemilik_id) return 'Kode pemilik proses wajib dipilih.';
        if (!form.tanggal_surat) return 'Tanggal surat wajib diisi.';
        if (!form.status_tanggal) return 'Status tanggal wajib dipilih.';
        if (!form.judul_surat) return 'Perihal atau judul surat wajib diisi.';
        if (!form.tujuan_surat) return 'Tujuan surat wajib diisi.';
        if (!form.nama_pic_unit_pemohon) return 'Nama PIC unit pemohon wajib diisi.';
        if (!form.penandatangan_surat) return 'Penandatangan surat wajib diisi.';

        return null;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationMessage = validateForm();

        if (validationMessage) {
            Swal.fire({
                icon: 'warning',
                title: 'Data Belum Lengkap',
                text: validationMessage,
                confirmButtonColor: '#d71920',
            });

            return;
        }

        const confirmation = await Swal.fire({
            icon: 'question',
            title: 'Kirim Pengajuan?',
            html: `
                <div style="text-align:left">
                    <p>Pastikan data pengajuan sudah benar sebelum dikirim ke SEKPiM.</p>
                    <br/>
                    <b>Perihal:</b> ${form.judul_surat}<br/>
                    <b>PIC:</b> ${form.nama_pic_unit_pemohon}<br/>
                    <b>Tanggal:</b> ${form.tanggal_surat}
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Ya, Kirim',
            cancelButtonText: 'Cek Lagi',
            confirmButtonColor: '#d71920',
            cancelButtonColor: '#64748b',
        });

        if (!confirmation.isConfirmed) return;

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
                title: 'Pengajuan Berhasil Dikirim',
                text: data.message || 'Pengajuan nomor surat berhasil dikirim dan menunggu proses SEKPiM.',
                confirmButtonColor: '#d71920',
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal Mengirim Pengajuan',
                text: getErrorMessage(error),
                confirmButtonColor: '#d71920',
            });
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (size) => {
        if (!size) return '-';

        if (size < 1024 * 1024) {
            return `${Math.round(size / 1024)} KB`;
        }

        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    };

    if (fetching) {
        return <FormSkeleton />;
    }

    return (
        <div className="space-y-7 no-scrollbar">
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#d71920] via-[#a90f1b] to-[#210711] text-white shadow-xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.24),_transparent_32%)]"></div>
                <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

                <div className="relative p-6 md:p-8">
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-black">
                                <Sparkles size={14} />
                                Form Pengajuan Nomor Surat
                            </div>

                            <h2 className="text-2xl md:text-4xl font-black tracking-tight mt-5">
                                Ajukan Nomor Surat dengan Lebih Mudah
                            </h2>

                            <p className="text-white/75 mt-3 max-w-2xl leading-relaxed">
                                Lengkapi data surat, PIC, penandatangan, dan dokumen pendukung. Setelah dikirim, SEKPiM akan melakukan pengecekan dan approval nomor surat.
                            </p>
                        </div>

                        <div className="bg-white/10 border border-white/15 rounded-[28px] p-5 min-w-[260px] backdrop-blur-xl">
                            <p className="text-sm text-white/70 font-semibold">
                                Kelengkapan Form
                            </p>

                            <div className="flex items-end gap-2 mt-2">
                                <h3 className="text-5xl font-black">
                                    {progress}%
                                </h3>

                                <p className="text-sm text-white/60 mb-2">
                                    lengkap
                                </p>
                            </div>

                            <div className="h-3 bg-white/15 rounded-full overflow-hidden mt-4">
                                <div
                                    className="h-full bg-white rounded-full transition-all"
                                    style={{
                                        width: `${progress}%`,
                                    }}
                                />
                            </div>

                            <p className="text-xs text-white/60 mt-3">
                                {completedFields} dari 8 field wajib sudah terisi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
                <div className="space-y-6">
                    <SectionCard
                        step="01"
                        title="Data Kode Surat"
                        description="Pilih kode perihal dan kode pemilik proses agar format nomor surat dapat dibuat otomatis."
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FieldGroup
                                label="Kode Perihal"
                                required
                                helper="Digunakan sebagai bagian kode dalam nomor surat."
                            >
                                <select
                                    name="kode_perihal_id"
                                    value={form.kode_perihal_id}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                >
                                    <option value="">Pilih kode perihal</option>

                                    {kodePerihals.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.kode} - {item.nama_perihal || item.nama || item.perihal}
                                        </option>
                                    ))}
                                </select>
                            </FieldGroup>

                            <FieldGroup
                                label="Kode Pemilik Proses"
                                required
                                helper="Biasanya mengikuti unit pemohon."
                            >
                                <select
                                    name="kode_pemilik_id"
                                    value={form.kode_pemilik_id}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                >
                                    <option value="">Pilih kode pemilik proses</option>

                                    {kodePemiliks.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.kode} - {item.nama_pemilik || item.nama || item.unit}
                                        </option>
                                    ))}
                                </select>
                            </FieldGroup>
                        </div>

                        {(selectedKodePerihal || selectedKodePemilik) ? (
                            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <PreviewBox
                                    label="Kode Perihal Terpilih"
                                    value={
                                        selectedKodePerihal
                                            ? `${selectedKodePerihal.kode} - ${selectedKodePerihal.nama_perihal || selectedKodePerihal.nama || '-'}`
                                            : '-'
                                    }
                                />

                                <PreviewBox
                                    label="Kode Pemilik Terpilih"
                                    value={
                                        selectedKodePemilik
                                            ? `${selectedKodePemilik.kode} - ${selectedKodePemilik.nama_pemilik || selectedKodePemilik.unit || '-'}`
                                            : '-'
                                    }
                                />
                            </div>
                        ) : null}
                    </SectionCard>

                    <SectionCard
                        step="02"
                        title="Data Surat"
                        description="Isi informasi utama surat yang akan digunakan untuk pencatatan dan laporan surat keluar."
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FieldGroup label="Tanggal Surat" required>
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
                                        className="form-control pl-11"
                                        required
                                    />
                                </div>
                            </FieldGroup>

                            <FieldGroup
                                label="Status Tanggal"
                                required
                                helper="Gunakan Back Date jika tanggal surat mundur dari tanggal pengajuan."
                            >
                                <select
                                    name="status_tanggal"
                                    value={form.status_tanggal}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                >
                                    <option value="ondate">On Date</option>
                                    <option value="backdate">Back Date</option>
                                </select>
                            </FieldGroup>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                            <FieldGroup label="Perihal / Judul Surat" required>
                                <input
                                    type="text"
                                    name="judul_surat"
                                    value={form.judul_surat}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="Contoh: Permohonan Peminjaman Ruangan"
                                    required
                                />
                            </FieldGroup>

                            <FieldGroup label="Tujuan Surat" required>
                                <input
                                    type="text"
                                    name="tujuan_surat"
                                    value={form.tujuan_surat}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="Contoh: Kepala Unit / Pihak Eksternal"
                                    required
                                />
                            </FieldGroup>
                        </div>

                        <div className="mt-5">
                            <FieldGroup label="Keterangan">
                                <textarea
                                    name="keterangan"
                                    value={form.keterangan}
                                    onChange={handleChange}
                                    rows="4"
                                    className="form-control resize-none"
                                    placeholder="Tambahkan keterangan jika ada"
                                />
                            </FieldGroup>
                        </div>
                    </SectionCard>

                    <SectionCard
                        step="03"
                        title="Penanggung Jawab"
                        description="Pastikan PIC dan penandatangan sudah sesuai dengan surat yang diajukan."
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FieldGroup
                                label="Nama PIC Unit Pemohon"
                                required
                                helper="Otomatis dari akun login, tetapi tetap bisa diedit."
                            >
                                <div className="relative">
                                    <UserRound
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="text"
                                        name="nama_pic_unit_pemohon"
                                        value={form.nama_pic_unit_pemohon}
                                        onChange={handleChange}
                                        className="form-control pl-11"
                                        placeholder="Contoh: Ayodya Ganas Wasesa"
                                        required
                                    />
                                </div>
                            </FieldGroup>

                            <FieldGroup label="Penandatangan Surat / TTD" required>
                                <input
                                    type="text"
                                    name="penandatangan_surat"
                                    value={form.penandatangan_surat}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="Contoh: Kepala Unit Sekretariat Pimpinan"
                                    required
                                />
                            </FieldGroup>
                        </div>
                    </SectionCard>

                    <SectionCard
                        step="04"
                        title="Dokumen Pendukung"
                        description="Upload draft atau dokumen awal jika sudah tersedia."
                    >
                        <div className="border-2 border-dashed border-slate-200 rounded-[28px] p-6 bg-slate-50 hover:bg-slate-100/70 transition">
                            {!fileDokumen ? (
                                <label
                                    htmlFor="file_dokumen"
                                    className="cursor-pointer flex flex-col items-center justify-center text-center"
                                >
                                    <div className="w-16 h-16 rounded-3xl bg-white text-red-700 flex items-center justify-center shadow-sm">
                                        <Upload size={30} />
                                    </div>

                                    <p className="font-black text-slate-900 mt-4">
                                        Klik untuk upload dokumen awal
                                    </p>

                                    <p className="text-sm text-slate-500 mt-1">
                                        PDF, DOC, DOCX, JPG, JPEG, PNG. Maksimal 5MB.
                                    </p>
                                </label>
                            ) : (
                                <div className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                                            <Paperclip size={22} />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="font-black text-slate-900 truncate">
                                                {fileDokumen.name}
                                            </p>

                                            <p className="text-sm text-slate-500">
                                                {formatFileSize(fileDokumen.size)}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-black transition"
                                    >
                                        <X size={16} />
                                        Hapus
                                    </button>
                                </div>
                            )}

                            <input
                                id="file_dokumen"
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    </SectionCard>
                </div>

                <aside className="space-y-5">
                    <div className="bg-white/90 backdrop-blur-xl border border-white shadow-sm rounded-[28px] p-5 sticky top-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center">
                                <FileText size={25} />
                            </div>

                            <div>
                                <h3 className="font-black text-slate-950">
                                    Ringkasan Pengajuan
                                </h3>

                                <p className="text-sm text-slate-500">
                                    Cek sebelum dikirim
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            <SummaryItem
                                label="Perihal"
                                value={form.judul_surat || '-'}
                            />

                            <SummaryItem
                                label="Tujuan"
                                value={form.tujuan_surat || '-'}
                            />

                            <SummaryItem
                                label="PIC"
                                value={form.nama_pic_unit_pemohon || '-'}
                            />

                            <SummaryItem
                                label="Tanggal"
                                value={form.tanggal_surat || '-'}
                            />

                            <SummaryItem
                                label="Status Tanggal"
                                value={form.status_tanggal === 'backdate' ? 'Back Date' : 'On Date'}
                            />

                            <SummaryItem
                                label="Kode Perihal"
                                value={selectedKodePerihal?.kode || '-'}
                            />

                            <SummaryItem
                                label="Kode Pemilik"
                                value={selectedKodePemilik?.kode || '-'}
                            />

                            <SummaryItem
                                label="Dokumen"
                                value={fileDokumen ? fileDokumen.name : 'Belum ada'}
                            />
                        </div>

                        <div className="mt-5 bg-slate-50 border border-slate-100 rounded-3xl p-4">
                            <div className="flex items-start gap-3">
                                <Info size={18} className="text-blue-600 mt-0.5 shrink-0" />

                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Setelah dikirim, pengajuan akan masuk ke SEKPiM untuk dicek dan diberi nomor surat.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#d71920] hover:bg-[#bd1118] text-white font-black transition disabled:bg-red-300"
                            >
                                <Send size={18} />
                                {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
                            </button>

                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={loading}
                                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black transition disabled:opacity-60"
                            >
                                Reset Form
                            </button>
                        </div>
                    </div>
                </aside>
            </form>
        </div>
    );
}

function SectionCard({ step, title, description, children }) {
    return (
        <div className="bg-white/90 backdrop-blur-xl border border-white shadow-sm rounded-[28px] p-5 md:p-6">
            <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center font-black shrink-0">
                    {step}
                </div>

                <div>
                    <h3 className="text-lg font-black text-slate-950">
                        {title}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>

            {children}
        </div>
    );
}

function FieldGroup({ label, required = false, helper, children }) {
    return (
        <div>
            <label className="block text-sm font-black text-slate-700 mb-2">
                {label}
                {required ? <span className="text-red-600 ml-1">*</span> : null}
            </label>

            {children}

            {helper ? (
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {helper}
                </p>
            ) : null}
        </div>
    );
}

function PreviewBox({ label, value }) {
    return (
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-4">
            <p className="text-xs font-black text-slate-500 uppercase tracking-wide">
                {label}
            </p>

            <p className="text-sm font-black text-slate-900 mt-2">
                {value}
            </p>
        </div>
    );
}

function SummaryItem({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
            <p className="text-sm text-slate-500">
                {label}
            </p>

            <p className="text-sm font-black text-slate-900 text-right max-w-[190px] truncate">
                {value || '-'}
            </p>
        </div>
    );
}

function FormSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-64 bg-white rounded-[32px]"></div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
                <div className="space-y-6">
                    <div className="h-52 bg-white rounded-[28px]"></div>
                    <div className="h-80 bg-white rounded-[28px]"></div>
                    <div className="h-56 bg-white rounded-[28px]"></div>
                </div>

                <div className="h-96 bg-white rounded-[28px]"></div>
            </div>
        </div>
    );
}

export default AjukanNomorSuratPage;
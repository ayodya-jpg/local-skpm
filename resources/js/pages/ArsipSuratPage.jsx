import React from 'react';
import {
    Archive,
    FileText,
    Search,
} from 'lucide-react';

function ArsipSuratPage() {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                            <Archive size={30} />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-slate-950">
                                Arsip Surat
                            </h2>

                            <p className="text-slate-500 mt-1">
                                Halaman arsip surat keluar, surat masuk, dan dokumen legal.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <SummaryCard
                    title="Surat Keluar"
                    value="0"
                    description="Arsip surat keluar yang sudah selesai"
                />

                <SummaryCard
                    title="Surat Masuk"
                    value="0"
                    description="Arsip surat masuk yang tercatat"
                />

                <SummaryCard
                    title="Dokumen Legal"
                    value="0"
                    description="Arsip dokumen legal dan keputusan"
                />
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-2 mb-5">
                    <Search size={18} className="text-slate-400" />

                    <h3 className="text-lg font-bold text-slate-950">
                        Pencarian Arsip
                    </h3>
                </div>

                <div className="border border-dashed border-slate-200 rounded-3xl p-8 text-center bg-slate-50">
                    <FileText size={48} className="mx-auto text-slate-300" />

                    <h4 className="text-lg font-bold text-slate-800 mt-4">
                        Modul Arsip Belum Diaktifkan
                    </h4>

                    <p className="text-slate-500 mt-2 max-w-xl mx-auto leading-relaxed">
                        Halaman ini sudah disiapkan sebagai tempat arsip. Setelah export laporan surat keluar selesai,
                        modul ini akan kita lanjutkan agar data surat yang sudah berstatus selesai otomatis masuk ke arsip.
                    </p>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ title, value, description }) {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-slate-500">
                        {title}
                    </p>

                    <h3 className="text-3xl font-bold text-slate-950 mt-2">
                        {value}
                    </h3>

                    <p className="text-sm text-slate-500 mt-2">
                        {description}
                    </p>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Archive size={25} />
                </div>
            </div>
        </div>
    );
}

export default ArsipSuratPage;
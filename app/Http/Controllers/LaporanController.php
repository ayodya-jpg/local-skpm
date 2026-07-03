<?php

namespace App\Http\Controllers;

use App\Models\NomorSuratRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Cell\DataType;

class LaporanController extends Controller
{
    public function nomorSurat(Request $request)
    {
        $query = $this->baseQuery($request);

        return response()->json([
            'data' => $query->latest()->get(),
        ]);
    }

    public function suratKeluarData(Request $request)
    {
        $query = $this->baseQuery($request);

        $data = $query
            ->orderBy('tahun')
            ->orderBy('nomor_urut')
            ->get()
            ->map(function ($item) {
                return $this->formatRow($item);
            })
            ->values();

        return response()->json([
            'data' => $data,
        ]);
    }

    public function exportSuratKeluarExcel(Request $request)
    {
        $query = $this->baseQuery($request);

        $items = $query
            ->orderBy('tahun')
            ->orderBy('nomor_urut')
            ->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $sheet->setTitle('Surat Keluar');

        $bulan = $request->bulan && $request->bulan !== 'all'
            ? $this->namaBulan((int) $request->bulan)
            : 'Semua Bulan';

        $tahun = $request->tahun && $request->tahun !== 'all'
            ? $request->tahun
            : 'Semua Tahun';

        $unit = $request->unit && $request->unit !== 'all'
            ? strtoupper($request->unit)
            : 'Semua Unit';

        /*
        |--------------------------------------------------------------------------
        | Judul Laporan
        |--------------------------------------------------------------------------
        */
        $sheet->mergeCells('A1:O1');
        $sheet->setCellValue('A1', 'LAPORAN SURAT KELUAR');

        $sheet->mergeCells('A2:O2');
        $sheet->setCellValue('A2', 'Sistem Kearsipan, Surat-Menyurat, dan Legal SEKPiM');

        $sheet->setCellValue('A4', 'Bulan');
        $sheet->setCellValue('B4', $bulan);

        $sheet->setCellValue('A5', 'Tahun');
        $sheet->setCellValue('B5', $tahun);

        $sheet->setCellValue('A6', 'Unit');
        $sheet->setCellValue('B6', $unit);

        $sheet->setCellValue('A7', 'Diekspor Pada');
        $sheet->setCellValue('B7', now()->format('d/m/Y H:i:s'));

        /*
        |--------------------------------------------------------------------------
        | Header Tabel
        |--------------------------------------------------------------------------
        */
        $headers = [
            'No',
            'Bulan',
            'Tahun',
            'Nomor Urut',
            'Kode Perihal',
            'Kode Pemilik Proses',
            'Nama PIC Unit Pemohon',
            'No. Surat',
            'Perihal',
            'Tanggal Pengajuan',
            'Penandatangan Surat / TTD',
            'Status',
            'Status Tanggal',
            'Keterangan',
            'Link Dokumen',
        ];

        $headerRow = 9;
        $column = 'A';

        foreach ($headers as $header) {
            $sheet->setCellValue($column . $headerRow, $header);
            $column++;
        }

        /*
        |--------------------------------------------------------------------------
        | Isi Data
        |--------------------------------------------------------------------------
        */
        $rowNumber = 10;

        foreach ($items as $index => $item) {
            $row = $this->formatRow($item);

            $sheet->setCellValueExplicit('A' . $rowNumber, (string) ($index + 1), DataType::TYPE_STRING);
            $sheet->setCellValueExplicit('B' . $rowNumber, (string) $row['bulan'], DataType::TYPE_STRING);
            $sheet->setCellValueExplicit('C' . $rowNumber, (string) $row['tahun'], DataType::TYPE_STRING);
            $sheet->setCellValueExplicit('D' . $rowNumber, (string) $row['nomor_urut'], DataType::TYPE_STRING);
            $sheet->setCellValueExplicit('E' . $rowNumber, (string) $row['kode_perihal'], DataType::TYPE_STRING);
            $sheet->setCellValueExplicit('F' . $rowNumber, (string) $row['kode_pemilik_proses'], DataType::TYPE_STRING);
            $sheet->setCellValueExplicit('G' . $rowNumber, (string) $row['nama_pic_unit_pemohon'], DataType::TYPE_STRING);
            $sheet->setCellValueExplicit('H' . $rowNumber, (string) $row['nomor_surat'], DataType::TYPE_STRING);
            $sheet->setCellValueExplicit('I' . $rowNumber, (string) $row['perihal'], DataType::TYPE_STRING);
            $sheet->setCellValueExplicit('J' . $rowNumber, (string) $row['tanggal_pengajuan'], DataType::TYPE_STRING);
            $sheet->setCellValueExplicit('K' . $rowNumber, (string) $row['penandatangan_surat'], DataType::TYPE_STRING);
            $sheet->setCellValueExplicit('L' . $rowNumber, (string) $row['status'], DataType::TYPE_STRING);
            $sheet->setCellValueExplicit('M' . $rowNumber, (string) $row['status_tanggal'], DataType::TYPE_STRING);
            $sheet->setCellValueExplicit('N' . $rowNumber, (string) $row['keterangan'], DataType::TYPE_STRING);
            $sheet->setCellValueExplicit('O' . $rowNumber, (string) $row['link_dokumen'], DataType::TYPE_STRING);

            if ($row['link_dokumen'] !== '-') {
                $sheet->getCell('O' . $rowNumber)->getHyperlink()->setUrl($row['link_dokumen']);
                $sheet->getStyle('O' . $rowNumber)->getFont()->getColor()->setARGB('FF0563C1');
                $sheet->getStyle('O' . $rowNumber)->getFont()->setUnderline(true);
            }

            $rowNumber++;
        }

        if ($items->count() === 0) {
            $sheet->mergeCells('A10:O10');
            $sheet->setCellValue('A10', 'Tidak ada data.');
            $sheet->getStyle('A10')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $rowNumber = 11;
        }

        /*
        |--------------------------------------------------------------------------
        | Styling
        |--------------------------------------------------------------------------
        */
        $lastRow = max($rowNumber - 1, 10);

        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->getStyle('A2')->getFont()->setSize(11);
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->getStyle('A4:A7')->getFont()->setBold(true);

        $sheet->getStyle('A9:O9')->getFont()->setBold(true)->getColor()->setARGB('FFFFFFFF');
        $sheet->getStyle('A9:O9')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFD71920');
        $sheet->getStyle('A9:O9')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('A9:O9')->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);

        $sheet->getStyle('A9:O' . $lastRow)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
        $sheet->getStyle('A9:O' . $lastRow)->getAlignment()->setVertical(Alignment::VERTICAL_TOP);
        $sheet->getStyle('A9:O' . $lastRow)->getAlignment()->setWrapText(true);

        $sheet->getStyle('A10:A' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('C10:D' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('J10:J' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->getRowDimension(1)->setRowHeight(24);
        $sheet->getRowDimension(2)->setRowHeight(20);
        $sheet->getRowDimension(9)->setRowHeight(34);

        $widths = [
            'A' => 6,
            'B' => 14,
            'C' => 10,
            'D' => 12,
            'E' => 16,
            'F' => 20,
            'G' => 26,
            'H' => 28,
            'I' => 34,
            'J' => 18,
            'K' => 28,
            'L' => 24,
            'M' => 16,
            'N' => 35,
            'O' => 48,
        ];

        foreach ($widths as $col => $width) {
            $sheet->getColumnDimension($col)->setWidth($width);
        }

        $sheet->freezePane('A10');
        $sheet->setAutoFilter('A9:O9');

        /*
        |--------------------------------------------------------------------------
        | Output File
        |--------------------------------------------------------------------------
        */
        $fileName = 'laporan-surat-keluar-' . now()->format('Ymd-His') . '.xlsx';
        $tempFile = tempnam(sys_get_temp_dir(), 'laporan_surat_keluar_');

        $writer = new Xlsx($spreadsheet);
        $writer->save($tempFile);

        return response()->download($tempFile, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }

    private function baseQuery(Request $request)
    {
        $user = Auth::user();

        $query = NomorSuratRequest::with([
            'user:id,name,username,unit,email',
            'kodePerihal:id,kode,nama_perihal',
            'kodePemilik:id,kode,nama_pemilik,unit',
            'approvedBy:id,name,username,unit,email',
            'rejectedBy:id,name,username,unit,email',
            'revisionBy:id,name,username,unit,email',
            'completedBy:id,name,username,unit,email',
        ]);

        if ($user->unit !== 'sekpim') {
            $query->where('user_id', $user->id);
        }

        if ($request->bulan && $request->bulan !== 'all') {
            $query->whereMonth('tanggal_surat', $request->bulan);
        }

        if ($request->tahun && $request->tahun !== 'all') {
            $query->whereYear('tanggal_surat', $request->tahun);
        }

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->unit && $request->unit !== 'all' && $user->unit === 'sekpim') {
            $unit = $request->unit;

            $query->whereHas('user', function ($userQuery) use ($unit) {
                $userQuery->where('unit', $unit);
            });
        }

        if ($request->search) {
            $keyword = $request->search;

            $query->where(function ($searchQuery) use ($keyword) {
                $searchQuery
                    ->where('judul_surat', 'like', '%' . $keyword . '%')
                    ->orWhere('nomor_surat', 'like', '%' . $keyword . '%')
                    ->orWhere('tujuan_surat', 'like', '%' . $keyword . '%')
                    ->orWhere('nama_pic_unit_pemohon', 'like', '%' . $keyword . '%')
                    ->orWhere('penandatangan_surat', 'like', '%' . $keyword . '%')
                    ->orWhere('keterangan', 'like', '%' . $keyword . '%')
                    ->orWhereHas('user', function ($userQuery) use ($keyword) {
                        $userQuery
                            ->where('name', 'like', '%' . $keyword . '%')
                            ->orWhere('unit', 'like', '%' . $keyword . '%');
                    });
            });
        }

        return $query;
    }

    private function formatRow(NomorSuratRequest $item): array
    {
        $tanggalSurat = $item->tanggal_surat
            ? $item->tanggal_surat->format('d/m/Y')
            : '-';

        $bulan = $item->tanggal_surat
            ? $this->namaBulan((int) $item->tanggal_surat->format('m'))
            : '-';

        $tahun = $item->tahun ?: (
            $item->tanggal_surat
                ? $item->tanggal_surat->format('Y')
                : '-'
        );

        $linkDokumen = '-';

        if ($item->file_dokumen_final) {
            $linkDokumen = url('/nomor-surat/' . $item->id . '/preview-final');
        } elseif ($item->file_dokumen) {
            $linkDokumen = url('/nomor-surat/' . $item->id . '/preview-awal');
        }

        return [
            'bulan' => $bulan,
            'tahun' => $tahun,
            'nomor_urut' => $item->nomor_urut ?: '-',
            'kode_perihal' => optional($item->kodePerihal)->kode ?: '-',
            'kode_pemilik_proses' => optional($item->kodePemilik)->kode ?: '-',
            'nama_pic_unit_pemohon' => $item->nama_pic_unit_pemohon ?: optional($item->user)->name ?: '-',
            'nomor_surat' => $item->nomor_surat ?: '-',
            'perihal' => $item->judul_surat ?: '-',
            'tanggal_pengajuan' => $tanggalSurat,
            'penandatangan_surat' => $item->penandatangan_surat ?: '-',
            'status' => $this->formatStatus($item->status),
            'status_tanggal' => $this->formatStatusTanggal($item->status_tanggal),
            'keterangan' => $item->keterangan ?: '-',
            'link_dokumen' => $linkDokumen,
        ];
    }

    private function formatStatus(?string $status): string
    {
        return match ($status) {
            'pending' => 'Diajukan',
            'approved' => 'Nomor Disetujui',
            'final_submitted' => 'Menunggu Verifikasi Final',
            'revision' => 'Perlu Revisi Final',
            'completed' => 'Selesai / Closed',
            'rejected' => 'Ditolak',
            default => $status ?: '-',
        };
    }

    private function formatStatusTanggal(?string $statusTanggal): string
    {
        return match ($statusTanggal) {
            'ondate' => 'On Date',
            'backdate' => 'Back Date',
            default => '-',
        };
    }

    private function namaBulan(int $bulan): string
    {
        $namaBulan = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember',
        ];

        return $namaBulan[$bulan] ?? '-';
    }
}
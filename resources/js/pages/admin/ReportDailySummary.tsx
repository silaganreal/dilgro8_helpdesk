// resources/js/Components/ReportDailySummary.tsx
import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // if you have Input component; otherwise use <input>
import { usePage } from "@inertiajs/react";
import { showNotification } from '@/utils/notif';

type SummaryRow = {
  date: string;
  count: number;
};

const TITLE = "ICT Technical Assistance Process Summary Logsheet"; // from your uploaded file
const DOCUMENT_CODE = "FM-QP-DILG-ISTMS-RO-17-03"; // optional; adjust if needed

export default function ReportDailySummary() {
  const { auth } = usePage().props as any;
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchSummary = async (from: string, to: string): Promise<SummaryRow[]> => {
    const params = new URLSearchParams({ from, to });
    const url = `/reports/daily-summary?${params.toString()}`;
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Server error: ${res.status} ${text}`);
    }
    const json = await res.json();
    return json as SummaryRow[];
  };

  const buildExcelAndDownload = async (rows: SummaryRow[]) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Summary");

    // Column widths
    worksheet.columns = [
      { width: 20 }, // Date
      { width: 20 }, // Count
    ];

    // Try to add logo if available (graceful fallback)
    try {
      const logoResp = await fetch("/dilg-logo.png");
      if (logoResp.ok) {
        const blob = await logoResp.blob();
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.readAsArrayBuffer(blob);
        });
        const imageId = workbook.addImage({ buffer: arrayBuffer, extension: "png" });
        worksheet.addImage(imageId, {
          tl: { col: 0.2, row: 0 },
          ext: { width: 80, height: 80 },
        });
      }
    } catch (e) {
      // ignore logo errors
    }

    // Header / Title area (mimic other report)
    worksheet.mergeCells("C1:D1");
    worksheet.getCell("C1").value = "Document Code";
    worksheet.getCell("C1").font = { bold: true };
    worksheet.mergeCells("C2:D2");
    worksheet.getCell("C2").value = DOCUMENT_CODE;
    worksheet.getCell("C2").font = { bold: true };

    worksheet.mergeCells("B3:C3");
    worksheet.getCell("B3").value = "Department of the Interior and Local Government";
    worksheet.getCell("B3").font = { size: 14 };

    worksheet.mergeCells("B4:D5");
    worksheet.getCell("B4").value = TITLE;
    worksheet.getCell("B4").font = { size: 18, bold: true };

    worksheet.addRow([]);
    worksheet.addRow([]); // small gap

    // Table header
    const headerRow = worksheet.addRow(["Finished Date", "No. of Requests"]);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      } as any;
    });

    // Data rows: rows already include all dates within range (including zeros)
    rows.forEach((r) => {
      const row = worksheet.addRow([r.date, r.count]);
      row.eachCell((cell) => {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        } as any;
      });
    });

    // Save file
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `ICT_TA_Summary_${fromDate}_to_${toDate}.xlsx`);
  };

  const handleGenerate = async () => {
    if (!fromDate || !toDate) {
      showNotification(auth, "Validation", "Please choose both From and To dates.");
      return;
    }
    setLoading(true);
    try {
      const rows = await fetchSummary(fromDate, toDate);
      await buildExcelAndDownload(rows);
      showNotification(auth, "Export ready", "Summary Excel was downloaded.");
    } catch (err: any) {
      console.error(err);
      showNotification(auth, "Export failed", err.message || "Could not generate report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex items-end gap-3">
        <div>
          <Label>From</Label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        <div>
          <Label>To</Label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        <div className="mt-6">
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Generate Summary Excel"}
          </Button>
        </div>
      </div>
    </div>
  );
}

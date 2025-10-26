// resources/js/Components/ProcessSummaryReport.tsx
import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { usePage } from "@inertiajs/react";
import { showNotification } from "@/utils/notif";

type SummaryRow = {
  date: string; // "YYYY-MM-DD"
  count: number;
};

const TITLE_LINES = [
  "DEPARTMENT OF THE INTERIOR AND LOCAL GOVERNMENT",
  "ICT TECHNICAL ASSISTANCE PROCESS SUMMARY LOGSHEET"
];

const DOCUMENT_CODE = "FM-QP-DILG-ISTMS-RO-17-03";
const REV_NO = "2";
const EFF_DATE = "03.01.23";
const QUALITY_OBJECTIVE = "(90%) within three (3) working days upon receipt of request or within agreed timeline";
const FREQUENCY = "Quarterly";
const CURRENT_PERIOD = "January 1, 2024 to present"; // static as requested

export default function ProcessSummaryReport() {
    const { auth } = usePage().props as any;
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const fetchSummary = async (from: string, to: string): Promise<SummaryRow[]> => {
        const params = new URLSearchParams({ from, to });
        const url = `/reports/daily-summary?${params.toString()}`;
        const res = await fetch(url, { credentials: "same-origin" });
        if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Server error: ${res.status} ${txt}`);
        }
        const json = (await res.json()) as SummaryRow[];
        return json;
    };

    const fmtLongDate = (isoDate: string) => {
        // convert YYYY-MM-DD to "Monday, April 01, 2024"
        const d = new Date(isoDate + "T00:00:00");
        const opt: Intl.DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "2-digit" };
        return d.toLocaleDateString(undefined, opt);
    };

    const buildExcelAndDownload = async (rows: SummaryRow[]) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Process Summary");

        // column widths
        worksheet.columns = [
            { width: 35 }, // A Date
            { width: 25 }, // B
            { width: 25 }, // C
            { width: 20 },  // D
            { width: 25 }, // E
            { width: 25 }, // F
            { width: 20 },  // G
        ];

        // --- LOGO ---
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
                worksheet.addImage(imageId, { tl: { col: 0.1, row: 1 }, ext: { width: 70, height: 70 } });
            }
        } catch {}

        // --- MAIN TITLE (B2:E5) ---
        worksheet.mergeCells("B3:E3");
        worksheet.getCell("B3").value = TITLE_LINES[0];
        worksheet.getCell("B3").font = { name: "Cambria", bold: true, size: 12 };

        worksheet.mergeCells("B4:D6");
        worksheet.getCell("B4").value = TITLE_LINES[1];
        worksheet.getCell("B4").font = { name: "Cambria", size: 18, bold: true };
        worksheet.getCell("B4").alignment = {
            horizontal: "left",   // or "left", depends on your layout
            vertical: "top",
            wrapText: true
        };

        // --- DOCUMENT CODE BOX (F2:G5) ---
        worksheet.mergeCells("F2:G2");
        worksheet.getCell("F2").value = "Document Code";
        worksheet.getCell("F2").font = { color: { argb: "FFFFFF" }, name: "Cambria", bold: true };
        worksheet.getCell("F2").alignment = { horizontal: "left", vertical: "middle" };
        worksheet.getCell("F2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "000000" } };
        worksheet.getCell("F2").border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        worksheet.mergeCells("F3:G3");
        worksheet.getCell("F3").value = DOCUMENT_CODE;
        worksheet.getCell("F3").font = { name: "Cambria", bold: true };
        worksheet.getCell("F3").alignment = { horizontal: "center", vertical: "middle" };
        worksheet.getCell("F3").border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        worksheet.getCell("F4").value = "Rev No.";
        worksheet.getCell("F4").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF000000" }};
        worksheet.getCell("F4").font = { name: "Cambria", bold: true, color: { argb: "FFFFFFFF" }};
        worksheet.getCell("F4").alignment = { horizontal: "center", vertical: "middle" };
        worksheet.getCell("F4").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "000000" } };
        worksheet.getCell("F4").border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        worksheet.getCell("G4").value = "Eff. Date";
        worksheet.getCell("G4").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF000000" }};
        worksheet.getCell("G4").font = { name: "Cambria", bold: true, color: { argb: "FFFFFFFF" }};
        worksheet.getCell("G4").alignment = { horizontal: "center", vertical: "middle" };
        worksheet.getCell("G4").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "000000" } };
        worksheet.getCell("G4").border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        worksheet.getCell("F5").value = REV_NO;
        worksheet.getCell("F5").alignment = { horizontal: "center", vertical: "middle" };
        worksheet.getCell("F5").border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        worksheet.getCell("G5").value = EFF_DATE;
        worksheet.getCell("G5").alignment = { horizontal: "center", vertical: "middle" };
        worksheet.getCell("G5").border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Quality Objective / Frequency / Current Period (rows 7-9 in visual)
        // Label in column A, value merged B:G (no overlaps)
        worksheet.getRow(7).height = 30;
        worksheet.mergeCells("A7:B7");
        worksheet.getCell("A7").value = "QUALITY OBJECTIVE:";
        worksheet.getCell("A7").font = { name: "Cambria", bold: true };
        worksheet.getCell("A7").alignment = { horizontal: "left", vertical: "bottom" };
        worksheet.getCell("A7").border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Merge the value area from B to G (no overlap with A)
        worksheet.mergeCells("C7:G7");
        worksheet.getCell("C7").value = QUALITY_OBJECTIVE;
        worksheet.getCell("C7").alignment = { horizontal: "left", vertical: "bottom" };
        worksheet.getCell("C7").border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Row 8: Frequency label and merged value B:G
        worksheet.mergeCells("A8:B8");
        worksheet.getCell("A8").value = "FREQUENCY OF MONITORING:";
        worksheet.getCell("A8").font = { name: "Cambria", bold: true };
        worksheet.getCell("A8").alignment = { horizontal: "left", vertical: "middle" };
        worksheet.getCell("A8").border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        worksheet.mergeCells("C8:G8");
        worksheet.getCell("C8").value = FREQUENCY;
        worksheet.getCell("C8").alignment = { horizontal: "left", vertical: "middle" };
        worksheet.getCell("C8").border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Row 9: Current period label and merged value B:G
        worksheet.mergeCells("A9:B9");
        worksheet.getCell("A9").value = "CURRENT PERIOD:";
        worksheet.getCell("A9").font = { name: "Cambria", bold: true };
        worksheet.getCell("A9").alignment = { horizontal: "left", vertical: "middle" };
        worksheet.getCell("A9").border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        worksheet.mergeCells("C9:G9");
        worksheet.getCell("C9").value = CURRENT_PERIOD;
        worksheet.getCell("C9").alignment = { horizontal: "left", vertical: "middle" };
        worksheet.getCell("C9").border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // --- ROW 10 (OBJECTIVES HEADER ROW) ---
        worksheet.mergeCells("A10:G10");
        worksheet.getCell("A10").value = ""; // fully blank row as per screenshot

        worksheet.mergeCells("C11:E11");
        worksheet.getCell("C11").value = "OBJECTIVE 1";
        worksheet.getCell("C11").alignment = { horizontal: "center", vertical: "middle" };
        worksheet.getCell("C11").font = { bold: true };
        worksheet.getCell("C11").border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        worksheet.mergeCells("F11:G11");
        worksheet.getCell("F11").value = "OBJECTIVE 2";
        worksheet.getCell("F11").alignment = { horizontal: "center", vertical: "middle" };
        worksheet.getCell("F11").font = { bold: true };
        worksheet.getCell("F11").border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // --- ROW 12 (TABLE HEADER) ---
        const headerRow = worksheet.addRow([
            "DATE",
            "TOTAL NUMBER OF REQUEST FOR TECHNICAL ASSISTANCE RECEIVED\n(A)",
            "TOTAL NUMBER OF TECHNICAL ASSISTANCE PROVISIONED WITHIN THREE (3) WORKING DAYS UPON RECEIPT OF REQUEST OR WITHIN AGREED TIMELINE\n(B)",
            "%\n(B/A)*100",
            "REMARKS\n(Indicate reason if % is < 90%)",
            "TOTAL NUMBER OF TECHNICAL ASSISTANCE WITH AN OVERALL QUALITY RATING OF 4.0 AND ABOVE\n(C)",
            "%\n(C/A)*100"
        ]);
        // headerRow.height = 26;
        headerRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            cell.border = { top: {style:"thin"}, left:{style:"thin"}, bottom:{style:"thin"}, right:{style:"thin"} };
        });

        // --- DATA ROWS (starting row 13) ---
        let dataStart = headerRow.number + 1;
        rows.forEach((r, i) => {
            const excelRow = worksheet.addRow([
                fmtLongDate(r.date),
                r.count,
                r.count,
                null,
                "",
                r.count,
                null
            ]);

            const rowIndex = excelRow.number;
            worksheet.getCell(`D${rowIndex}`).value = { formula: `IF(B${rowIndex}=0,0,C${rowIndex}/B${rowIndex})` };
            worksheet.getCell(`D${rowIndex}`).numFmt = "0%";

            worksheet.getCell(`G${rowIndex}`).value = { formula: `IF(B${rowIndex}=0,0,F${rowIndex}/B${rowIndex})` };
            worksheet.getCell(`G${rowIndex}`).numFmt = "0%";

            excelRow.eachCell((cell, col) => {
                cell.border = { top:{style:"thin"}, left:{style:"thin"}, bottom:{style:"thin"}, right:{style:"thin"} };
                cell.alignment = col === 1
                    ? { horizontal: "right", vertical: "middle" }
                    : { horizontal: "center", vertical: "middle" };
            });
        });

        // --- ADD TOTAL ROW --- //
        const lastRow = worksheet.lastRow!.number;
        const totalRowIndex = lastRow + 1;

        // Insert empty row first
        const totalRow = worksheet.addRow(["", 0, 0, null, "", 0, null]);

        // Compute column ranges
        const fromDataRow = dataStart;
        const toDataRow = lastRow;

        // SUM formulas
        worksheet.getCell(`B${totalRowIndex}`).value = { formula: `SUM(B${fromDataRow}:B${toDataRow})` };
        worksheet.getCell(`C${totalRowIndex}`).value = { formula: `SUM(C${fromDataRow}:C${toDataRow})` };
        worksheet.getCell(`F${totalRowIndex}`).value = { formula: `SUM(F${fromDataRow}:F${toDataRow})` };

        // Percentage formulas
        worksheet.getCell(`D${totalRowIndex}`).value = { formula: `IF(B${totalRowIndex}=0,0,C${totalRowIndex}/B${totalRowIndex})` };
        worksheet.getCell(`D${totalRowIndex}`).numFmt = "0%";

        worksheet.getCell(`G${totalRowIndex}`).value = { formula: `IF(B${totalRowIndex}=0,0,F${totalRowIndex}/B${totalRowIndex})` };
        worksheet.getCell(`G${totalRowIndex}`).numFmt = "0%";

        // Number formatting
        worksheet.getCell(`B${totalRowIndex}`).numFmt = "0";
        worksheet.getCell(`C${totalRowIndex}`).numFmt = "0";
        worksheet.getCell(`F${totalRowIndex}`).numFmt = "0";

        // Align + border
        totalRow.eachCell((cell, colNumber) => {
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            } as any;
        });

        // --- FREEZE and FILTER ---
        worksheet.views = [{ state: "frozen", ySplit: 12 }];
        worksheet.autoFilter = { from: "A12", to: `G${worksheet.lastRow?.number}` };

        // --- EXPORT FILE ---
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `ProcessSummary_Logsheet_${fromDate}_to_${toDate}.xlsx`);
    };

    const handleGenerate = async () => {
        if (!fromDate || !toDate) {
            showNotification(auth, "Validation", "Please choose both From and To dates.");
        return;
        }

        setLoading(true);
        try {
            const rows = await fetchSummary(fromDate, toDate);
            // rows are expected to already include every date in range (backend fills with 0)
            await buildExcelAndDownload(rows);
            showNotification(auth, "Export ready", "Process summary Excel has been downloaded.");
        } catch (err: any) {
            console.error(err);
            showNotification(auth, "Export failed", err.message || "Could not generate report.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center gap-3">
            <div className="flex gap-1 items-center">
                <Label className="text-gray-700 dark:text-gray-300">From</Label>
                <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="border p-2 rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
            </div>

            <div className="flex gap-1 items-center">
                <Label className="text-gray-700 dark:text-gray-300">To</Label>
                <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="border p-2 rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
            </div>

            <div className="">
                <Button
                    onClick={handleGenerate} disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {loading ? "Generating..." : "Summary Logsheet"}
                </Button>
            </div>
        </div>
    );
}

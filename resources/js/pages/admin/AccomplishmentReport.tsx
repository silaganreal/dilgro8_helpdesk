// resources/js/Components/AccomplishmentReport.tsx
import React, { useMemo, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { usePage } from "@inertiajs/react";
import { showNotification } from "@/utils/notif";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

type LogItem = {
  id?: number;
  problem_description?: string | null;
  created_at?: string | null; // ISO datetime
  finished_date?: string | null; // "YYYY-MM-DD" or similar
  finished_time?: string | null;
  status?: string | null;
  it_staff?: string | null;
  fname?: string | null;
  lname?: string | null;
  sec_div_unit?: string | null;
  agreed_date?: string | null;
  agreed_time?: string | null;
  remarks?: string | null;
};

export default function AccomplishmentReport() {
  const { auth, logs } = usePage().props as Record<string, unknown>;
  // logs is expected to be an object like { data: LogItem[] } or an array -- handle both
  const logsData: LogItem[] = Array.isArray(logs) ? logs : (logs?.data ?? []);

  const [fromDateAcc, setFromDateAcc] = useState<string>("");
  const [toDateAcc, setToDateAcc] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showAccomplishmentModal, setShowAccomplishmentModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string>("all");

  // derive staff list from logs
  const staffList = useMemo(() => {
    const s = new Set<string>();
    logsData.forEach((l) => {
      if (l.it_staff && l.it_staff.trim() !== "") s.add(l.it_staff);
    });
    return ["all", ...Array.from(s)];
  }, [logsData]);

  // helper: fetch logo buffer (public folder)
  const fetchLogoBuffer = async (): Promise<ArrayBuffer | null> => {
    try {
      const res = await fetch("/dilg-logo.png");
      if (!res.ok) return null;
      const blob = await res.blob();
      return await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });
    } catch {
      return null;
    }
  };

  const isFinished = (log: LogItem) => {
    if (log.status && typeof log.status === "string" && log.status.toLowerCase() === "finished") return true;
    if (log.finished_date && log.finished_date.toString().trim() !== "") return true;
    return false;
  };

  const formatDateShort = (d?: string | Date | null) => {
    if (!d) return "-";
    const dt = typeof d === "string" ? new Date(d) : d;
    if (isNaN(dt.getTime())) return "-";
    const day = dt.getDate();
    const month = dt.toLocaleString("default", { month: "short" });
    return `${day}-${month}`;
  };

  const buildExcelAndDownload = async (filtered: LogItem[]) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Accomplishment Report");

    // Column widths tuned to the screenshot
    worksheet.columns = [
      { width: 4 },    // A: index
      { width: 35 },   // B: work/activity
      { width: 12 },   // C: reference code
      { width: 12 },   // D: revisions
      { width: 10 },   // E: effectiveness rating
      { width: 12 },   // F: efficiency
      { width: 12 },   // G: target
      { width: 12 },   // H: started
      { width: 12 },   // I: finished
      { width: 10 },   // J: result
      { width: 10 },   // K: timeliness rating
      { width: 18 },   // L: remarks
    ];

    // Insert logo
    const logoBuf = await fetchLogoBuffer();
    if (logoBuf) {
      try {
        const imageId = workbook.addImage({ buffer: logoBuf, extension: "png" });
        worksheet.addImage(imageId, { tl: { col: 0.2, row: 0.1 }, ext: { width: 85, height: 85 } });
      } catch {
        // ignore image errors
      }
    }

    // Document code box top-right
    worksheet.mergeCells("K1:L1");
    worksheet.getCell("K1").value = "Document Code";
    worksheet.getCell("K1").font = { bold: true };
    worksheet.getCell("K1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "000000" } };
    worksheet.getCell("K1").font = { color: { argb: "FFFFFF" }, bold: true };
    worksheet.getCell("K1").alignment = { horizontal: "left", vertical: "middle" };

    worksheet.mergeCells("K2:L2");
    worksheet.getCell("K2").value = "FM-QP-DILG-AS-27-04";
    worksheet.getCell("K2").alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell("K2").font = { bold: true, size: 14 };

    worksheet.getCell("K3").value = "Rev.No.";
    worksheet.getCell("L3").value = "Eff. Date";
    worksheet.getCell("K4").value = "00";
    worksheet.getCell("L4").value = "06.15.21";
    worksheet.getCell("K5").value = "Page";
    worksheet.getCell("L5").value = "1 of 1";

    // style doc cells
    ["K1","K2","K3","L3","K4","L4","K5","L5"].forEach(addr => {
      const c = worksheet.getCell(addr);
      c.alignment = { horizontal: "center", vertical: "middle" };
      c.border = { top: {style:"thin"}, left:{style:"thin"}, bottom:{style:"thin"}, right:{style:"thin"} };
    });

    // Main title header
    worksheet.mergeCells("C1:G1");
    worksheet.getCell("C1").value = "DEPARTMENT OF THE INTERIOR AND LOCAL GOVERNMENT";
    worksheet.getCell("C1").font = { size: 14, bold: true };
    worksheet.getCell("C1").alignment = { horizontal: "left", vertical: "middle" };

    worksheet.mergeCells("C2:G2");
    worksheet.getCell("C2").value = "MONTHLY MONITORING OF INDIVIDUAL ACCOMPLISHMENTS";
    worksheet.getCell("C2").font = { size: 18, bold: true };
    worksheet.getCell("C2").alignment = { horizontal: "left", vertical: "middle" };

    // Month header dynamic from inputs if available
    let monthLine = "For the month of ";
    if (fromDateAcc && toDateAcc) {
      const from = new Date(fromDateAcc);
      const to = new Date(toDateAcc);
      const fromM = from.toLocaleString("default", { month: "long" });
      const toM = to.toLocaleString("default", { month: "long" });
      monthLine += (fromM === toM) ? `${fromM} ${from.getFullYear()}` : `${fromM} - ${toM} ${to.getFullYear()}`;
    } else {
      const now = new Date();
      monthLine += `${now.toLocaleString("default", { month: "long" }).toUpperCase()} ${now.getFullYear()}`;
    }
    worksheet.mergeCells("C3:G3");
    worksheet.getCell("C3").value = monthLine;
    worksheet.getCell("C3").alignment = { horizontal: "left", vertical: "middle" };

    // Employee & Office assignment
    const employeeName = selectedStaff && selectedStaff !== "all" ? selectedStaff : "REAL V. SILAGAN";
    worksheet.mergeCells("A6:I6");
    worksheet.getCell("A6").value = `Name & Signature of Employee: ${employeeName}`;
    worksheet.getCell("A6").font = { bold: true };
    worksheet.getCell("A6").alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getCell("A6").border = { top: {style:"thin"}, left:{style:"thin"}, bottom:{style:"thin"}, right:{style:"thin"} };

    worksheet.mergeCells("J6:L6");
    worksheet.getCell("J6").value = "Office Assignment: ORD-RICTU/Regional Office/Region 8";
    worksheet.getCell("J6").alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getCell("J6").border = { top: {style:"thin"}, left:{style:"thin"}, bottom:{style:"thin"}, right:{style:"thin"} };

    // Table header rows (two rows: 7 & 8)
    const r1 = 7;
    const r2 = 8;

    // WORK/ACTIVITY big cell (maps to column B)
    worksheet.mergeCells(`B${r1}:B${r2}`);
    worksheet.getCell(`B${r1}`).value = "WORK/ACTIVITY\n(1)";
    worksheet.getCell(`B${r1}`).alignment = { horizontal: "center", vertical: "middle", wrapText: true };

    // REFERENCE CODE (C)
    worksheet.mergeCells(`C${r1}:C${r2}`);
    worksheet.getCell(`C${r1}`).value = "REFERENCE CODE\n(2)";
    worksheet.getCell(`C${r1}`).alignment = { horizontal: "center", vertical: "middle", wrapText: true };

    // EFFECTIVENESS (D-E header)
    worksheet.mergeCells(`D${r1}:E${r1}`);
    worksheet.getCell(`D${r1}`).value = "EFFECTIVENESS/\nQUALITY (3)";
    worksheet.getCell(`D${r1}`).alignment = { horizontal: "center", vertical: "middle", wrapText: true };

    worksheet.getCell(`D${r2}`).value = "No. of Revisions/\nQuality of Output";
    worksheet.getCell(`E${r2}`).value = "Rating";
    worksheet.getCell(`D${r2}`).alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    worksheet.getCell(`E${r2}`).alignment = { horizontal: "center", vertical: "middle", wrapText: true };

    // EFFICIENCY (F)
    worksheet.mergeCells(`F${r1}:F${r2}`);
    worksheet.getCell(`F${r1}`).value = "EFFICIENCY\n(No. of outputs - fixed or running targets) (4)";
    worksheet.getCell(`F${r1}`).alignment = { horizontal: "center", vertical: "middle", wrapText: true };

    // TIMELINESS header spanning G..K on row r1
    worksheet.mergeCells(`G${r1}:K${r1}`);
    worksheet.getCell(`G${r1}`).value = "TIMELINESS\n(EFFICIENCY if enrolled in the Citizen's Charter) (5)";
    worksheet.getCell(`G${r1}`).alignment = { horizontal: "center", vertical: "middle", wrapText: true };

    // subcolumns under timeliness on r2: G Target, H Started, I Finished, J Result, K Rating
    worksheet.getCell(`G${r2}`).value = "Target\nDate of Completion";
    worksheet.getCell(`H${r2}`).value = "Started\n(Date of Receipt)";
    worksheet.getCell(`I${r2}`).value = "Finished";
    worksheet.getCell(`J${r2}`).value = "Result";
    worksheet.getCell(`K${r2}`).value = "Rating";

    // REMARKS (L) spanning two rows
    worksheet.mergeCells(`L${r1}:L${r2}`);
    worksheet.getCell(`L${r1}`).value = "REMARKS\n(6)";
    worksheet.getCell(`L${r1}`).alignment = { horizontal: "center", vertical: "middle", wrapText: true };

    // style header big area (grey fill)
    for (let rr = r1; rr <= r2; rr++) {
      const row = worksheet.getRow(rr);
      row.height = rr === r1 ? 30 : 25;
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D9D9D9" } };
        cell.font = { bold: true, size: 10 };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.border = { top: {style:"thin"}, left:{style:"thin"}, bottom:{style:"thin"}, right:{style:"thin"} };
      });
    }

    // Add data rows (no blank row after header)

    // Add rows from filtered array
    filtered.forEach((log, idx) => {
      const activity = log.problem_description?.trim() ?? "";
      const reference = "106.1";
      const revisions = 0;
      const effRating = 4;
      const efficiency = 4;
      const target = "1 Day";

      const startedDate = log.created_at ? new Date(log.created_at) : null;
      const startedDisplay = startedDate ? formatDateShort(startedDate) : "-";
      const finishedDisplay = log.finished_date ? formatDateShort(new Date(log.finished_date)) : "-";

      // Remarks logic:
      // if activity empty -> Work Suspension/Holiday
      // else if started is Saturday -> "Saturday"
      // else if started is Sunday -> "Sunday"
      // else -> "Done"
      let remarks = "Work Suspension/Holiday";
      let result = "";
      if (activity !== "") {
        if (startedDate) {
          const dow = startedDate.getDay(); // 0 = Sun, 6 = Sat
          if (dow === 6) remarks = "Saturday";
          else if (dow === 0) remarks = "Sunday";
          else remarks = "Done";
        } else {
          remarks = "Done";
        }
        result = remarks === "Work Suspension/Holiday" ? "" : "Done";
      } else {
        // activity empty
        remarks = "Work Suspension/Holiday";
        result = "";
      }

      const row = worksheet.addRow([
        idx + 1,
        activity || "-",
        reference,
        revisions,
        effRating,
        efficiency,
        target,
        startedDisplay,
        finishedDisplay,
        result,
        4, // timeliness rating
        remarks,
      ]);

      // style row
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = { top: {style:"thin"}, left:{style:"thin"}, bottom:{style:"thin"}, right:{style:"thin"} };
        if (colNumber === 2) {
          cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
        } else {
          cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        }
      });

      // remarks color for weekend/holiday
      const remarksCell = worksheet.getCell(`L${row.number}`);
      if (["Saturday", "Sunday", "Work Suspension/Holiday", "Holiday"].includes(remarks)) {
        remarksCell.font = { color: { argb: "FF0000" }, bold: true };
      }
    });

    // Footer: prepared by / confirmed by area (similar to screenshot)
    worksheet.addRow([]);
    worksheet.addRow([]);
    const preparedIndex = worksheet.lastRow!.number + 1;
    worksheet.mergeCells(`A${preparedIndex}:B${preparedIndex}`);
    worksheet.getCell(`A${preparedIndex}`).value = "Prepared by:";
    worksheet.getCell(`A${preparedIndex}`).alignment = { horizontal: "left" };

    worksheet.addRow([]);
    const namesRow = worksheet.lastRow!.number;
    worksheet.mergeCells(`A${namesRow}:B${namesRow}`);
    worksheet.getCell(`A${namesRow}`).value = employeeName;
    worksheet.getCell(`A${namesRow}`).font = { bold: true };
    worksheet.getCell(`A${namesRow}`).alignment = { horizontal: "center" };

    worksheet.mergeCells(`C${namesRow}:F${namesRow}`);
    worksheet.getCell(`C${namesRow}`).value = "Engr. ABELARDO LUIS D. DE ASIS";
    worksheet.getCell(`C${namesRow}`).font = { bold: true };
    worksheet.getCell(`C${namesRow}`).alignment = { horizontal: "center" };

    worksheet.mergeCells(`G${namesRow}:L${namesRow}`);
    worksheet.getCell(`G${namesRow}`).value = "ARNEL M. AGABE, CESO III";
    worksheet.getCell(`G${namesRow}`).font = { bold: true };
    worksheet.getCell(`G${namesRow}`).alignment = { horizontal: "center" };

    // role labels
    worksheet.addRow([]);
    const roleRow = worksheet.lastRow!.number;
    worksheet.mergeCells(`A${roleRow}:B${roleRow}`);
    worksheet.getCell(`A${roleRow}`).value = "Employee";
    worksheet.getCell(`A${roleRow}`).alignment = { horizontal: "center" };

    worksheet.mergeCells(`C${roleRow}:F${roleRow}`);
    worksheet.getCell(`C${roleRow}`).value = "Immediate Supervisor";
    worksheet.getCell(`C${roleRow}`).alignment = { horizontal: "center" };

    worksheet.mergeCells(`G${roleRow}:L${roleRow}`);
    worksheet.getCell(`G${roleRow}`).value = "Regional Director";
    worksheet.getCell(`G${roleRow}`).alignment = { horizontal: "center" };

    // freeze header rows
    worksheet.views = [{ state: "frozen", ySplit: r2 }];

    // download
    const filename = `RICTU_Accomplishment_Report_${staffNameToFile(selectedStaff)}_${fromDateAcc || "ALL"}_${toDateAcc || "ALL"}.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), filename);
  };

  // helper to sanitize filename staff
  const staffNameToFile = (s: string) => (s && s !== "all" ? s.replace(/\s+/g, "_") : "All");

  const handleGenerate = async () => {
    // basic validation
    if (!fromDateAcc || !toDateAcc) {
      showNotification(auth, "Validation", "Please choose both From and To dates.");
      return;
    }
    // ensure from <= to
    if (new Date(fromDateAcc) > new Date(toDateAcc)) {
      showNotification(auth, "Validation", "From date should be before or equal to To date.");
      return;
    }

    setLoading(true);
    try {
      // filter logs in-memory
      const filtered = logsData.filter((log) => {
        const staffMatch = selectedStaff === "all" || !selectedStaff ? true : (log.it_staff === selectedStaff);
        if (!isFinished(log)) return false;

        const created = log.created_at ? new Date(log.created_at) : null;
        if (!created) return false;
        const from = new Date(fromDateAcc + "T00:00:00");
        const to = new Date(toDateAcc + "T23:59:59");
        if (created < from || created > to) return false;
        return staffMatch;
      });

      if (filtered.length === 0) {
        showNotification(auth, "No data", "No finished logs found for the selected filters.");
      }

      await buildExcelAndDownload(filtered);
      showNotification(auth, "Export ready", "Accomplishment Report has been downloaded.");
      setShowAccomplishmentModal(false);
    } catch (err) {
      console.error(err);
      showNotification(auth, "Export failed", (err instanceof Error ? err.message : "Could not generate Accomplishment Report."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <Button onClick={() => setShowAccomplishmentModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          Accomplishment
        </Button>
      </div>

      <Dialog open={showAccomplishmentModal} onOpenChange={setShowAccomplishmentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Accomplishment Report</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>IT Staff</Label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full mt-1 p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                {staffList.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "All" : s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>From</Label>
              <input
                type="date"
                value={fromDateAcc}
                onChange={(e) => setFromDateAcc(e.target.value)}
                className="w-full mt-1 p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <Label>To</Label>
              <input
                type="date"
                value={toDateAcc}
                onChange={(e) => setToDateAcc(e.target.value)}
                className="w-full mt-1 p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowAccomplishmentModal(false)} className="mr-2">Cancel</Button>
            <Button disabled={loading} onClick={handleGenerate} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Generating..." : "Generate Accomplishment Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

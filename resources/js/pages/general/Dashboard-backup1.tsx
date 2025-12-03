import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

import { showNotification } from '@/utils/notif'
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import type { Border } from "exceljs";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

type TarfLog = {
    id: number
    request_type: string
    request_type_name: string
    equipment_concern: string | null
    brand: string | null
    model: string | null
    property_number: string | null
    serial_number: string | null
    specify_equipment_concern: string | null
    problem_description: string | null
    agreed_date: string | null
    agreed_time: string | null
    uploaded_file: string | null
    created_at: string
    status: string
    it_staff: string
    remarks: string
    finished_date: string
    finished_time: string
    updated_at: string
    fname: string
    lname: string
    sec_div_unit: string
    reference_no: string
}

type PaginatedLogs = {
    data: TarfLog[]
    meta: {
        current_page: number
        per_page: number
        total: number
        last_page: number
        from: number
        to: number
    }
    links: {
        url: string | null
        label: string
        active: boolean
    }[]
}

type Props = {
    logs: PaginatedLogs
}

const Dashboard = () => {
    const { auth } = usePage().props as any
    const [lastId, setLastId] = useState<number | null>(null)
    const [lastFinishedAt, setLastFinishedAt] = useState<string | null>(null)

    const { logs: initialLogs } = usePage<Props>().props
    const [logs, setLogs] = useState(initialLogs)

    const currentPage = logs?.meta?.current_page ?? 1
    const perPage = logs?.meta?.per_page ?? 10

    const [showModal, setShowModal] = useState(false)
    const [selectedLog, setSelectedLog] = useState<number | null>(null)
    const [itStaff, setItStaff] = useState('')
    const [remarks, setRemarks] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)

    // Add new states
    const [filterStaff, setFilterStaff] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    // Filter logs based on selected dropdowns
    const filteredLogs = logs.data.filter((log) => {
        const staffMatch = filterStaff === "all" || log.it_staff === filterStaff;
        const statusMatch = filterStatus === "all" || log.status === filterStatus;
        return staffMatch && statusMatch;
    });

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("TA Monitoring Logsheet");

        // Column widths (adjusted like PDF)
        worksheet.columns = [
            { width: 5 }, { width: 25 }, { width: 12 }, { width: 12 },
            { width: 20 }, { width: 20 }, { width: 20 }, { width: 25 },
            { width: 20 }, { width: 15 }, { width: 15 }, { width: 15 },
            { width: 15 }, { width: 20 }, { width: 15 },
        ];

        // ===== Insert Logo (A1:B4) =====
        const logo = await fetch("/dilg-logo.png") // put logo in /public
        .then((res) => res.blob())
        .then(
            (blob) =>
                new Promise<ArrayBuffer>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as ArrayBuffer);
                reader.readAsArrayBuffer(blob);
            })
        );

        const imageId = workbook.addImage({
            buffer: logo,
            extension: "png",
        });

        worksheet.addImage(imageId, {
            tl: { col: 1, row: 0 }, // top-left
            ext: { width: 85, height: 85 }, // adjust as needed
        });

        // ===== Top Section =====
        worksheet.mergeCells("M1:O1");
        worksheet.getCell("M1").value = "Document Code";
        worksheet.getCell("M1").alignment = { horizontal: "left", vertical: "middle" };
        worksheet.getCell("M1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "000000" } };
        worksheet.getCell("M1").font = { color: { argb: "FFFFFF" }, bold: true };

        worksheet.mergeCells("M2:O2");
        worksheet.getCell("M2").value = "FM-QP-DILG-ISTMS-17-02";
        worksheet.getCell("M2").alignment = { horizontal: "center", vertical: "middle" };
        worksheet.getCell("M2").font = { bold: true }

        worksheet.getCell("M3").value = "Rev. No.";
        worksheet.getCell("M3").alignment = { horizontal: "center", vertical: "top" };
        worksheet.getCell("M3").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "000000" } };
        worksheet.getCell("M3").font = { color: { argb: "FFFFFF" }, bold: true };

        worksheet.getCell("N3").value = "Eff. Date";
        worksheet.getCell("N3").alignment = { horizontal: "center", vertical: "top" };
        worksheet.getCell("N3").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "000000" } };
        worksheet.getCell("N3").font = { color: { argb: "FFFFFF" }, bold: true };

        worksheet.getCell("O3").value = "Page";
        worksheet.getCell("O3").alignment = { horizontal: "center", vertical: "top" };
        worksheet.getCell("O3").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "000000" } };
        worksheet.getCell("O3").font = { color: { argb: "FFFFFF" }, bold: true };

        worksheet.mergeCells("C2:G2");
        worksheet.getCell("C2").value = "Department of the Interior and Local Government";
        worksheet.getCell("C2").alignment = { horizontal: "left", vertical: "middle" };
        worksheet.getCell("C2").font = { size: 14 };
        worksheet.getRow(2).height = 18;

        worksheet.mergeCells("C3:H4");
        worksheet.getCell("C3").value = "ICT Technical Assistance Monitoring Logsheet";
        worksheet.getCell("C3").alignment = { horizontal: "left", vertical: "top" };
        worksheet.getCell("C3").font = { size: 23, bold: true };
        worksheet.getRow(3).height = 25;

        worksheet.mergeCells("A6:O6");
        worksheet.getCell("A6").value = "PERIOD:";
        worksheet.getCell("A6").alignment = { horizontal: "left", vertical: "middle" };

        // Define border style with proper type
        const borderStyle: Partial<Border> = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Apply border to all cells in merged range
        ["A6","B6","C6","D6","E6","F6","G6","H6","I6","J6","K6","L6","M6","N6","O6","M2","N2","O2","M4","N4","O4"]
        .forEach(addr => {
            worksheet.getCell(addr).border = borderStyle;
        });

        worksheet.addRow([]);

        // ===== Multi-row Table Header (Rows 6–7) =====
        worksheet.mergeCells("A7:A8");
        worksheet.getCell("A7").value = "NO.";
        worksheet.mergeCells("B7:B8");
        worksheet.getCell("B7").value = "ICT TECHNICAL ASSISTANCE REFERENCE NO.";

        worksheet.mergeCells("C7:D7");
        worksheet.getCell("C7").value = "RECEIVED";
        worksheet.getCell("C8").value = "DATE";
        worksheet.getCell("D8").value = "TIME";

        worksheet.mergeCells("E7:E8");
        worksheet.getCell("E7").value = "NAME OF THE END-USER";

        worksheet.mergeCells("F7:G8");
        worksheet.getCell("F7").value = "OFFICE/SERVICE/BUREAU/DIVISION/SECTION/UNIT";
        worksheet.getCell("F7").alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        worksheet.getCell("F7").font = { bold: true };

        worksheet.mergeCells("H7:H8");
        worksheet.getCell("H7").value = "ISSUE/CONCERN";
        worksheet.mergeCells("I7:I8");
        worksheet.getCell("I7").value = "TECHNICAL PERSONNEL ASSIGNED";

        worksheet.mergeCells("J7:K7");
        worksheet.getCell("J7").value = "AGREED TIMELINE (if any)";
        worksheet.getCell("J8").value = "DATE";
        worksheet.getCell("K8").value = "TIME";

        worksheet.mergeCells("L7:M7");
        worksheet.getCell("L7").value = "COMPLETED";
        worksheet.getCell("L8").value = "DATE";
        worksheet.getCell("M8").value = "TIME";

        worksheet.mergeCells("N7:N8");
        worksheet.getCell("N7").value = "TOTAL PROCESSING TIME";
        worksheet.mergeCells("O7:O8");
        worksheet.getCell("O7").value = "OVERALL QUALITY RATING";

        // Style header rows
        worksheet.getRow(7).height = 30;
        worksheet.getRow(8).height = 25;

        for (let r = 7; r <= 8; r++) {
            worksheet.getRow(r).eachCell((cell) => {
            cell.font = { bold: true };
            cell.alignment = {
                horizontal: "center",
                vertical: "middle",
                wrapText: true,
            };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
            });
        }

        // ===== Data Rows (filtered) =====
        filteredLogs.forEach((log, idx) => {
            const created = new Date(log.created_at);

            let processingTime = "-";
            if (log.finished_date && log.finished_time) {
                const end = new Date(`${log.finished_date} ${log.finished_time}`);
                const diffMs = end.getTime() - created.getTime();
                const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                processingTime =
                    diffHrs > 0 ? `${diffHrs}hrs ${diffMins}mins` : `${diffMins}mins`;
            }

            const sender = (log.fname ?? "") + " " + (log.lname ?? "");

            const row = worksheet.addRow([
                idx + 1,
                log.reference_no,
                created.toLocaleDateString(),
                created.toLocaleTimeString(),
                sender ?? "-",
                "-",
                log.sec_div_unit ?? "-",
                log.problem_description ?? "-",
                log.it_staff ?? "-",
                log.agreed_date ?? "-",
                log.agreed_time ?? "-",
                log.finished_date ?? "-",
                log.finished_time ?? "-",
                processingTime,
                "4",
            ]);

            row.eachCell((cell) => {
                cell.alignment = { vertical: "middle", horizontal: "center" };
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
            });

            const rowNumber = row.number;
            worksheet.mergeCells(`F${rowNumber}:G${rowNumber}`);
            worksheet.getCell(`F${rowNumber}`).value =
                log.sec_div_unit && log.sec_div_unit !== "" ? log.sec_div_unit : "-";
            worksheet.getCell(`F${rowNumber}`).alignment = {
                horizontal: "center",
                vertical: "middle",
                wrapText: true,
            };
        });

        // Save file
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "RICTU_TA-Monitoring-Logsheet.xlsx");
    };

    useEffect(() => {
        if (auth?.user?.role !== 'admin') return;

        const interval = setInterval(() => {
            fetch('/check-new-requests')
                .then(res => res.json())
                .then(data => {
                    const newId = data.latest_id;
                    if (newId && newId !== lastId) {
                        setLastId(newId); // Store to avoid repeat
                        showNotification(auth, "New Support Request", "A user has submitted a new request.");
                        router.reload({ only: ['logs'] });
                    }
                });
        }, 10000); // Every 10 seconds

        return () => clearInterval(interval);
    }, [lastId]);

    useEffect(() => {
        if (auth?.user?.role !== 'admin') return;

        const interval = setInterval(() => {
            fetch('/check-finished-requests')
                .then(res => res.json())
                .then(data => {
                    if (data.updated_at && data.updated_at !== lastFinishedAt) {
                        setLastFinishedAt(data.updated_at)
                        showNotification(auth, "Request Completed", "A user has marked a request as finished.");
                        router.reload({ only: ['logs'] })
                    }
                })
        }, 10000)

        return () => clearInterval(interval)
    }, [lastFinishedAt])

    useEffect(() => {
        setLogs(initialLogs)
    }, [initialLogs])

    return (
       <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex m-4">
                <Button asChild>
                    <Link href="/support-form">Contact Support</Link>
                </Button>
            </div>

            <Dialog open={isProcessing}>
                <DialogContent className="flex flex-col items-center justify-center gap-4 py-10">
                    <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <div className="text-sm text-muted-foreground">Processing your request...</div>
                </DialogContent>
            </Dialog>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Status</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="it_staff">Select IT Staff</Label>
                            <Select onValueChange={setItStaff}>
                            <SelectTrigger id="it_staff">
                                <SelectValue placeholder="Select IT Staff" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AJ">AJ</SelectItem>
                                <SelectItem value="Chok">Chok</SelectItem>
                                <SelectItem value="Kenot">Kenot</SelectItem>
                                <SelectItem value="Emman">Emman</SelectItem>
                                <SelectItem value="Real">Real</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea
                            id="remarks"
                            placeholder="Enter remarks..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={() => {
                                if (!selectedLog) return
                                setIsProcessing(true)
                                router.put(`/tarf-logs/${selectedLog}/status`, {
                                    status: 'finished',
                                    it_staff: itStaff,
                                    remarks: remarks,
                                }, {
                                    onSuccess: () => {
                                        setIsProcessing(false)
                                        setShowModal(false)
                                        setSelectedLog(null)
                                        setItStaff('')
                                        setRemarks('')
                                        setLogs((prev) => ({
                                            ...prev,
                                            data: prev.data.map((log) =>
                                                log.id === selectedLog
                                                    ? {
                                                        ...log,
                                                        status: 'finished',
                                                        remarks: remarks,
                                                        finished_date: new Date().toISOString().split("T")[0],
                                                        finished_time: new Date().toLocaleTimeString()
                                                    }
                                                    : log
                                            )
                                        }))
                                    }
                                })
                            }}
                        >
                            Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-1"><h1 className="text-2xl font-bold">Support Requests</h1></div>
                    <div className="flex flex-3 justify-between items-center gap-3">
                        {auth?.user?.role === 'admin' && (
                            <>
                            <div className="flex justify-center items-center gap-3">
                                <div>
                                    <Label>Filter by IT Staff</Label>
                                    <Select onValueChange={setFilterStaff} defaultValue="all">
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="All Staff" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="AJ">AJ</SelectItem>
                                        <SelectItem value="Chok">Chok</SelectItem>
                                        <SelectItem value="Kenot">Kenot</SelectItem>
                                        <SelectItem value="Emman">Emman</SelectItem>
                                        <SelectItem value="Real">Real</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Filter by Status</Label>
                                    <Select onValueChange={setFilterStatus} defaultValue="all">
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="finished">Finished</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button onClick={exportToExcel} className="bg-blue-600 hover:bg-blue-700 text-white">
                                Download Logsheet
                            </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto border rounded-lg mb-4">
                    <table className="w-full table-auto border-collapse text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-500">
                            <tr>
                                <th className="p-3 border">No.</th>
                                <th className="p-3 border">Request Type</th>
                                <th className="p-3 border">Equipment Concern</th>
                                <th className="p-3 border">Brand</th>
                                <th className="p-3 border">Problem Description</th>
                                <th className="p-3 border">Uploaded File</th>
                                <th className="p-3 border">Request Date</th>
                                <th className="p-3 border">IT Staff</th>
                                <th className="p-3 border">Finished Date</th>
                                <th className="p-3 border">Remarks</th>

                                <th className="p-3 border">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* {logs.data.map((log, index) => ( */}
                            {filteredLogs.map((log, index) => (
                                <tr key={log.id} className="hover:bg-gray-100 dark:hover:bg-gray-500">
                                    <td className="p-3 border">{(currentPage - 1) * perPage + index + 1}</td>
                                    <td className="p-3 border">{log.request_type_name}</td>
                                    <td className="p-3 border">{log.equipment_concern || '-'}</td>
                                    <td className="p-3 border">{log.brand || '-'}</td>
                                    <td className="p-3 border">{log.problem_description || '-'}</td>
                                    <td className="p-3 border">
                                        {log.uploaded_file ? (
                                        <a
                                            href={`/storage/${log.uploaded_file}`}
                                            target="_blank"
                                            className="text-blue-600 underline"
                                        >
                                            View File
                                        </a>
                                        ) : (
                                        '-'
                                        )}
                                    </td>
                                    <td className="p-3 border">{new Date(log.created_at).toLocaleString()}</td>
                                    <td className="p-3 border">{log.it_staff || '-'}</td>
                                    <td className="p-3 border">{(log.finished_date ?? '-') +' '+ (log.finished_time ?? '-')}</td>
                                    <td className="p-3 border">{log.remarks ?? '-'}</td>
                                    <td className="p-3 border">
                                        {log.status === 'pending' ? (
                                            <Button
                                            size="sm"
                                            className="bg-orange-300 hover:bg-orange-400"
                                            onClick={() => {
                                                setSelectedLog(log.id)
                                                setShowModal(true)
                                            }}
                                            >
                                            Update Status
                                            </Button>
                                        ) : (
                                            <span className="text-green-700 font-semibold text-sm">✔Finished</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-4">
                    {logs.links.map((link, idx) => (
                        <button
                            key={idx}
                            disabled={!link.url}
                            className={`px-3 py-1 mx-1 rounded border ${
                                link.active ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            onClick={() => {
                                if (link.url) {
                                window.location.href = link.url
                                }
                            }}
                        />
                    ))}
                </div>
            </div>

        </AppLayout>
    )
}

export default Dashboard

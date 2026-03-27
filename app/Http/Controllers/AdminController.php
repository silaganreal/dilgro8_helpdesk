<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function dashboard(): Response {
        return Inertia::render('admin/Users');
    }

    /**
     * Return daily summary counts grouped by finished_date, filling missing dates with zero.
     * GET /reports/daily-summary?from=YYYY-MM-DD&to=YYYY-MM-DD
     */
    // public function dailySummary(Request $request)
    // {
    //     $validated = $request->validate([
    //         'from' => 'required|date',
    //         'to' => 'required|date|after_or_equal:from',
    //     ]);

    //     $from = Carbon::parse($validated['from'])->startOfDay();
    //     $to = Carbon::parse($validated['to'])->startOfDay();

    //     // Query counts grouped by finished_date for the range
    //     $rows = DB::table('tarf_logs')
    //         ->select('finish_date_time', DB::raw('COUNT(*) as total'))
    //         ->whereNotNull('finish_date_time')
    //         ->whereBetween('finish_date_time', [$from->toDateString(), $to->toDateString()])
    //         ->groupBy('finish_date_time')
    //         ->orderBy('finish_date_time', 'asc')
    //         ->get()
    //         ->pluck('total', 'finish_date_time')
    //         ->toArray();

    //     // Build array for each date in the range, inserting zeros where missing
    //     $pointer = $from->copy();
    //     $result = [];

    //     while ($pointer->lte($to)) {
    //         $d = $pointer->toDateString();
    //         $result[] = [
    //             'date' => $d,
    //             'count' => isset($rows[$d]) ? (int) $rows[$d] : 0,
    //         ];
    //         $pointer->addDay();
    //     }

    //     return response()->json($result);
    // }

    public function dailySummary(Request $request) {
        $validated = $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
        ]);

        $from = Carbon::parse($validated['from'])->startOfDay();
        $to = Carbon::parse($validated['to'])->endOfDay(); // ✅ FIX

        $rows = DB::table('tarf_logs')
            ->select(DB::raw('DATE(finish_date_time) as date'), DB::raw('COUNT(*) as total'))
            ->whereNotNull('finish_date_time')
            ->whereBetween('finish_date_time', [$from, $to]) // ✅ FIX
            ->groupBy(DB::raw('DATE(finish_date_time)')) // ✅ FIX
            ->orderBy('date', 'asc')
            ->get()
            ->pluck('total', 'date')
            ->toArray();

        // Fill missing dates
        $pointer = $from->copy();
        $result = [];

        while ($pointer->lte($to)) {
            $d = $pointer->toDateString();
            $result[] = [
                'date' => $d,
                'count' => isset($rows[$d]) ? (int) $rows[$d] : 0,
            ];
            $pointer->addDay();
        }

        return response()->json($result);
    }
}

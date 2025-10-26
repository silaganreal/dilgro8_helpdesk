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
    public function dailySummary(Request $request)
    {
        $validated = $request->validate([
            'from' => 'required|date',
            'to' => 'required|date|after_or_equal:from',
        ]);

        $from = Carbon::parse($validated['from'])->startOfDay();
        $to = Carbon::parse($validated['to'])->startOfDay();

        // Query counts grouped by finished_date for the range
        $rows = DB::table('tarf_logs')
            ->select('finished_date', DB::raw('COUNT(*) as total'))
            ->whereNotNull('finished_date')
            ->whereBetween('finished_date', [$from->toDateString(), $to->toDateString()])
            ->groupBy('finished_date')
            ->orderBy('finished_date', 'asc')
            ->get()
            ->pluck('total', 'finished_date')
            ->toArray();

        // Build array for each date in the range, inserting zeros where missing
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

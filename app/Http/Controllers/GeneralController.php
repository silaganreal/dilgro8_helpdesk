<?php

namespace App\Http\Controllers;

use App\Models\TarfLogs;
use App\Models\TypeOfRequest;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class GeneralController extends Controller
{
    public function dashboard(): Response {
        $user = Auth::user();

        $query = DB::table('tarf_logs')
            ->leftJoin('type_of_requests', 'tarf_logs.request_type', '=', 'type_of_requests.id')
            ->leftJoin('users', 'tarf_logs.section_div_unit', '=', 'users.id')
            ->leftJoin('section_div_units', 'users.section_div_unit', '=', 'section_div_units.id')
            ->leftJoin('users as it_staff', 'tarf_logs.it_staff', '=', 'it_staff.id')
            ->select(
                'tarf_logs.*',
                'type_of_requests.request_type as request_type_name',
                'users.fname',
                'users.lname',
                'section_div_units.section_div_unit as sec_div_unit',
                'it_staff.fname as it_fname',
                'it_staff.lname as it_lname'
            )
        ->orderByDesc('tarf_logs.updated_at');

        // ✅ Add condition based on role
        if ($user->role === 'user') {
            // Regular user sees only their own logs
            $query->where('tarf_logs.section_div_unit', $user->id);
        } elseif ($user->role === 'admin') {
            // Admin sees all logs — no filter
        }

        // 🔒 Role-based restriction (UNCHANGED)
        if ($user->role === 'user') {
            $query->where('tarf_logs.section_div_unit', $user->id);
        }

        // ✅ ADD THIS FILTERS (before paginate)
        // 🔹 IT Staff filter
        if (request()->filled('staff')) {
            $query->where('tarf_logs.it_staff', request('staff'));
        }

        // 🔹 Status filter
        if (request()->filled('status') && request('status') !== 'all') {
            $query->where('tarf_logs.status', request('status'));
        }

        $logs = $query
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('general/Dashboard', [
            'logs' => $logs,
            'filters' => request()->only(['staff', 'status']),
        ]);
    }

    public function export_tamls() {
        $query = DB::table('tarf_logs')
            ->leftJoin('type_of_requests', 'tarf_logs.request_type', '=', 'type_of_requests.id')
            ->leftJoin('users', 'tarf_logs.section_div_unit', '=', 'users.id')
            ->leftJoin('section_div_units', 'users.section_div_unit', '=', 'section_div_units.id')
            ->leftJoin('users as it_staff', 'tarf_logs.it_staff', '=', 'it_staff.id')
            ->select(
                'tarf_logs.*',
                'type_of_requests.request_type as request_type_name',
                'users.fname',
                'users.lname',
                'section_div_units.section_div_unit as sec_div_unit',
                'it_staff.fname as it_fname',
                'it_staff.lname as it_lname'
            )
        ->orderByDesc('tarf_logs.created_at');

        if (request('staff') !== 'all') {
            $query->where('tarf_logs.it_staff', request('staff'));
        }

        if (request('status') !== 'all') {
            $query->where('tarf_logs.status', request('status'));
        }

        if (request('date_from')) {
            $query->whereDate('tarf_logs.created_at', '>=', request('date_from'));
        }

        if (request('date_to')) {
            $query->whereDate('tarf_logs.created_at', '<=', request('date_to'));
        }

        return response()->json($query->get());
    }

    public function support_form(): Response {
        $requests = TypeOfRequest::all();
        return Inertia::render('general/SupportForm', [
            'request_type' => $requests
        ]);
    }

    public function store(Request $request): RedirectResponse {
        $validated = $request->validate([
            'request_type' => 'required|string',
            'equipment_concern' => 'nullable|string',
            'brand' => 'nullable|string',
            'model' => 'nullable|string',
            'property_number' => 'nullable|string',
            'serial_number' => 'nullable|string',
            'specify_equipment_concern' => 'nullable|string',
            'software_assistance' => 'nullable|string',
            'govmail_add' => 'nullable|string',
            'alternative_email' => 'nullable|email',
            'contact_no' => 'nullable|string',
            'document_posting' => 'nullable|string',
            'uploaded_file' => 'nullable|file|max:2048|mimes:jpg,jpeg,png,pdf',
            'problem_description' => 'nullable|string',
            'agreed_date' => 'nullable|date',
            'agreed_time' => 'nullable|string',
            'finished_date' => 'nullable|string',
            'finished_time' => 'nullable|string',
            'it_staff' => 'nullable|string',
            'status' => 'nullable|string',
            'remarks' => 'nullable|string',
            'reference_no' => 'nullable|string',
            'request_date' => 'nullable|date',
            'request_time' => 'nullable|string',
            'requested_by' => 'nullable|string',
        ]);

        if ($request->hasFile('uploaded_file')) {
            $validated['uploaded_file'] = $request->file('uploaded_file')->store('uploads', 'public');
        }

        if (!empty($validated['request_date']) && !empty($validated['request_time'])) {
            $validated['created_at'] = Carbon::createFromFormat(
                'Y-m-d H:i',
                $validated['request_date'] . ' ' . $validated['request_time']
            );
        }

        if (auth()->user()->role === 'superadmin') {
            // Superadmin: use requested_by
            $validated['section_div_unit'] = $validated['requested_by'];
        } else {
            // Normal user: use own user ID
            $validated['section_div_unit'] = auth()->id();
        }

        // Generate Reference Number
        $now = Carbon::now();
        $year = $now->year;
        $month = $now->month;

        $counter = DB::transaction(function () use ($year, $month) {
            $row = DB::table('request_counters')
                ->where('year', $year)
                ->where('month', $month)
                ->lockForUpdate()
                ->first();

            if ($row) {
                $newCounter = $row->counter + 1;
                DB::table('request_counters')
                    ->where('id', $row->id)
                    ->update(['counter' => $newCounter]);
            } else {
                $newCounter = 1;
                DB::table('request_counters')->insert([
                    'year' => $year,
                    'month' => $month,
                    'counter' => $newCounter
                ]);
            }

            return $newCounter;
        });

        $formattedCounter = str_pad($counter, 4, '0', STR_PAD_LEFT);
        $referenceNo = "R8-{$year}-{$month}-{$formattedCounter}";

        $validated['reference_no'] = $referenceNo;

        // dd($validated);
        TarfLogs::create($validated);
        return redirect()->route('dashboard')->with('success', 'Resquest has been submitted successfully.');
    }

    function updateTarfStatus(Request $request, $id) {
        $request->validate([
            'status' => 'required|in:pending,finished',
            'it_staff' => 'required|string|max:255',
            'remarks' => 'nullable|string',
        ]);

       $updateData = [
            'status' => $request->status,
            'it_staff' => $request->it_staff,
            'remarks' => $request->remarks,
        ];

        if ($request->status === 'finished') {
            $now = Carbon::now();

            $updateData['finished_date'] = Carbon::now()->toDateString(); // "YYYY-MM-DD"
            $updateData['finished_time'] = Carbon::now()->format('H:i:s'); // "HH:MM:SS"

            // Generate Reference Number
            $year = $now->year;
            $month = $now->month;

            $counter = DB::transaction(function () use ($year, $month) {
                $row = DB::table('request_counters')
                    ->where('year', $year)
                    ->where('month', $month)
                    ->lockForUpdate()
                    ->first();

                if ($row) {
                    $newCounter = $row->counter + 1;
                    DB::table('request_counters')
                        ->where('id', $row->id)
                        ->update(['counter' => $newCounter]);
                } else {
                    $newCounter = 1;
                    DB::table('request_counters')->insert([
                        'year' => $year,
                        'month' => $month,
                        'counter' => $newCounter
                    ]);
                }

                return $newCounter;
            });

            $formattedCounter = str_pad($counter, 4, '0', STR_PAD_LEFT);
            $referenceNo = "R8-{$year}-{$month}-{$formattedCounter}";

            $updateData['reference_no'] = $referenceNo; // Make sure your tarf_logs table has this column
        }

        TarfLogs::where('id', $id)->update($updateData);

        return back()->with('success', 'Status updated successfully.');
    }
}

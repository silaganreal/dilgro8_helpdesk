<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\GeneralController;
use App\Http\Controllers\SuperAdminController;
use App\Models\TarfLogs;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

// General Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [GeneralController::class, 'dashboard'])->name('dashboard');
    Route::get('/support-form', [GeneralController::class, 'support_form'])->name('support.form');
    Route::post('/support-form/submit', [GeneralController::class, 'store'])->name('support-form.submit');
    Route::put('/tarf-logs/{id}/status', [GeneralController::class, 'updateTarfStatus']);
    Route::get('/tarf-logs/export-tamls', [GeneralController::class, 'export_tamls']);
});

// Admin Routes
Route::middleware(['auth', 'verified', 'role:admin,superadmin'])->group(function () {
    Route::get('/admin/users', [AdminController::class, 'dashboard'])->name('admin.dashboard');

    Route::get('/check-new-requests', function () {
        $latestUnseen = DB::table('tarf_logs')
            ->where('status', 'pending')
            ->where('notif_new_request', 0)
            ->latest('id')
            ->first();

        if ($latestUnseen) {
            // Mark as notified
            DB::table('tarf_logs')
                ->where('id', $latestUnseen->id)
                ->update(['notif_new_request' => 1]);
        }

        return response()->json([
            'latest_id' => $latestUnseen->id ?? null,
        ]);
    });

    Route::get('/check-finished-requests', function () {
        $latestFinished = DB::table('tarf_logs')
            ->where('status', 'finished')
            ->where('notif_finished_request', 0)
            ->latest('updated_at')
            ->first();

        if($latestFinished) {
            DB::table('tarf_logs')
                ->where('id', $latestFinished->id)
                ->update(['notif_finished_request' => 1]);
        }

        return response()->json([
            'latest_finished_id' => $latestFinished->id ?? null,
            'updated_at' => $latestFinished->updated_at ?? null
        ]);
    });

    Route::get('/reports/daily-summary', [AdminController::class, 'dailySummary'])->name('reports.daily-summary');
});

// Super Admin Routes
Route::middleware(['auth', 'verified', 'role:superadmin'])->group(function () {
    Route::get('/superadmin/system-controls', [SuperAdminController::class, 'dashboard'])->name('superadmin.dashboard');
    Route::get('/deploy-commands', [SuperAdminController::class, 'deploy_commands'])->name('deploy.commands');
    Route::get('/deploy-commands-local', [SuperAdminController::class, 'deploy_commands_local'])->name('deploy.commands.local');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

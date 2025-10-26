<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SuperAdminController extends Controller
{
    public function dashboard(): Response {
        return Inertia::render('superadmin/SystemControls');
    }

    public function deploy_commands() {
        // Optional: Protect using token
        // if (request('token') !== env('DEPLOY_TOKEN')) {
        //     abort(403, 'Unauthorized');
        // }

        // Run commands using PHP 8.3 binary
        $php = "/opt/alt/php83/usr/bin/php";

        $commands = [
            "$php artisan route:clear",
            "$php artisan config:clear",
            "$php artisan cache:clear",
            "$php artisan optimize:clear",
            "$php artisan route:list",
        ];

        foreach ($commands as $cmd) {
            shell_exec($cmd);
        }

        return "✅ Deployment maintenance tasks executed successfully.";
    }
}

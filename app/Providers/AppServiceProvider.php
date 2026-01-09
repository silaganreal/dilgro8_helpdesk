<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share('superadmins', function () {
            return User::where('role', 'superadmin')
                ->select('id', 'fname', 'lname', 'css_link')
                ->orderBy('fname', 'asc')
                ->get();
        });
    }
}

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

        Inertia::share('users', function () {
            return User::query()
                ->leftJoin(
                    'section_div_units',
                    'users.section_div_unit',
                    '=',
                    'section_div_units.id'
                )
                ->where('users.role', 'user')
                ->select(
                    'users.id',
                    'users.fname',
                    'users.lname',
                    'users.css_link',
                    'section_div_units.section_div_unit as sec_div_unit'
                )
                ->orderBy('users.fname', 'asc')
                ->get();
        });

        // Inertia::share('user_admin', function () {
        //     return User::whereIn('role', ['user', 'admin'])
        //         ->select('id', 'fname', 'lname', 'css_link')
        //         ->orderBy('fname', 'asc')
        //         ->get();
        // });
    }
}

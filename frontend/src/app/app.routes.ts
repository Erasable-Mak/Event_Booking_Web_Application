import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'calendar', pathMatch: 'full' },
    {
        path: 'login',
        loadComponent: () =>
            import('./auth/login.component').then((m) => m.LoginComponent),
    },
    {
        path: 'register',
        loadComponent: () =>
            import('./auth/register.component').then((m) => m.RegisterComponent),
    },
    {
        path: 'calendar',
        loadComponent: () =>
            import('./calendar/calendar.component').then((m) => m.CalendarComponent),
        canActivate: [authGuard],
    },
    {
        path: 'preferences',
        loadComponent: () =>
            import('./preferences/preferences.component').then(
                (m) => m.PreferencesComponent
            ),
        canActivate: [authGuard],
    },
    {
        path: 'admin',
        loadComponent: () =>
            import('./admin/admin.component').then((m) => m.AdminComponent),
        canActivate: [authGuard],
    },
    { path: '**', redirectTo: 'calendar' },
];

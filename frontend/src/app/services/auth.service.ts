import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TokenPair {
    access: string;
    refresh: string;
}

export interface UserInfo {
    id: number;
    username: string;
    email: string;
    is_staff?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly api = environment.apiUrl;
    private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        // Restore user from token on init
        if (this.getToken()) {
            this.fetchMe().subscribe();
        }
    }

    register(username: string, email: string, password: string): Observable<any> {
        return this.http.post(`${this.api}/auth/register/`, { username, email, password });
    }

    login(username: string, password: string): Observable<TokenPair> {
        return this.http
            .post<TokenPair>(`${this.api}/auth/token/`, { username, password })
            .pipe(
                tap((tokens) => {
                    localStorage.setItem('access_token', tokens.access);
                    localStorage.setItem('refresh_token', tokens.refresh);
                    this.fetchMe().subscribe();
                })
            );
    }

    fetchMe(): Observable<UserInfo> {
        return this.http.get<UserInfo>(`${this.api}/auth/me/`).pipe(
            tap((user) => this.currentUserSubject.next(user))
        );
    }

    logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        this.currentUserSubject.next(null);
    }

    getToken(): string | null {
        return localStorage.getItem('access_token');
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refresh_token');
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    get currentUser(): UserInfo | null {
        return this.currentUserSubject.value;
    }
}

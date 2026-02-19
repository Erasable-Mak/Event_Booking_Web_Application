import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EventCategory {
    id: number;
    name: string;
}

export interface TimeSlot {
    id: number;
    title: string;
    category: number;
    category_name: string;
    start_time: string;
    end_time: string;
    booked_by: number | null;
    booked_by_username: string | null;
}

export interface UserPreference {
    id: number;
    categories: number[];
}

@Injectable({ providedIn: 'root' })
export class EventService {
    private readonly api = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // Categories
    getCategories(): Observable<EventCategory[]> {
        return this.http.get<EventCategory[]>(`${this.api}/categories/`);
    }

    // Preferences
    getPreferences(): Observable<UserPreference> {
        return this.http.get<UserPreference>(`${this.api}/preferences/`);
    }

    updatePreferences(categoryIds: number[]): Observable<UserPreference> {
        return this.http.put<UserPreference>(`${this.api}/preferences/`, {
            categories: categoryIds,
        });
    }

    // Time Slots
    getTimeSlots(weekStart: string, categoryId?: number): Observable<TimeSlot[]> {
        let params = new HttpParams().set('week', weekStart);
        if (categoryId) {
            params = params.set('category', categoryId.toString());
        }
        return this.http.get<TimeSlot[]>(`${this.api}/timeslots/`, { params });
    }

    bookSlot(slotId: number): Observable<TimeSlot> {
        return this.http.post<TimeSlot>(`${this.api}/book/${slotId}/`, {});
    }

    unbookSlot(slotId: number): Observable<TimeSlot> {
        return this.http.post<TimeSlot>(`${this.api}/unbook/${slotId}/`, {});
    }

    // Admin
    getAdminTimeSlots(): Observable<TimeSlot[]> {
        return this.http.get<TimeSlot[]>(`${this.api}/admin/timeslots/`);
    }

    createTimeSlot(data: {
        title: string;
        category: number;
        start_time: string;
        end_time: string;
    }): Observable<TimeSlot> {
        return this.http.post<TimeSlot>(`${this.api}/admin/timeslots/`, data);
    }
}

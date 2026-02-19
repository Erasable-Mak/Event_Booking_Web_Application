import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventService, EventCategory, TimeSlot } from '../services/event.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
  categories: EventCategory[] = [];
  slots: TimeSlot[] = [];
  selectedCategory = 0;
  loading = true;
  currentUserId: number | null = null;

  weekStart!: Date;
  weekEnd!: Date;
  weekDays: { label: string; date: Date }[] = [];

  private dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.currentUserId = this.authService.currentUser?.id ?? null;
    this.authService.currentUser$.subscribe((u: any) => (this.currentUserId = u?.id ?? null));
    this.setWeek(this.getMonday(new Date()));
    this.eventService.getCategories().subscribe({
      next: (cats: EventCategory[]) => {
        this.categories = cats;
        this.cdr.detectChanges();
      },
    });
    this.loadSlots();
  }

  // Week helpers
  private getMonday(d: Date): Date {
    const dt = new Date(d);
    const day = dt.getDay();
    const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
    dt.setDate(diff);
    dt.setHours(0, 0, 0, 0);
    return dt;
  }

  private setWeek(monday: Date) {
    this.weekStart = monday;
    this.weekEnd = new Date(monday);
    this.weekEnd.setDate(this.weekEnd.getDate() + 6);
    this.weekDays = this.dayLabels.map((label, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return { label, date: d };
    });
  }

  prevWeek() {
    const d = new Date(this.weekStart);
    d.setDate(d.getDate() - 7);
    this.setWeek(d);
    this.loadSlots();
  }

  nextWeek() {
    const d = new Date(this.weekStart);
    d.setDate(d.getDate() + 7);
    this.setWeek(d);
    this.loadSlots();
  }

  goToday() {
    this.setWeek(this.getMonday(new Date()));
    this.loadSlots();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  // Data
  loadSlots() {
    this.loading = true;
    const weekStr = this.formatDate(this.weekStart);
    const catId = this.selectedCategory || undefined;
    this.eventService.getTimeSlots(weekStr, catId).subscribe({
      next: (slots: TimeSlot[]) => {
        this.slots = slots;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Failed to load timeslots', 'Close', { duration: 3000 });
      },
    });
  }

  getSlotsForDay(date: Date): TimeSlot[] {
    return this.slots.filter((s) => {
      const start = new Date(s.start_time);
      const end = new Date(s.end_time);
      const current = new Date(date);

      // normalizing to midnight for day comparison
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      current.setHours(0, 0, 0, 0);

      /* Check if current day is within range [start, end]
       Note: If end time is exactly midnight of same day as start, it's a single day event.
       If end time is midnight of next day, it covers current day.
       We generally want to show it on days where: start <= current <= end
       But if end is midnight, we might need to be careful not to show it on the end day if it ends at 00:00.
       For simplicity here: start <= current <= end_of_event_day

       Let's use exact time comparison for accuracy but aligned to days for the grid
       Simple logic: Does the interval [start, end] overlap with [current_start, current_end]?
       Yes if: start < current_end AND end > current_start */

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const sTime = new Date(s.start_time);
      const eTime = new Date(s.end_time);

      return sTime < dayEnd && eTime > dayStart;
    });
  }

  book(slot: TimeSlot) {
    this.eventService.bookSlot(slot.id).subscribe({
      next: (updated: TimeSlot) => {
        this.replaceSlot(updated);
        this.cdr.detectChanges();
        this.snackBar.open('Booked!', 'Close', { duration: 2000 });
      },
      error: (err: any) => this.snackBar.open(err?.error?.error || 'Booking failed', 'Close', { duration: 3000 }),
    });
  }

  unbook(slot: TimeSlot) {
    this.eventService.unbookSlot(slot.id).subscribe({
      next: (updated: TimeSlot) => {
        this.replaceSlot(updated);
        this.cdr.detectChanges();
        this.snackBar.open('Unsubscribed', 'Close', { duration: 2000 });
      },
      error: (err: any) => this.snackBar.open(err?.error?.error || 'Unbook failed', 'Close', { duration: 3000 }),
    });
  }

  // Helpers
  private replaceSlot(updated: TimeSlot) {
    const idx = this.slots.findIndex((s) => s.id === updated.id);
    if (idx !== -1) this.slots[idx] = updated;
  }

  private formatDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}

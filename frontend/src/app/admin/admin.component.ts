import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EventService, EventCategory, TimeSlot } from '../services/event.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  categories: EventCategory[] = [];
  slots: TimeSlot[] = [];
  loading = true;
  displayedColumns = ['id', 'title', 'category', 'start_time', 'end_time', 'booked_by'];

  newSlot = { title: '', category: 0, start_time: '', end_time: '' };

  constructor(
    private eventService: EventService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.eventService.getCategories().subscribe({
      next: (cats: EventCategory[]) => {
        this.categories = cats;
        this.cdr.detectChanges();
      },
      error: () => console.error('Failed to load categories'),
    });
    this.loadSlots();
  }

  loadSlots() {
    this.loading = true;
    this.eventService.getAdminTimeSlots().subscribe({
      next: (data: TimeSlot[]) => {
        this.slots = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Admin slots error:', err);
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Access denied or failed to load', 'Close', { duration: 3000 });
      },
    });
  }

  addSlot() {
    if (!this.newSlot.title || !this.newSlot.category || !this.newSlot.start_time || !this.newSlot.end_time) {
      this.snackBar.open('Please fill all fields', 'Close', { duration: 3000 });
      return;
    }

    const payload = {
      title: this.newSlot.title,
      category: this.newSlot.category,
      start_time: new Date(this.newSlot.start_time).toISOString(),
      end_time: new Date(this.newSlot.end_time).toISOString(),
    };

    this.eventService.createTimeSlot(payload).subscribe({
      next: () => {
        this.snackBar.open('Timeslot created!', 'Close', { duration: 3000 });
        this.newSlot = { title: '', category: 0, start_time: '', end_time: '' };
        this.loadSlots();
      },
      error: () => this.snackBar.open('Failed to create slot', 'Close', { duration: 3000 }),
    });
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EventService, EventCategory } from '../services/event.service';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './preference.html',
  styleUrls: ['./preference.css'],
})
export class PreferencesComponent implements OnInit {
  categories: EventCategory[] = [];
  selectedCategoryIds: number[] = [];
  loading = true;

  constructor(
    private eventService: EventService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.eventService.getCategories().subscribe((cats) => {
      this.categories = cats;
      this.eventService.getPreferences().subscribe((pref) => {
        this.selectedCategoryIds = pref.categories;
        this.loading = false;
        this.cdr.detectChanges();
      });
    });
  }

  save() {
    this.eventService.updatePreferences(this.selectedCategoryIds).subscribe({
      next: () => {
        this.snackBar.open('Preferences saved!', 'Close', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: () => this.snackBar.open('Failed to save preferences', 'Close', { duration: 3000 }),
    });
  }
}

import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  hidePassword = true;

  constructor(
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  onRegister() {
    this.auth.register(this.username, this.email, this.password).subscribe({
      next: () => {
        this.snackBar.open('Account created! Please login.', 'Close', { duration: 3000 });
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        const msg = err?.error?.username?.[0] || err?.error?.password?.[0] || 'Registration failed';
        this.snackBar.open(msg, 'Close', { duration: 3000 });
      },
    });
  }
}

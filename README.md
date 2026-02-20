# Event Booking Web Application

A full-stack event booking application where users can browse, filter, and book event time slots from a weekly calendar view. Built with **Angular 19 + Angular Material** (frontend) and **Django REST Framework** (backend).

---

## Tech Stack

| Layer      | Technology                                                       |
| ---------- | -----------------------------------------------------------------|
| Frontend   | Angular 21.1.0, Angular Material 21.1.5, Angular CLI 21.1.4      |
| Backend    | Django 4.2.28, Django REST Framework 3.16.1                      |
| Auth       | JWT (SimpleJWT)                                                  |
| Database   | SQLite (development)                                             |

---

## Project Structure

```
event-booking-app/
├── backend/                 # Django REST API
│   ├── config/              # Django project settings
│   ├── events/              # Main app
│   │   ├── management/      # Seed data command
│   │   ├── migrations/      # Database migrations
│   │   ├── models.py        # EventCategory, TimeSlot, UserPreference
│   │   ├── serializers/     # Modular serializers
│   │   ├── tests/           # Unit tests
│   │   ├── views/           # Modular API views
│   │   └── urls.py          # URL routing
│   ├── requirements.txt
│   ├── db.sqlite3
│   └── manage.py
├── frontend/                # Angular 19 application
│   └── src/app/
│       ├── app.routes.ts    # Main routing
│       ├── app.config.ts    # App configuration (providers)
│       ├── auth/            # Login & Register components
│       ├── calendar/        # Weekly calendar view
│       ├── preferences/     # User category preferences
│       ├── admin/           # Admin timeslot management
│       ├── shared/          # Navbar & UI components
│       ├── services/        # API services
│       ├── guards/          # Auth route guard
│       └── interceptors/    # JWT HTTP interceptor
└── README.md
```

---

## Setup Instructions

### Prerequisites

- Python 3.11.9
- Node.js 24.11.0
- Angular CLI (`npm install -g @angular/cli`)

### Backend

```bash
# Create and activate virtual environment
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed sample data (categories + timeslots + admin user)
python manage.py seed_data

# Run tests
python manage.py test events

# Start server
python manage.py runserver
```

The backend runs at **http://localhost:8000**.



### Frontend

```bash
cd frontend
npm install
ng serve
```

The frontend runs at **http://localhost:4200**.

---

## User Roles & Permissions

The application distinguishes between **Normal Users** and **Admins**.

### 1. Admin User
Used for managing the system's available time slots.
- **Login Credentials**: username: `admin` / password: `admin123` (Created via `seed_data`)
- **Capabilities**:
    - Access the **Admin Dashboard** to create new time slots.
    - View and manage all created slots in a list view.
    - Use the **Calendar** and **Preferences** like a normal user.

### 2. Normal User
Used for browsing and booking events.
- **How to Get Started**: Click **Register** on the navbar to create a new account.
- **Capabilities**:
    - Configure **Preferences** to filter the calendar automatically.
    - Browse the **Weekly Calendar** for available slots.
    - **Book** available slots and **Unsubscribe** from their own bookings.

---

## API Documentation

### Authentication

| Method | Endpoint                   | Description         |
| ------ | -------------------------- | ------------------- |
| POST   | `/api/auth/register/`      | Register a new user |
| POST   | `/api/auth/token/`         | Login (get JWT)     |
| POST   | `/api/auth/token/refresh/` | Refresh JWT         |
| GET    | `/api/auth/me/`            | Current user info   |

### Categories

| Method | Endpoint            | Description          |
| ------ | ------------------- | -------------------- |
| GET    | `/api/categories/`  | List all categories  |

### User Preferences

| Method | Endpoint             | Description             |
| ------ | -------------------- | ----------------------- |
| GET    | `/api/preferences/`  | Get user preferences    |
| PUT    | `/api/preferences/`  | Update preferences      |

### Time Slots

| Method | Endpoint                          | Description                    |
| ------ | --------------------------------- | ------------------------------ |
| GET    | `/api/timeslots/?week=YYYY-MM-DD` | List slots for a week          |
| POST   | `/api/book/<slot_id>/`            | Book a slot                    |
| POST   | `/api/unbook/<slot_id>/`          | Cancel a booking               |

### Admin

| Method | Endpoint                | Description       |
| ------ | ----------------------- | ----------------- |
| GET    | `/api/admin/timeslots/` | View all slots    |
| POST   | `/api/admin/timeslots/` | Create a new slot |

---

## Architecture Overview

```
Angular Frontend (port 4200)
        │
        │  REST API + JWT Bearer Token
        ▼
Django REST Framework (port 8000)
        │
        │  ORM
        ▼
    SQLite Database
```

### Data Model

- **EventCategory** — Pre-defined categories (Cat 1, Cat 2, Cat 3)
- **TimeSlot** — A bookable event with FK to category and nullable `booked_by` (FK to User)
- **UserPreference** — One-to-one with User, many-to-many with categories

### Key Business Rules

1. Only **one user** can book a time slot
2. Booked slots remain **visible** but are disabled for other users
3. Only the user who booked a slot can **unsubscribe**
4. Calendar is **scoped to one week** with navigation
5. Slots are **filtered by user preferences** unless a category filter is applied

---

## Assumptions & Design Decisions

- SQLite is used for simplicity — switch to PostgreSQL for production
- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- Admin role uses Django's built-in `is_staff` flag
- No email verification for registration (can be added)
- Week starts on Monday

---

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from ..models import EventCategory, TimeSlot, UserPreference

"""
Creating all test cases in a single file and seperating them in a class.
I haven't created then in seperate file, hope this helps.
"""

class AuthTests(TestCase):
    """Tests for registration, login, and current-user endpoints."""

    def setUp(self):
        self.client = APIClient()

    def test_register_success(self):
        resp = self.client.post("/api/auth/register/", {
            "username": "testuser",
            "email": "test@example.com",
            "password": "securepass123",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="testuser").exists())
        # Should auto-create a UserPreference
        self.assertTrue(UserPreference.objects.filter(user__username="testuser").exists())

    def test_register_duplicate_username(self):
        User.objects.create_user("testuser", password="pass123456")
        resp = self.client.post("/api/auth/register/", {
            "username": "testuser",
            "email": "dup@example.com",
            "password": "securepass123",
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        User.objects.create_user("testuser", password="securepass123")
        resp = self.client.post("/api/auth/token/", {
            "username": "testuser",
            "password": "securepass123",
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp.data)
        self.assertIn("refresh", resp.data)

    def test_current_user(self):
        user = User.objects.create_user("testuser", password="securepass123")
        self.client.force_authenticate(user=user)
        resp = self.client.get("/api/auth/me/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["username"], "testuser")

    def test_current_user_unauthenticated(self):
        resp = self.client.get("/api/auth/me/")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class CategoryTests(TestCase):
    """Tests for the categories endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user("testuser", password="pass123456")
        self.client.force_authenticate(user=self.user)
        EventCategory.objects.create(name="Music")
        EventCategory.objects.create(name="Sports")

    def test_list_categories(self):
        resp = self.client.get("/api/categories/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 2)


class PreferenceTests(TestCase):
    """Tests for the preferences endpoint."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user("testuser", password="pass123456")
        self.client.force_authenticate(user=self.user)
        self.cat1 = EventCategory.objects.create(name="Music")
        self.cat2 = EventCategory.objects.create(name="Sports")

    def test_get_preferences_auto_created(self):
        resp = self.client.get("/api/preferences/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["categories"], [])

    def test_update_preferences(self):
        """first GET to auto-create"""
        self.client.get("/api/preferences/")
        resp = self.client.put("/api/preferences/", {
            "categories": [self.cat1.id, self.cat2.id],
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(sorted(resp.data["categories"]), sorted([self.cat1.id, self.cat2.id]))


class BookingTests(TestCase):
    """Tests for booking and unbooking time slots."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user("testuser", password="pass123456")
        self.other_user = User.objects.create_user("otheruser", password="pass123456")
        self.client.force_authenticate(user=self.user)
        self.cat = EventCategory.objects.create(name="Music")
        self.slot = TimeSlot.objects.create(
            category=self.cat,
            title="Concert",
            start_time="2026-02-20T10:00:00Z",
            end_time="2026-02-20T11:00:00Z",
        )

    def test_book_available_slot(self):
        resp = self.client.post(f"/api/book/{self.slot.id}/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.slot.refresh_from_db()
        self.assertEqual(self.slot.booked_by, self.user)

    def test_book_already_booked_slot(self):
        self.slot.booked_by = self.other_user
        self.slot.save()
        resp = self.client.post(f"/api/book/{self.slot.id}/")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_book_nonexistent_slot(self):
        resp = self.client.post("/api/book/9999/")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_unbook_own_slot(self):
        self.slot.booked_by = self.user
        self.slot.save()
        resp = self.client.post(f"/api/unbook/{self.slot.id}/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.slot.refresh_from_db()
        self.assertIsNone(self.slot.booked_by)

    def test_unbook_others_slot(self):
        self.slot.booked_by = self.other_user
        self.slot.save()
        resp = self.client.post(f"/api/unbook/{self.slot.id}/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


class AdminTests(TestCase):
    """Tests for admin timeslot management."""

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser("admin", password="adminpass123")
        self.user = User.objects.create_user("testuser", password="pass123456")
        self.cat = EventCategory.objects.create(name="Music")
        TimeSlot.objects.create(
            category=self.cat,
            title="Event 1",
            start_time="2026-02-20T10:00:00Z",
            end_time="2026-02-20T11:00:00Z",
        )

    def test_admin_list_timeslots(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.get("/api/admin/timeslots/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)

    def test_admin_create_timeslot(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post("/api/admin/timeslots/", {
            "title": "New Event",
            "category": self.cat.id,
            "start_time": "2026-02-21T14:00:00Z",
            "end_time": "2026-02-21T15:00:00Z",
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TimeSlot.objects.count(), 2)

    def test_non_admin_denied(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.get("/api/admin/timeslots/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

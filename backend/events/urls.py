from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

urlpatterns = [
    # auth urls
    path("auth/register/", views.RegisterView.as_view(), name="register"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", views.current_user, name="current_user"),
    # categories
    path("categories/", views.CategoryListView.as_view(), name="category_list"),
    # Preferences
    path("preferences/", views.PreferenceView.as_view(), name="preferences"),
    # time slots
    path("timeslots/", views.TimeSlotListView.as_view(), name="timeslot_list"),
    path("book/<int:slot_id>/", views.BookSlotView.as_view(), name="book_slot"),
    path("unbook/<int:slot_id>/", views.UnbookSlotView.as_view(), name="unbook_slot"),
    # admin
    path(
        "admin/timeslots/",
        views.AdminTimeSlotListCreateView.as_view(),
        name="admin_timeslots",
    ),
]
# Class-Based Views (CBV)
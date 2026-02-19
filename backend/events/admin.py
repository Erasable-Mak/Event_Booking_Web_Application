from django.contrib import admin
from .models import EventCategory, TimeSlot, UserPreference


@admin.register(EventCategory)
class EventCategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name")


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "category", "start_time", "end_time", "booked_by")
    list_filter = ("category",)


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ("user",)

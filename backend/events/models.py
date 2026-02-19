from django.db import models
from django.contrib.auth.models import User


class EventCategory(models.Model):
    """Predefined event categories (Cat 1, Cat 2, Cat 3)."""

    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = "Event Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class TimeSlot(models.Model):
    """A bookable time slot belonging to an event category.

    Only one user can book a slot at a time (booked_by is nullable).
    """

    category = models.ForeignKey(
        EventCategory,
        on_delete=models.CASCADE,
        related_name="timeslots",
    )
    title = models.CharField(max_length=200, default="Event")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    booked_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="booked_slots",
    )

    class Meta:
        ordering = ["start_time"]

    def __str__(self):
        status = f"Booked by {self.booked_by}" if self.booked_by else "Available"
        return f"{self.title} ({self.category}) — {self.start_time:%Y-%m-%d %H:%M} [{status}]"


class UserPreference(models.Model):
    """Stores which event categories a user is interested in."""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="preference",
    )
    categories = models.ManyToManyField(EventCategory, blank=True)

    def __str__(self):
        return f"Preferences for {self.user.username}"

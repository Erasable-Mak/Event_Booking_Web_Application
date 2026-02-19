from datetime import timedelta

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.utils import timezone

from events.models import EventCategory, TimeSlot


class Command(BaseCommand):
    help = "Seed the database with categories, an admin user, and sample timeslots"

    def handle(self, *args, **options):
        # create categories
        cat1, _ = EventCategory.objects.get_or_create(name="Cat 1")
        cat2, _ = EventCategory.objects.get_or_create(name="Cat 2")
        cat3, _ = EventCategory.objects.get_or_create(name="Cat 3")
        self.stdout.write(self.style.SUCCESS("Categories created"))

        # create admin user, seed
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser("admin", "admin@example.com", "admin123")
            self.stdout.write(self.style.SUCCESS("Admin user created (admin / admin123)"))
        else:
            self.stdout.write("Admin user already exists")

        # create sample timeslots for the current week
        if TimeSlot.objects.exists():
            self.stdout.write("Timeslots already seeded – skipping")
            return

        now = timezone.now()
        monday = now - timedelta(days=now.weekday())
        monday = monday.replace(hour=0, minute=0, second=0, microsecond=0)

        slots = []
        for day_offset in range(5):  # Mon–Fri range should be
            day = monday + timedelta(days=day_offset)
            for hour, cat in [(9, cat1), (11, cat2), (14, cat3), (16, cat1)]:
                slots.append(
                    TimeSlot(
                        title=f"{cat.name} Session",
                        category=cat,
                        start_time=day.replace(hour=hour),
                        end_time=day.replace(hour=hour + 1),
                    )
                )

        TimeSlot.objects.bulk_create(slots)
        self.stdout.write(
            self.style.SUCCESS(f"{len(slots)} sample timeslots created for this week")
        )

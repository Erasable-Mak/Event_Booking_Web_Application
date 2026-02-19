from datetime import timedelta, datetime

from django.db import transaction
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import TimeSlot, UserPreference
from ..serializers.events import TimeSlotSerializer


class TimeSlotListView(generics.ListAPIView):
    """List time slots for a given week, scoped to user preferences.

    Query params:
        week  – ISO date string (YYYY-MM-DD) for the Monday of the week.
                Defaults to the current week.
        category – Optional category id to filter further.
    """

    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        week_str = self.request.query_params.get("week")
        if week_str:
            try:
                week_start = datetime.strptime(week_str, "%Y-%m-%d")
                week_start = timezone.make_aware(
                    week_start, timezone.get_current_timezone()
                )
            except ValueError:
                week_start = _monday_of(timezone.now())
        else:
            week_start = _monday_of(timezone.now())

        week_end = week_start + timedelta(days=7)

        qs = TimeSlot.objects.filter(
            start_time__gte=week_start,
            start_time__lt=week_end,
        ).select_related("category", "booked_by")

        # Optional category filter
        category_id = self.request.query_params.get("category")
        if category_id:
            qs = qs.filter(category_id=category_id)
        else:
            # Scope to user preferences if no explicit filter
            pref = UserPreference.objects.filter(user=self.request.user).first()
            if pref and pref.categories.exists():
                qs = qs.filter(category__in=pref.categories.all())

        return qs


class BookSlotView(APIView):
    """Book a time slot for the current user."""

    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, slot_id):
        try:
            slot = TimeSlot.objects.select_for_update().get(pk=slot_id)
        except TimeSlot.DoesNotExist:
            return Response(
                {"error": "Slot not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if slot.booked_by is not None:
            return Response(
                {"error": "This slot is already booked"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        slot.booked_by = request.user
        slot.save()
        return Response(TimeSlotSerializer(slot).data)


class UnbookSlotView(APIView):
    """Cancel a booking — only the user who booked it can cancel."""

    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, slot_id):
        try:
            slot = TimeSlot.objects.select_for_update().get(pk=slot_id)
        except TimeSlot.DoesNotExist:
            return Response(
                {"error": "Slot not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if slot.booked_by != request.user:
            return Response(
                {"error": "You did not book this slot"},
                status=status.HTTP_403_FORBIDDEN,
            )

        slot.booked_by = None
        slot.save()
        return Response(TimeSlotSerializer(slot).data)


# helper creation

def _monday_of(dt):
    """Return midnight of the Monday of the week containing *dt*."""
    monday = dt - timedelta(days=dt.weekday())
    return monday.replace(hour=0, minute=0, second=0, microsecond=0)

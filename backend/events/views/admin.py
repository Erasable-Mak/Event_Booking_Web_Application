from rest_framework import generics, permissions

from ..models import TimeSlot
from ..serializers.events import TimeSlotSerializer, TimeSlotCreateSerializer


class AdminTimeSlotListCreateView(generics.ListCreateAPIView):
    """Admin: list all timeslots or create a new one."""

    queryset = TimeSlot.objects.select_related("category", "booked_by").all()
    permission_classes = [permissions.IsAdminUser]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TimeSlotCreateSerializer
        return TimeSlotSerializer

from rest_framework import generics, permissions

from ..models import EventCategory
from ..serializers.events import EventCategorySerializer


class CategoryListView(generics.ListAPIView):
    """List all event categories."""

    queryset = EventCategory.objects.all()
    serializer_class = EventCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

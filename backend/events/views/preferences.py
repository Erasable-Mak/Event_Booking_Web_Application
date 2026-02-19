from rest_framework import generics, permissions

from ..models import UserPreference
from ..serializers.events import UserPreferenceSerializer


class PreferenceView(generics.RetrieveUpdateAPIView):
    """Get or update the current user's category preferences."""

    serializer_class = UserPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj, _ = UserPreference.objects.get_or_create(user=self.request.user)
        return obj

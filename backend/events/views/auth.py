from django.contrib.auth.models import User
from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from ..serializers.auth import RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    """Register a new user account."""

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def current_user(request):
    """Return the currently authenticated user."""
    return Response(UserSerializer(request.user).data)

from rest_framework import serializers
from ..models import EventCategory, TimeSlot, UserPreference

class EventCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EventCategory
        fields = ('id', 'name')

class TimeSlotSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    booked_by_username = serializers.ReadOnlyField(source='booked_by.username')

    class Meta:
        model = TimeSlot
        fields = (
            'id', 'category', 'category_name', 'title', 
            'start_time', 'end_time', 'booked_by', 'booked_by_username'
        )

class TimeSlotCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ('category', 'title', 'start_time', 'end_time')

class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = ('id', 'user', 'categories')
        read_only_fields = ('user',)

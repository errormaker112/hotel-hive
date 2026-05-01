from rest_framework import serializers
from users.models import Hotel
class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = '__all__'
        extra_kwargs = {
            'id':{"required":False},
            'image':{"required":False},
            'email':{"required":False},
            'phone_number':{"required":False},
            'address':{"required":False},
            'floors':{"required":False},
            'ground_floor_rooms':{"required":False},
            'total_rooms':{"required":False},
        }
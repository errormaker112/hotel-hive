from rest_framework import serializers
from .models import Booking
class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'
        extra_kwargs = {
            'id':{'required':False},
            'hotel':{'required':False},
            'customer':{'required':False},
            'room':{'required':False},
            'booked_on':{'required':False},
            'check_in':{'required':False},
            'check_out':{'required':False},
            'no_of_person':{'required':False},
            'breakfast':{'required':False},
            'lunch':{'required':False},
            'dinner':{'required':False},
            'laundry':{'required':False},
            'bike_rent':{'required':False},
            'car_rent':{'required':False},
        }
from rest_framework import serializers
from .models import Room
class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'
        extra_kwargs = {
            'id':{'required':False},
            'floor':{'required':False},
            'name':{'required':False},
            'hotel':{'required':False},
            'is_occupied':{'required':False},
            'beds':{'required':False},
        }
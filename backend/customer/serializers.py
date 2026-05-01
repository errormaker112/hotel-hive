from rest_framework import serializers
from .models import Customer
class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'
        extra_kwargs = {
            'id':{'required':False},
            'phone_number':{'required':False},
            'hotel':{'required':False},
            'first_name':{'required':False},
            'last_name':{'required':False},
            'email':{'required':False},
            'address':{'required':False},
            'id_proof':{'required':False},
            'document':{'required':False},
        }
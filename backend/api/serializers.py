from rest_framework import serializers
from django.contrib.auth import get_user_model
from users.models import Owner, Manager
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = User
        fields = '__all__'
        extra_kwargs = {
            'password':{'write_only':True, 'required':False},
            'gender':{'required':False},
            'phone_number':{'required':False},
            'address':{'required':False},
            'profile_image':{'required':False},
            'role':{'required':False},
            }

    def create(self, validated_data):

        user = User.objects.create_user(**validated_data)
        return user

class OwnerSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Owner
        fields = ['user', 'company_name']
        extra_kwargs = {
            'company_name':{'required':False},
        }

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['role'] = 'Owner'
        user_serializer = UserSerializer(data=user_data)
        if user_serializer.is_valid():
            user = user_serializer.save()
            owner = Owner.objects.create(user=user, **validated_data)
            return owner
        else:
            raise serializers.ValidationError(user_serializer.errors)
    


class ManagerSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta(object):
        model = Manager
        fields = ['user', 'owner', 'hotel']
        extra_kwargs = {

        }
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['role'] = 'Manager'
        user_serializer = UserSerializer(data=user_data)
        if user_serializer.is_valid():
            user = user_serializer.save()
            manager = Manager.objects.create(user=user, **validated_data)
            return manager
        else:
            raise serializers.ValidationError(user_serializer.errors)
        
    
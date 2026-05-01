from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from django.forms.models import model_to_dict
from rest_framework import status
from django.core.files.storage import FileSystemStorage
import json
from .models import Owner, Manager, CustomUser, Hotel
from api.serializers import OwnerSerializer, ManagerSerializer
# Create your views here.

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createManagerView(request):
    user = request.user
    if user.role!='Owner':
        return Response(data={'detail':'you are not allowed to create manager account.'}, status=status.HTTP_401_UNAUTHORIZED)
    data = json.loads(request.data.get('data',"{ }"))
    if data['user']['password']!=data['user']['password2']:
        return Response(data={'detail': 'password and confirm password do not match.'}, status=status.HTTP_400_BAD_REQUEST)
    data['user'].pop('password2')
    owner = Owner.objects.get(user=user.id)
    
    data['owner'] = owner.id
    manager_serializer = ManagerSerializer(data=data)
    if manager_serializer.is_valid():
        manager = manager_serializer.save()
        serialized_manager = ManagerSerializer(manager)
        return Response(serialized_manager.data, status=status.HTTP_201_CREATED)
    else:
        return Response(data={'detail': 'Invalid request: Validation failed', 'errors': manager_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def createOwnerView(request):
    data = json.loads(request.data.get('data',"{ }"))
    if data['user']['password']!=data['user']['password2']:
        return Response(data={'detail': 'password and confirm password do not match.'}, status=status.HTTP_400_BAD_REQUEST)
    data['user'].pop('password2')

    
    owner_serializer = OwnerSerializer(data=data)
    if owner_serializer.is_valid():
        owner = owner_serializer.save()
        serialized_owner = OwnerSerializer(owner)
        return Response(serialized_owner.data, status=status.HTTP_201_CREATED)
    else:
        return Response(data={'detail': 'Invalid request: Validation failed', 'errors': owner_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getManager(request):
    try:
        manager = Manager.objects.get(user=request.user.id)  # Get the manager profile if it exists
    except Manager.DoesNotExist:
         return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)
    
    manager_serializer = ManagerSerializer(manager)
    return Response(manager_serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getOwner(request):
    try:
        owner = Owner.objects.get(user=request.user.id)  # Get the manager profile if it exists
    except Owner.DoesNotExist:
         return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)
    
    owner_serializer = OwnerSerializer(owner)
    return Response(owner_serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def updateProfile(request):
    curUser = request.user
    try:
        data = json.loads(request.data.get('data', '{ }'))
        image = request.FILES.get('profile_image', None)
        user = CustomUser.objects.get(id=request.user.id)
        user.first_name = data['user']['first_name']
        user.last_name = data['user']['last_name']
        user.phone_number = data['user']['phone_number']

        if image:
            file_name = f'Images/profiles/user_{user.id}_{image.name}'
            fs = FileSystemStorage()
            if user.profile_image and fs.exists(user.profile_image.path):
                fs.delete(user.profile_image.path)
            file_name = fs.save(file_name,image)
            user.profile_image = file_name
        user.save()
        if curUser.role=='Owner':
            company_name = data['company_name']
            if company_name:
                owner = Owner.objects.get(user=curUser.id)
                owner.company_name = company_name
                owner.save()


    except Exception as e:
        print(e)
        return(Response({'detail':'Error'},status=status.HTTP_400_BAD_REQUEST))
    return Response({'detail':"data saved"}, status=status.HTTP_200_OK)






@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUserType(request):
    return Response({"role":request.user.role}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getManagerList(request):
    user = request.user
    if user.role!='Owner':
        return Response({'detail':'Only owners can access list of managers.'}, status=status.HTTP_401_UNAUTHORIZED)
    owner = Owner.objects.get(user=user.id)
    managerList = Manager.objects.filter(owner=owner.id)
    managerdata = [{'id':manager.id, 'name':f'{manager.user.first_name} {manager.user.last_name}', 'phone_number':manager.user.phone_number, 'hotel':manager.hotel.name} for manager in managerList]
    
    return Response(managerdata, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deleteManager(request):
    user = request.user
    data = request.data
    if user.role!='Owner':
        return Response({'detail':'Only owners can delete managers.'}, status=status.HTTP_401_UNAUTHORIZED)
    owner = Owner.objects.get(user=user)
    try:
        manager = Manager.objects.get(id=data['manager'])
    except Manager.DoesNotExist:
        return Response({'detail':'Manager does not exists.'}, status=status.HTTP_404_NOT_FOUND)
    if manager.owner.id == owner.id:
        CustomUser.objects.get(id=manager.user.id).delete()
        return Response(status=status.HTTP_200_OK)
    else:
        return Response({'detail':'This manager is not associated with you.'}, status=status.HTTP_400_BAD_REQUEST)
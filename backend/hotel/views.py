import math
from django.shortcuts import render
from rest_framework.decorators import api_view,permission_classes
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
# from .models import Hotel
from django.core.files.storage import FileSystemStorage
from .serializers import HotelSerializer
import json
from users.models import Owner, Manager, Hotel
from room.models import Room
from room.serializers import RoomSerializer
# Create your views here.


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createHotel(request):
    user = request.user
    if user.role=='Owner':
        owner = Owner.objects.get(user=user.id)
        data = json.loads(request.data.get('data', '{ }'))
        hotelData = data['hotel']
        hotelData['owner'] = owner.id

        hotelSerializer = HotelSerializer(data=hotelData)
        if hotelSerializer.is_valid():
            hotel = hotelSerializer.save()
        else:
            return Response({'detail':'Invalid hotel data'}, status=status.HTTP_400_BAD_REQUEST)
        
        imageData = request.FILES.get('image', None)
        if imageData:
            fs =FileSystemStorage()
            file_name = f'hotel_{hotel.id}_{imageData.name}'
            file_name = fs.save(f'Images/hotels/{file_name}', imageData)
            hotel.image = file_name
            hotel.save()
        floorRooms = data.get('floorRooms', [])
        max_floor = max(floorRooms, key=lambda x: x['floor'])['floor']
        max_rooms = max(floorRooms, key=lambda x: x['rooms'])['rooms']
        floor_digits = math.ceil(math.log10(max_floor + 1))
        room_digits = math.ceil(math.log10(max_rooms + 1))
        for i in range(1, hotelData['ground_floor_rooms']+1):
            room_serializer = RoomSerializer(data = {'hotel':hotel.id, 'floor':'Ground Floor', 'name': f'G {i:0{room_digits}}'})
            if room_serializer.is_valid():
                room_serializer.save()
        for floor in floorRooms:
            for room in range(1, floor['rooms'] +1):
                room_serializer = RoomSerializer(data={'hotel':hotel.id, 'floor':floor['floor'], 'name':f"{floor['floor']:0{floor_digits}} {room:0{room_digits}}"})
                if room_serializer.is_valid():
                    room_serializer.save()
        

        return Response(status=status.HTTP_201_CREATED)
    else:
        return Response({'detail':"only owner are allowed to create hotel"}, status=status.HTTP_401_UNAUTHORIZED)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getHotels(request):
    user = request.user
    
    if not hasattr(user, 'role'):
        return Response({'detail': 'User role is missing.'}, status=status.HTTP_400_BAD_REQUEST)

    if user.role == 'Owner':
        owner = Owner.objects.get(user=user.id)
        if owner:
            hotelList = Hotel.objects.filter(owner=owner.id)
            serializedHotelList = HotelSerializer(hotelList, many=True)
            return Response(serializedHotelList.data, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'No owner found for this user.'}, status=status.HTTP_400_BAD_REQUEST)
    
    elif user.role == 'Manager':
        manager = Manager.objects.get(user=user.id)
        hotel = Hotel.objects.filter(id=manager.hotel.id)
        serializedHotel = HotelSerializer(hotel, many=True)
        return Response(serializedHotel.data, status=status.HTTP_200_OK)
    
    else:
        return Response({'detail': 'Unauthorized role or incorrect request.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboardDetails(request):
    user = request.user
    data = {}
    if user.role=='Owner':
        owner = Owner.objects.get(user=user.id)
        hotelList = Hotel.objects.filter(owner=owner.id)
        data['total_hotels'] = hotelList.count()
        data['hotels'] = []
        allRooms = 0
        allOccupancy = 0
        for hotel in hotelList:
            total = Room.objects.filter(hotel=hotel.id).count()
            allRooms+=total
            occupancy = Room.objects.filter(hotel=hotel.id, is_occupied=True).count()
            allOccupancy+=occupancy
            if total!=0:
                data['hotels'].append({"name":hotel.name, "occupancy":(occupancy/total)*100})
        if allRooms!=0:
            data['overall_occupancy'] = (allOccupancy/allRooms)*100
        data['total_rooms'] = allRooms
        data['total_rooms'] = allRooms
    else:
        manager = Manager.objects.get(user=user.id)
        rooms = Room.objects.filter(hotel=manager.hotel.id)
        manager = Manager.objects.get(user=user.id)
        total = rooms.count()
        occupancy = rooms.filter(is_occupied=True).count()
        data["hotel"] = manager.hotel.name
        data["available_rooms"] = total-occupancy
        data["occupied_rooms"] = occupancy
        data["total_rooms"] = total
        if total!=0:
            data["occupancy"] = (occupancy/total)*100
        data["total_beds"] = sum(rooms.values_list('beds', flat=True))
    return Response(data, status=status.HTTP_200_OK)


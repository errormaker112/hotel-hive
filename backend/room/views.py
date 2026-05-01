from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.response import Response
from users.models import Hotel,Owner, Manager
from room.models import Room
from room.serializers import RoomSerializer

# Create your views here.
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getRooms(request):
    user = request.user
    try:
        if user.role == 'Owner':
            owner = Owner.objects.get(user=user.id)
            hotel_ids = Hotel.objects.filter(owner=owner.id).values_list('id', flat=True)
            rooms = Room.objects.filter(hotel__in=hotel_ids)
        elif user.role == 'Manager':
            manager = Manager.objects.get(user=user.id)
            rooms = Room.objects.filter(hotel=manager.hotel.id)
        else:
            return Response({'detail': 'Invalid Role'}, status=status.HTTP_400_BAD_REQUEST)
        serialized_rooms = RoomSerializer(rooms, many=True)
        return Response(serialized_rooms.data, status=status.HTTP_200_OK)
    except Owner.DoesNotExist:
        return Response({'detail': 'Owner not found'}, status=status.HTTP_404_NOT_FOUND)
    except Manager.DoesNotExist:
        return Response({'detail': 'Manager not found'}, status=status.HTTP_404_NOT_FOUND)
    except Hotel.DoesNotExist:
        return Response({'detail': 'Hotel not found'}, status=status.HTTP_404_NOT_FOUND)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def editRoom(request):
    user = request.user
    data = request.data
    if user.role != 'Owner':
        return Response({'detail': 'Only the Owner of this hotel can change the room details.'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        owner = Owner.objects.get(user=user)
    except Owner.DoesNotExist:
        return Response({'detail': 'Owner profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    try:
        room = Room.objects.get(id=data.get('room'))
        hotel = Hotel.objects.get(id=data.get('hotel'))
    except Room.DoesNotExist:
        return Response({'detail': 'Room does not exist.'}, status=status.HTTP_404_NOT_FOUND)
    except Hotel.DoesNotExist:
        return Response({'detail': 'Hotel does not exist.'}, status=status.HTTP_404_NOT_FOUND)

    if hotel.owner != owner:
        return Response({'detail': 'You do not own this hotel.'}, status=status.HTTP_403_FORBIDDEN)

    if room.hotel != hotel:
        return Response({'detail': 'The room does not belong to the specified hotel.'}, status=status.HTTP_400_BAD_REQUEST)

    beds = data.get('beds')
    if beds is None:
        return Response({'detail': 'Beds information is required.'}, status=status.HTTP_400_BAD_REQUEST)

    room.beds = beds
    room.save()

    return Response({'detail': 'Room updated successfully.'}, status=status.HTTP_200_OK)


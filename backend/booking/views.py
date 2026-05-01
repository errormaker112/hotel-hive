
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from users.models import Hotel,Owner, Manager
from room.models import Room
from django.db.models import Q
from customer.models import Customer
from customer.serializers import CustomerSerializer
from .models import Booking
from .serializers import BookingSerializer
from django.core.files.storage import FileSystemStorage
import json
from datetime import datetime
# Create your views here.

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getBookings(request):
    user = request.user
    if user.role=='Owner':
        owner = Owner.objects.get(user=user.id)
        hotelList = Hotel.objects.filter(owner=owner.id).values_list('id', flat=True)
        bookingList = Booking.objects.filter(hotel__in=hotelList)
        serializedList = BookingSerializer(bookingList, many=True)
        return Response(serializedList.data, status=status.HTTP_200_OK)
    else:
        manager = Manager.objects.get(user=user.id)
        bookingList = Booking.objects.filter(hotel=manager.hotel)
        serializedList = BookingSerializer(bookingList, many=True)
        return Response(serializedList.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addBooking(request):
    user = request.user
    data = json.loads(request.data.get('data', '{ }'))
    customerDetails = data.get('customerDetails', None)
    customerDetails['hotel'] = data['hotel']
    bookingDetails = data.get('bookingDetails', None)
    document = request.data.get('document', None)

    check_in = datetime.strptime(bookingDetails['check_in'], '%Y-%m-%d').date()
    check_out = datetime.strptime(bookingDetails['check_out'], '%Y-%m-%d').date()
    if check_in>check_out:
        return Response({'detail':'check out date is invalid.'}, status=status.HTTP_400_BAD_REQUEST)
    hotel = Hotel.objects.get(id=data['hotel'])
    room = Room.objects.get(id=data['room'])
    is_booking_invalid = Booking.objects.filter(room=room.id).filter( ~(Q(check_in__gte=check_out) | Q(check_out__lte=check_in))).exists()
    if is_booking_invalid:
        return Response({'detail':'room is already booked on selected dates'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        customer = Customer.objects.get(phone_number=customerDetails['phone_number'])
    except Customer.DoesNotExist:
        serialized_customer = CustomerSerializer(data=customerDetails)
        if serialized_customer.is_valid():
            customer = serialized_customer.save()
        else:
            Response({'detail':'Customer Details are not valid'}, status=status.HTTP_400_BAD_REQUEST)
    bookingDetails['hotel'] = hotel.id
    bookingDetails['customer'] = customer.id
    bookingDetails['room'] = room.id
    if document:
        fs = FileSystemStorage()
        if fs.exists(customer.document.path):
            fs.delete(customer.document.path)
        file_name = fs.save(f'Guest/Documents/customer_{customer.id}_{document.name}',document)
        customer.document = file_name
        customer.save()

    serialized_booking = BookingSerializer(data=bookingDetails)
    if serialized_booking.is_valid():
        serialized_booking.save()
        return(Response(status=status.HTTP_200_OK))
    else:
        return(Response({'detail':'Invalid Booking details'},status=status.HTTP_400_BAD_REQUEST))
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bookingOperation(request):
    user = request.user
    data = request.data
    try:
        booking = Booking.objects.get(id=data['booking'])
    except Booking.DoesNotExist:
        return Response({'detail':"Booking not found."}, status=status.HTTP_400_BAD_REQUEST)
    operation = data['operation']
    if operation=='cancel':
        if booking.room.is_occupied:
            return Response({'detail':"Please first checkout the booking."}, status=status.HTTP_400_BAD_REQUEST)
        booking.delete()
        return Response({'detail':"Booking cancelled."}, status=status.HTTP_200_OK)
    elif operation=='checkin':
        if  booking.room.is_occupied==False:
            booking.room.is_occupied = True
            booking.room.save()
            booking.save()
            return Response({'detail':"Check in successfull."}, status=status.HTTP_200_OK)
        else:
            return Response({'detail':"Already Checked in."}, status=status.HTTP_200_OK)
    elif operation=='checkout':
        if booking.room.is_occupied:
            booking.room.is_occupied = False
            booking.room.save()
            booking.save()
            return Response({'detail':"Check out successfull."}, status=status.HTTP_200_OK)
        else:
            return Response({'detail':"Already Checked out."}, status=status.HTTP_200_OK)
    else:
        return Response({'detail':"Invalid Operation"}, status=status.HTTP_400_BAD_REQUEST)
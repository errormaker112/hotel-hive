"""
Public booking views — no authentication required.
Add these to your api/urls.py:

    from .public_views import public_hotels, public_rooms, public_bookings, public_book

    path('public/hotels/', public_hotels),
    path('public/rooms/', public_rooms),
    path('public/bookings/', public_bookings),
    path('public/book/', public_book),
"""

import json
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from users.models import Hotel
from room.models import Room
from booking.models import Booking
from customer.models import Customer
from hotel.serializers import HotelSerializer
from room.serializers import RoomSerializer
from booking.serializers import BookingSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def public_hotels(request):
    """Return all hotels publicly."""
    hotels = Hotel.objects.all()
    serializer = HotelSerializer(hotels, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_rooms(request):
    """Return all rooms publicly."""
    rooms = Room.objects.all()
    serializer = RoomSerializer(rooms, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_bookings(request):
    """Return all bookings publicly (for availability check)."""
    bookings = Booking.objects.all().values('id', 'room', 'hotel', 'check_in', 'check_out')
    return Response(list(bookings))


@api_view(['POST'])
@permission_classes([AllowAny])
def public_book(request):
    """Create a booking from public guest form and send confirmation email."""
    try:
        data = json.loads(request.data.get('data', '{}'))
        customer_data = data.get('customerDetails', {})
        booking_data = data.get('bookingDetails', {})
        hotel_id = data.get('hotel')
        room_id = data.get('room')
        floor = data.get('floor')

        # Validate required fields
        required = ['first_name', 'last_name', 'email', 'phone_number', 'address', 'id_proof']
        for field in required:
            if not customer_data.get(field):
                return Response({'detail': f'{field} is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not all([hotel_id, room_id, booking_data.get('check_in'), booking_data.get('check_out')]):
            return Response({'detail': 'Hotel, room and dates are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check room availability
        conflicting = Booking.objects.filter(
            room_id=room_id,
        ).exclude(
            check_out__lte=booking_data['check_in']
        ).exclude(
            check_in__gte=booking_data['check_out']
        )
        if conflicting.exists():
            return Response({'detail': 'Room is not available for selected dates.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create or get customer by phone number (since phone_number is unique)
        customer, created = Customer.objects.get_or_create(
            phone_number=customer_data['phone_number'],
            defaults={
                'first_name': customer_data['first_name'],
                'last_name': customer_data['last_name'],
                'email': customer_data['email'],
                'address': customer_data['address'],
                'id_proof': customer_data['id_proof'],
                'hotel_id': hotel_id,
            }
        )
        # Update details if customer already exists
        if not created:
            customer.first_name = customer_data['first_name']
            customer.last_name = customer_data['last_name']
            customer.email = customer_data['email']
            customer.address = customer_data['address']
            customer.id_proof = customer_data['id_proof']
            customer.hotel_id = hotel_id
            customer.save()

        # Create booking
        booking = Booking.objects.create(
            customer=customer,
            hotel_id=hotel_id,
            room_id=room_id,
            check_in=booking_data['check_in'],
            check_out=booking_data['check_out'],
        )

        # Get hotel and room details for email
        hotel = Hotel.objects.get(id=hotel_id)
        room = Room.objects.get(id=room_id)

        # Send confirmation email
        try:
            send_mail(
                subject=f"Booking Confirmed — {hotel.name}",
                message=build_plain_email(customer, hotel, room, booking),
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[customer.email],
                html_message=build_html_email(customer, hotel, room, booking),
                fail_silently=True,
            )
        except Exception as e:
            print(f"Email failed: {e}")

        return Response({'detail': 'Booking confirmed successfully.'}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def build_plain_email(customer, hotel, room, booking):
    return f"""
Dear {customer.first_name} {customer.last_name},

Your booking at {hotel.name} is confirmed!

Booking Details:
Hotel      : {hotel.name}
Room       : {room.name}
Check-in   : {booking.check_in}
Check-out  : {booking.check_out}
Booking ID : #{booking.id}

Please present this email at check-in.

Warm regards,
The {hotel.name} Team
Hotel Hive
"""


def build_html_email(customer, hotel, room, booking):
    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F4F1E8;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- Header -->
      <tr>
        <td style="background:#1A1A1A;border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
          <span style="font-family:Georgia,serif;font-size:22px;color:#fff;">
            Hotel <span style="background:#F5C842;color:#1A1A1A;padding:0 5px;border-radius:4px;">Hive</span>
          </span>
        </td>
      </tr>

      <!-- Hero -->
      <tr>
        <td style="background:#F5C842;padding:32px 36px;text-align:center;">
          <div style="font-size:40px;margin-bottom:10px;">🎉</div>
          <h1 style="font-family:Georgia,serif;font-size:26px;color:#1A1A1A;margin:0 0 8px;">Booking Confirmed!</h1>
          <p style="font-size:15px;color:#3A3A2A;margin:0;">Welcome, {customer.first_name}! We look forward to hosting you.</p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="background:#fff;padding:36px;">
          <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 24px;">
            Dear <strong>{customer.first_name} {customer.last_name}</strong>,<br><br>
            Your booking at <strong>{hotel.name}</strong> has been confirmed. Please find your booking details below.
          </p>

          <!-- Booking details -->
          <table width="100%" cellpadding="0" cellspacing="0"
            style="background:#FAFAF7;border:1px solid #EDE8D8;border-radius:12px;overflow:hidden;margin-bottom:24px;">
            <tr>
              <td style="padding:14px 20px;border-bottom:1px solid #EDE8D8;">
                <span style="font-size:11px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:0.05em;">
                  Booking summary
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding:8px 0;font-size:14px;color:#888;width:40%;">Booking ID</td>
                      <td style="padding:8px 0;font-size:14px;color:#888;">#{booking.id}</td></tr>
                  <tr style="border-top:1px solid #F4F1E8;">
                      <td style="padding:8px 0;font-size:14px;color:#888;">Hotel</td>
                      <td style="padding:8px 0;font-size:14px;color:#1A1A1A;font-weight:500;">{hotel.name}</td></tr>
                  <tr style="border-top:1px solid #F4F1E8;">
                      <td style="padding:8px 0;font-size:14px;color:#888;">Room</td>
                      <td style="padding:8px 0;font-size:14px;color:#1A1A1A;font-weight:500;">{room.name}</td></tr>
                  <tr style="border-top:1px solid #F4F1E8;">
                      <td style="padding:8px 0;font-size:14px;color:#888;">Check-in</td>
                      <td style="padding:8px 0;font-size:14px;color:#1A1A1A;font-weight:500;">{booking.check_in}</td></tr>
                  <tr style="border-top:1px solid #F4F1E8;">
                      <td style="padding:8px 0;font-size:14px;color:#888;">Check-out</td>
                      <td style="padding:8px 0;font-size:14px;color:#1A1A1A;font-weight:500;">
                        <span style="background:#FEF9EC;color:#B89A00;padding:2px 10px;border-radius:20px;">{booking.check_out}</span>
                      </td></tr>
                </table>
              </td>
            </tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0"
            style="background:#FFF8E1;border:1px solid #F5C842;border-radius:10px;margin-bottom:28px;">
            <tr>
              <td style="padding:14px 18px;font-size:14px;color:#7A6000;line-height:1.6;">
                📋 Please present this email at the front desk during check-in.
              </td>
            </tr>
          </table>

          <p style="font-size:15px;color:#555;line-height:1.7;margin:0;">
            Thank you for choosing <strong>{hotel.name}</strong>. We look forward to welcoming you!
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#1A1A1A;border-radius:0 0 16px 16px;padding:24px 36px;text-align:center;">
          <p style="font-size:13px;color:rgba(255,255,255,0.4);margin:0 0 6px;">
            {hotel.name} · Powered by Hotel Hive
          </p>
          <p style="font-size:12px;color:rgba(255,255,255,0.25);margin:0;">
            This is an automated confirmation. Please do not reply to this email.
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>
"""
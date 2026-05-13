"""
Razorpay Payment Views for Hotel Hive
Add to backend/api/urls.py:

    from .payment_views import create_order, verify_payment

    path('payment/create-order/', create_order, name='create_order'),
    path('payment/verify/', verify_payment, name='verify_payment'),

Add to backend/settings.py:
    RAZORPAY_KEY_ID = 'your_key_id_here'
    RAZORPAY_KEY_SECRET = 'your_key_secret_here'

Install: pip install razorpay
"""

import razorpay
import hmac
import hashlib
import json
from django.conf import settings
from django.core.mail import send_mail
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from booking.models import Booking
from customer.models import Customer
from users.models import Hotel
from room.models import Room
from datetime import datetime, date


def get_razorpay_client():
    return razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )


def calculate_amount(check_in, check_out):
    """Calculate total amount based on number of nights at ₹500/night."""
    PRICE_PER_NIGHT = 500
    if isinstance(check_in, str):
        check_in = datetime.strptime(check_in, "%Y-%m-%d").date()
    if isinstance(check_out, str):
        check_out = datetime.strptime(check_out, "%Y-%m-%d").date()
    nights = (check_out - check_in).days
    if nights <= 0:
        nights = 1
    return nights * PRICE_PER_NIGHT


@api_view(['POST'])
@permission_classes([AllowAny])
def create_order(request):
    """Create a Razorpay order before payment."""
    try:
        data = request.data
        check_in = data.get('check_in')
        check_out = data.get('check_out')
        guest_name = data.get('guest_name', 'Guest')
        hotel_name = data.get('hotel_name', 'Hotel')

        if not check_in or not check_out:
            return Response({'detail': 'check_in and check_out are required.'}, status=400)

        amount = calculate_amount(check_in, check_out)
        amount_paise = amount * 100  # Razorpay uses paise

        client = get_razorpay_client()
        order = client.order.create({
            'amount': amount_paise,
            'currency': 'INR',
            'payment_capture': 1,
            'notes': {
                'guest_name': guest_name,
                'hotel_name': hotel_name,
                'check_in': check_in,
                'check_out': check_out,
            }
        })

        return Response({
            'order_id': order['id'],
            'amount': amount,
            'amount_paise': amount_paise,
            'currency': 'INR',
            'key_id': settings.RAZORPAY_KEY_ID,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_payment(request):
    """Verify Razorpay payment signature and create booking."""
    try:
        data = request.data
        razorpay_order_id = data.get('razorpay_order_id')
        razorpay_payment_id = data.get('razorpay_payment_id')
        razorpay_signature = data.get('razorpay_signature')
        booking_data_raw = data.get('booking_data')

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response({'detail': 'Payment details missing.'}, status=400)

        # Verify signature
        msg = f"{razorpay_order_id}|{razorpay_payment_id}"
        generated_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            msg.encode(),
            hashlib.sha256
        ).hexdigest()

        if generated_signature != razorpay_signature:
            return Response({'detail': 'Payment verification failed. Invalid signature.'}, status=400)

        # Parse booking data
        booking_data = json.loads(booking_data_raw) if isinstance(booking_data_raw, str) else booking_data_raw
        customer_data = booking_data.get('customerDetails', {})
        dates = booking_data.get('bookingDetails', {})
        hotel_id = booking_data.get('hotel')
        room_id = booking_data.get('room')

        # Calculate amount
        amount = calculate_amount(dates['check_in'], dates['check_out'])

        # Create or update customer
        customer, _ = Customer.objects.get_or_create(
            phone_number=customer_data['phone_number'],
            defaults={
                'first_name': customer_data['first_name'],
                'last_name': customer_data['last_name'],
                'email': customer_data.get('email', ''),
                'address': customer_data.get('address', ''),
                'id_proof': customer_data.get('id_proof', ''),
                'hotel_id': hotel_id,
            }
        )
        if customer.email != customer_data.get('email', ''):
            customer.email = customer_data.get('email', '')
            customer.save()

        # Create booking
        booking = Booking.objects.create(
            customer=customer,
            hotel_id=hotel_id,
            room_id=room_id,
            check_in=dates['check_in'],
            check_out=dates['check_out'],
        )

        # Get details for email
        hotel = Hotel.objects.get(id=hotel_id)
        room = Room.objects.get(id=room_id)
        nights = (
            datetime.strptime(dates['check_out'], "%Y-%m-%d") -
            datetime.strptime(dates['check_in'], "%Y-%m-%d")
        ).days

        # Send payment receipt email
        if customer.email:
            try:
                send_mail(
                    subject=f"Payment Receipt — {hotel.name} | Hotel Hive",
                    message=build_plain_receipt(customer, hotel, room, booking, amount, nights, razorpay_payment_id),
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[customer.email],
                    html_message=build_html_receipt(customer, hotel, room, booking, amount, nights, razorpay_payment_id),
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Email failed: {e}")

        return Response({
            'detail': 'Payment verified and booking confirmed!',
            'booking_id': booking.id,
            'payment_id': razorpay_payment_id,
            'amount': amount,
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def build_plain_receipt(customer, hotel, room, booking, amount, nights, payment_id):
    return f"""
Dear {customer.first_name} {customer.last_name},

Your payment has been received and booking confirmed!

Payment Receipt
---------------
Payment ID  : {payment_id}
Booking ID  : #{booking.id}
Hotel       : {hotel.name}
Room        : {room.name}
Check-in    : {booking.check_in}
Check-out   : {booking.check_out}
Nights      : {nights}
Rate        : ₹500 per night
Total Paid  : ₹{amount}

Thank you for choosing {hotel.name}!

Hotel Hive Platform
"""


def build_html_receipt(customer, hotel, room, booking, amount, nights, payment_id):
    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
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
          <div style="font-size:40px;margin-bottom:10px;">✅</div>
          <h1 style="font-family:Georgia,serif;font-size:26px;color:#1A1A1A;margin:0 0 8px;">Payment Successful!</h1>
          <p style="font-size:15px;color:#3A3A2A;margin:0;">Thank you, {customer.first_name}! Your booking is confirmed.</p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="background:#fff;padding:36px;">
          <p style="font-size:15px;color:#333;line-height:1.7;margin:0 0 24px;">
            Dear <strong>{customer.first_name} {customer.last_name}</strong>,<br><br>
            We've received your payment and your booking at <strong>{hotel.name}</strong> is confirmed!
          </p>

          <!-- Payment summary -->
          <table width="100%" cellpadding="0" cellspacing="0"
            style="background:#FAFAF7;border:1px solid #EDE8D8;border-radius:12px;overflow:hidden;margin-bottom:20px;">
            <tr>
              <td style="padding:14px 20px;border-bottom:1px solid #EDE8D8;">
                <span style="font-size:11px;font-weight:500;color:#888;text-transform:uppercase;">Payment Receipt</span>
              </td>
            </tr>
            <tr>
              <td style="padding:20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding:8px 0;font-size:14px;color:#888;width:40%;">Payment ID</td>
                      <td style="padding:8px 0;font-size:13px;color:#888;">{payment_id}</td></tr>
                  <tr style="border-top:1px solid #F4F1E8;">
                      <td style="padding:8px 0;font-size:14px;color:#888;">Booking ID</td>
                      <td style="padding:8px 0;font-size:14px;color:#1A1A1A;font-weight:500;">#{booking.id}</td></tr>
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
                      <td style="padding:8px 0;font-size:14px;color:#1A1A1A;font-weight:500;">{booking.check_out}</td></tr>
                  <tr style="border-top:1px solid #F4F1E8;">
                      <td style="padding:8px 0;font-size:14px;color:#888;">Nights</td>
                      <td style="padding:8px 0;font-size:14px;color:#1A1A1A;font-weight:500;">{nights}</td></tr>
                  <tr style="border-top:1px solid #F4F1E8;">
                      <td style="padding:8px 0;font-size:14px;color:#888;">Rate</td>
                      <td style="padding:8px 0;font-size:14px;color:#1A1A1A;font-weight:500;">₹500 per night</td></tr>
                  <tr style="border-top:2px solid #EDE8D8;background:#FFFBF0;">
                      <td style="padding:12px 0;font-size:15px;color:#1A1A1A;font-weight:700;">Total Paid</td>
                      <td style="padding:12px 0;font-size:18px;color:#1A1A1A;font-weight:700;">₹{amount}</td></tr>
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
            We look forward to welcoming you at <strong>{hotel.name}</strong>!
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
            This is an automated receipt. Please do not reply to this email.
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>
"""
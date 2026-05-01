"""
Analytics view for Hotel Hive.
Add to api/urls.py:
    from .analytics_views import analyticsData
    path('analytics/', analyticsData, name='analytics'),
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from users.models import Owner, Manager, Hotel
from booking.models import Booking
from room.models import Room
from django.db.models import Count
from datetime import datetime, timedelta
import calendar


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analyticsData(request):
    user = request.user
    data = {}

    try:
        if user.role == 'Owner':
            owner = Owner.objects.get(user=user.id)
            hotels = Hotel.objects.filter(owner=owner.id)
            hotel_ids = list(hotels.values_list('id', flat=True))
            bookings = Booking.objects.filter(hotel_id__in=hotel_ids)
        else:
            manager = Manager.objects.get(user=user.id)
            hotel_ids = [manager.hotel.id]
            bookings = Booking.objects.filter(hotel_id=manager.hotel.id)

        # --- Monthly bookings for last 12 months ---
        monthly_bookings = []
        today = datetime.today()
        for i in range(11, -1, -1):
            # Calculate month
            month_date = today.replace(day=1) - timedelta(days=i * 30)
            year = month_date.year
            month = month_date.month
            month_name = calendar.month_abbr[month]

            count = bookings.filter(
                check_in__year=year,
                check_in__month=month
            ).count()

            monthly_bookings.append({
                'month': f"{month_name} {str(year)[2:]}",
                'bookings': count,
            })

        data['monthly_bookings'] = monthly_bookings

        # --- Most booked rooms (top 5) ---
        top_rooms = (
            bookings.values('room__name', 'hotel__name')
            .annotate(total=Count('id'))
            .order_by('-total')[:5]
        )
        data['top_rooms'] = [
            {
                'room': f"{r['room__name']} ({r['hotel__name']})",
                'bookings': r['total'],
            }
            for r in top_rooms
        ]

        # --- Occupancy per hotel ---
        occupancy_data = []
        for hotel_id in hotel_ids:
            hotel = Hotel.objects.get(id=hotel_id)
            total_rooms = Room.objects.filter(hotel=hotel_id).count()
            occupied = Room.objects.filter(hotel=hotel_id, is_occupied=True).count()
            occupancy_data.append({
                'hotel': hotel.name,
                'occupancy': round((occupied / total_rooms * 100), 1) if total_rooms > 0 else 0,
                'total_rooms': total_rooms,
                'occupied': occupied,
            })
        data['occupancy'] = occupancy_data

        # --- Summary stats ---
        total_bookings = bookings.count()
        this_month = bookings.filter(
            check_in__year=today.year,
            check_in__month=today.month
        ).count()
        last_month_date = today.replace(day=1) - timedelta(days=1)
        last_month = bookings.filter(
            check_in__year=last_month_date.year,
            check_in__month=last_month_date.month
        ).count()

        growth = 0
        if last_month > 0:
            growth = round(((this_month - last_month) / last_month) * 100, 1)
        elif this_month > 0:
            growth = 100

        data['summary'] = {
            'total_bookings': total_bookings,
            'this_month': this_month,
            'last_month': last_month,
            'growth': growth,
        }

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
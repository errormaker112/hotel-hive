from users.models import CustomUser, Owner, Manager, Hotel
from room.models import Room
from booking.models import Booking
from customer.models import Customer
from api.models import Contactus

def admin_stats(request):
    # Remove path check to ensure it's available whenever the processor runs
    # Calculate stats with defaults to avoid any None issues
    try:
        stats = {
            'total_registered_users': CustomUser.objects.count() or 0,
            'total_hotel_owners': Owner.objects.count() or 0,
            'total_managers': Manager.objects.count() or 0,
            'total_hotels': Hotel.objects.count() or 0,
            'total_rooms': Room.objects.count() or 0,
            'total_bookings': Booking.objects.count() or 0,
            'active_bookings': Booking.objects.filter(room__is_occupied=True).count() or 0,
            'completed_bookings': Booking.objects.filter(room__is_occupied=False).count() or 0,
            'total_customers': Customer.objects.count() or 0,
            'total_contact_queries': Contactus.objects.count() or 0,
        }
    except Exception:
        stats = {}
    
    return {'admin_stats': stats}

from django.urls import path, re_path
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import CustomTokenObtainPairView
from users.views import *
from hotel.views import *
from room.views import *
from booking.views import *
from customer.views import *
from .views import contactus
from .public_views import public_hotels, public_rooms, public_bookings, public_book
from .analytics_views import analyticsData
from .notification_views import get_notifications, mark_read, mark_all_read
from .email_log_views import get_email_logs
from .approval_views import getPendingOwners, approveOwner, rejectOwner
from .payment_views import create_order, verify_payment

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='get_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('user/owner/register/', createOwnerView, name='ownerregister'),
    path('user/manager/register/', createManagerView, name='managerregister'),
    path('user/owner/', getOwner, name='getowner'),
    path('user/manager/', getManager, name='getmanager'),
    path('user/updateprofile/', updateProfile, name='updateprofile'),
    path('usertype/', getUserType, name='usertype'),
    path('hotel/create/', createHotel, name='createhotel'),
    path('gethotels/', getHotels, name='getHotels'),
    path('getbookings/', getBookings, name='getBookings'),
    path('addbooking/', addBooking, name='addBooking'),
    path('getcustomers/', getCustomers, name='getCustomers'),
    path('getmanagers/', getManagerList, name='getBookings'),
    path('hotel/rooms/', getRooms, name='getRooms'),
    path('hotel/room/edit/', editRoom, name='editRoom'),
    path('manager/delete/', deleteManager, name='deleteManager'),
    path('contactus/', contactus, name='contactus'),
    path('dashboard/', dashboardDetails, name='dashbaordDetails'),
    path('booking/operation/', bookingOperation, name='bookingOperation'),

    # Analytics
    path('analytics/', analyticsData, name='analytics'),

    # Owner Approvals
    path('approvals/pending/', getPendingOwners, name='pending_owners'),
    path('approvals/approve/<int:owner_id>/', approveOwner, name='approve_owner'),
    path('approvals/reject/<int:owner_id>/', rejectOwner, name='reject_owner'),

    # Email Logs
    path('email-logs/', get_email_logs, name='email_logs'),

    # Notifications
    path('notifications/', get_notifications, name='get_notifications'),
    path('notifications/mark-read/<int:notification_id>/', mark_read, name='mark_read'),
    path('notifications/mark-all-read/', mark_all_read, name='mark_all_read'),

    # Payment
    path('payment/create-order/', create_order, name='create_order'),
    path('payment/verify/', verify_payment, name='verify_payment'),

    # Public guest booking routes (no auth required)
    path('public/hotels/', public_hotels, name='public_hotels'),
    path('public/rooms/', public_rooms, name='public_rooms'),
    path('public/bookings/', public_bookings, name='public_bookings'),
    path('public/book/', public_book, name='public_book'),
]
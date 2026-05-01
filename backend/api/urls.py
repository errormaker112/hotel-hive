from django.urls import path, re_path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.views import *
from hotel.views import *
from room.views import *
from booking.views import *
from customer.views import *
from .views import contactus
from .public_views import public_hotels, public_rooms, public_bookings, public_book
from .analytics_views import analyticsData

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='get_token'),
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

    # Public guest booking routes (no auth required)
    path('public/hotels/', public_hotels, name='public_hotels'),
    path('public/rooms/', public_rooms, name='public_rooms'),
    path('public/bookings/', public_bookings, name='public_bookings'),
    path('public/book/', public_book, name='public_book'),
]
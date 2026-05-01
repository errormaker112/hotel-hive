from django.contrib import admin
from .models import Booking

# Register your models here.

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'room', 'hotel', 'check_in', 'check_out', 'booked_on')
    list_filter = ('hotel', 'check_in', 'check_out', 'booked_on')
    search_fields = ('customer__first_name', 'customer__last_name', 'room__name', 'hotel__name')
    ordering = ('-booked_on',)
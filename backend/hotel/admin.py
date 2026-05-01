from django.contrib import admin
from users.models import Hotel

# Register your models here.

@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'email', 'phone_number', 'total_rooms', 'floors')
    list_filter = ('owner',)
    search_fields = ('name', 'email', 'phone_number', 'address')
    ordering = ('name',)
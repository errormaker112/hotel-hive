from django.contrib import admin
from .models import Room

# Register your models here.

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'hotel', 'floor', 'is_occupied', 'beds')
    list_filter = ('hotel', 'is_occupied', 'floor')
    search_fields = ('name', 'hotel__name')
    ordering = ('hotel', 'name')
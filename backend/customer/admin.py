from django.contrib import admin
from .models import Customer

# Register your models here.

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'phone_number', 'hotel', 'id_proof')
    list_filter = ('hotel',)
    search_fields = ('first_name', 'last_name', 'email', 'phone_number', 'id_proof')
    ordering = ('first_name', 'last_name')
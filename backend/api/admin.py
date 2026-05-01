from django.contrib import admin
from .models import Contactus

# Register your models here.

@admin.register(Contactus)
class ContactusAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'submitted_on', 'message_snippet')
    list_filter = ('submitted_on',)
    search_fields = ('name', 'email', 'message')
    ordering = ('-submitted_on',)

    def message_snippet(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    message_snippet.short_description = 'Message'
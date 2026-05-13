from django.contrib import admin
from .models import Contactus, Notification, EmailLog


@admin.register(Contactus)
class ContactusAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'message']
    search_fields = ['name', 'email']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'type', 'user_email', 'is_read', 'created_at']
    list_filter = ['type', 'is_read']
    search_fields = ['user_email', 'title']


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display = ['email_type', 'recipient_name', 'recipient_email', 'hotel_name', 'status', 'sent_at']
    list_filter = ['email_type', 'status']
    search_fields = ['recipient_email', 'recipient_name', 'hotel_name']
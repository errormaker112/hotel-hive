from django.db import models
from django.utils import timezone
from rest_framework import serializers


class Contactus(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()

    def __str__(self):
        return self.name


class ContactusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contactus
        fields = '__all__'


class Notification(models.Model):
    TYPES = [
        ('booking', 'New Booking'),
        ('payment', 'Payment Received'),
        ('checkout', 'Checkout Reminder'),
    ]
    user_email = models.EmailField()
    type = models.CharField(max_length=20, choices=TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.type} - {self.title}"


class EmailLog(models.Model):
    EMAIL_TYPES = [
        ('checkout_today', 'Checkout Reminder - Today'),
        ('checkout_tomorrow', 'Checkout Reminder - Tomorrow'),
        ('booking_confirmation', 'Booking Confirmation'),
        ('payment_receipt', 'Payment Receipt'),
    ]
    STATUS = [
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    ]
    recipient_email = models.EmailField()
    recipient_name = models.CharField(max_length=200)
    email_type = models.CharField(max_length=30, choices=EMAIL_TYPES)
    subject = models.CharField(max_length=300)
    hotel_name = models.CharField(max_length=200, blank=True)
    booking_id = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS, default='sent')
    error_message = models.TextField(blank=True)
    sent_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-sent_at']

    def __str__(self):
        return f"{self.email_type} to {self.recipient_email}"
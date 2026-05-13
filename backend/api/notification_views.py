"""
Notification Views for Hotel Hive.

Add to api/urls.py:
    from .notification_views import get_notifications, mark_read, mark_all_read, create_notification
    path('notifications/', get_notifications, name='get_notifications'),
    path('notifications/mark-read/<int:notification_id>/', mark_read, name='mark_read'),
    path('notifications/mark-all-read/', mark_all_read, name='mark_all_read'),
"""

from django.db import models
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status


# ── Inline model (no separate models.py needed) ──────────────────────────────
# Add this to your api/models.py instead:
#
# class Notification(models.Model):
#     TYPES = [('booking','New Booking'),('payment','Payment Received'),('checkout','Checkout')]
#     user_email = models.EmailField()
#     type = models.CharField(max_length=20, choices=TYPES)
#     title = models.CharField(max_length=200)
#     message = models.TextField()
#     is_read = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)
#     class Meta:
#         ordering = ['-created_at']
# ─────────────────────────────────────────────────────────────────────────────

from .models import Notification
from users.models import Owner, Manager


def get_user_email(user):
    """Get owner email for notifications."""
    try:
        if user.role == 'Manager':
            manager = Manager.objects.get(user=user.id)
            owner_hotel = manager.hotel
            # Notify the owner of this hotel
            from users.models import Hotel
            hotel = Hotel.objects.get(id=owner_hotel.id)
            owner = Owner.objects.get(id=hotel.owner_id)
            return owner.user.email
        return user.email
    except Exception:
        return user.email


def create_notification(user_email, notif_type, title, message):
    """Helper function to create a notification. Call this from other views."""
    try:
        Notification.objects.create(
            user_email=user_email,
            type=notif_type,
            title=title,
            message=message,
        )
    except Exception as e:
        print(f"Failed to create notification: {e}")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """Get all notifications for the logged-in user."""
    try:
        notifications = Notification.objects.filter(
            user_email=request.user.email
        )[:50]

        unread_count = notifications.filter(is_read=False).count()

        data = [
            {
                'id': n.id,
                'type': n.type,
                'title': n.title,
                'message': n.message,
                'is_read': n.is_read,
                'created_at': n.created_at.strftime('%Y-%m-%d %H:%M'),
            }
            for n in notifications
        ]

        return Response({
            'notifications': data,
            'unread_count': unread_count,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_read(request, notification_id):
    """Mark a single notification as read."""
    try:
        notification = Notification.objects.get(
            id=notification_id,
            user_email=request.user.email
        )
        notification.is_read = True
        notification.save()
        return Response({'detail': 'Marked as read.'})
    except Notification.DoesNotExist:
        return Response({'detail': 'Notification not found.'}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    """Mark all notifications as read."""
    Notification.objects.filter(
        user_email=request.user.email,
        is_read=False
    ).update(is_read=True)
    return Response({'detail': 'All marked as read.'})
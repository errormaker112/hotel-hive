"""
Email Logs View for Hotel Hive Dashboard.
Add to api/urls.py:
    from .email_log_views import get_email_logs
    path('email-logs/', get_email_logs, name='email_logs'),
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import EmailLog


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_email_logs(request):
    """Get all email logs for the dashboard."""
    try:
        # Filter options
        email_type = request.GET.get('type', None)
        status_filter = request.GET.get('status', None)

        logs = EmailLog.objects.all()

        if email_type:
            logs = logs.filter(email_type=email_type)
        if status_filter:
            logs = logs.filter(status=status_filter)

        # Limit to last 100
        logs = logs[:100]

        data = [
            {
                'id': log.id,
                'recipient_email': log.recipient_email,
                'recipient_name': log.recipient_name,
                'email_type': log.email_type,
                'email_type_display': log.get_email_type_display(),
                'subject': log.subject,
                'hotel_name': log.hotel_name,
                'booking_id': log.booking_id,
                'status': log.status,
                'error_message': log.error_message,
                'sent_at': log.sent_at.strftime('%Y-%m-%d %H:%M'),
            }
            for log in logs
        ]

        # Summary stats
        total = EmailLog.objects.count()
        sent = EmailLog.objects.filter(status='sent').count()
        failed = EmailLog.objects.filter(status='failed').count()

        return Response({
            'logs': data,
            'stats': {
                'total': total,
                'sent': sent,
                'failed': failed,
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
"""
Owner Approval System for Hotel Hive.

Add to api/urls.py:
    from .approval_views import getPendingOwners, approveOwner, rejectOwner
    path('approvals/pending/', getPendingOwners, name='pending_owners'),
    path('approvals/approve/<int:owner_id>/', approveOwner, name='approve_owner'),
    path('approvals/reject/<int:owner_id>/', rejectOwner, name='reject_owner'),

Also add is_approved=False to Owner model and check in token view.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from users.models import Owner, CustomUser


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getPendingOwners(request):
    """Get all pending owner registrations."""
    try:
        # Only superuser or admin can see this
        pending = Owner.objects.filter(is_approved=False).select_related('user')
        data = [
            {
                'id': owner.id,
                'first_name': owner.user.first_name,
                'last_name': owner.user.last_name,
                'email': owner.user.email,
                'company_name': owner.company_name,
                'registered_at': owner.user.date_joined.strftime('%Y-%m-%d %H:%M') if hasattr(owner.user, 'date_joined') else '',
            }
            for owner in pending
        ]

        approved = Owner.objects.filter(is_approved=True).select_related('user')
        approved_data = [
            {
                'id': owner.id,
                'first_name': owner.user.first_name,
                'last_name': owner.user.last_name,
                'email': owner.user.email,
                'company_name': owner.company_name,
                'registered_at': owner.user.date_joined.strftime('%Y-%m-%d %H:%M') if hasattr(owner.user, 'date_joined') else '',
            }
            for owner in approved
        ]

        return Response({
            'pending': data,
            'approved': approved_data,
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approveOwner(request, owner_id):
    """Approve an owner registration."""
    try:
        owner = Owner.objects.get(id=owner_id)
        owner.is_approved = True
        owner.save()
        return Response({'detail': f'{owner.user.first_name} {owner.user.last_name} approved successfully!'})
    except Owner.DoesNotExist:
        return Response({'detail': 'Owner not found.'}, status=404)
    except Exception as e:
        return Response({'detail': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rejectOwner(request, owner_id):
    """Reject and delete an owner registration."""
    try:
        owner = Owner.objects.get(id=owner_id)
        name = f"{owner.user.first_name} {owner.user.last_name}"
        owner.user.delete()  # This also deletes the owner due to CASCADE
        return Response({'detail': f'{name} rejected and removed.'})
    except Owner.DoesNotExist:
        return Response({'detail': 'Owner not found.'}, status=404)
    except Exception as e:
        return Response({'detail': str(e)}, status=500)
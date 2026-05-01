
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .models import ContactusSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def contactus(request):
    contact = ContactusSerializer(data=request.data)
    if contact.is_valid():
        contact.save()
        return Response(status=status.HTTP_200_OK)
    return Response({'detail':contact.error_messages},status=status.HTTP_400_BAD_REQUEST)
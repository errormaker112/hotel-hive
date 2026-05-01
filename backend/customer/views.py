from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from users.models import Hotel,Owner, Manager
from .models import Customer
from .serializers import CustomerSerializer
# Create your views here.
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getCustomers(request):
    user = request.user
    if user.role=='Owner':
        owner = Owner.objects.get(user=user.id)
        hotelList = Hotel.objects.filter(owner=owner.id).values_list('id', flat=True)
        customerList = Customer.objects.filter(hotel__in=hotelList)
        serializedList = CustomerSerializer(customerList, many=True)
        return Response(serializedList.data, status=status.HTTP_200_OK)
    else:
        manager = Manager.objects.get(user=user.id)
        customerList = Customer.objects.filter(hotel=manager.hotel)
        serializedList = CustomerSerializer(customerList, many=True)
        return Response(serializedList.data, status=status.HTTP_200_OK)

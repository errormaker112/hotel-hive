from django.db import models
from users.models import Hotel
from room.models import Room
from customer.models import Customer

# Create your models here.
class Booking(models.Model):
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)

    booked_on = models.DateTimeField(auto_now_add=True)
    check_in = models.DateField(blank=True)
    check_out = models.DateField(blank=True)
    no_of_person = models.PositiveSmallIntegerField(default=2)
    breakfast = models.BooleanField(default=False)
    lunch = models.BooleanField(default=False)
    dinner = models.BooleanField(default=False)
    laundry = models.BooleanField(default=False)
    bike_rent = models.BooleanField(default=False)
    car_rent = models.BooleanField(default=False)


from django.db import models
from users.models import Hotel
# Create your models here.

class Room(models.Model):
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, blank=True)
    floor = models.CharField(max_length=100, blank=True)
    is_occupied = models.BooleanField(default=False)
    beds = models.PositiveIntegerField(default=2)

    class Meta:
        unique_together = ('hotel', 'name')
    def __str__(self) -> str:
        return f'{self.hotel.name}_{self.name}'

    
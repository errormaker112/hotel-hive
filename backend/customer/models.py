from django.db import models
from users.models import Hotel
# Create your models here.
class Customer(models.Model):
    phone_number = models.CharField(max_length=20, unique=True)
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    address = models.CharField(max_length=200, blank=True)
    id_proof = models.CharField(max_length=100, blank=True)
    document = models.FileField(upload_to='Guest/Documents/', blank=True)
    
    def __str__(self):
        return self.first_name + "_" + self.last_name
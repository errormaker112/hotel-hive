from typing import Any
from django.db import models
from django.contrib.auth.models import AbstractUser
from .manager import UserManager
# Create your models here.

class CustomUser(AbstractUser):
    OWNER = 'Owner'
    MANAGER = 'Manager'
    ROLE_CHOICES = [
        (OWNER, 'Owner'),
        (MANAGER, 'Manager'),
    ]
    
    username = None
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True)
    profile_image = models.ImageField(upload_to='Images/profiles/', blank=True)
    role = models.CharField(max_length=100, choices=ROLE_CHOICES)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email
    

class Owner(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=200, blank=True)
    def __str__(self) -> str:
        return self.user.email
    




class Hotel(models.Model):
    owner = models.ForeignKey(Owner, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='Images/hotels/', null=True, blank=True)
    name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=200, blank=True, null=True)
    floors = models.PositiveIntegerField( default=0, null=True)
    ground_floor_rooms = models.PositiveIntegerField(default=0, null=True)
    total_rooms = models.PositiveIntegerField(default=0, null=True)
    def __str__(self) -> str:
        return self.name


class Manager(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    owner = models.ForeignKey(Owner, on_delete=models.CASCADE)
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, null=True, blank=True) # type: ignore
    def __str__(self) -> str:
        return self.user.email
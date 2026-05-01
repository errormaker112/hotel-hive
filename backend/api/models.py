from django.db import models
from rest_framework import serializers
class Contactus(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    message = models.TextField(max_length=2000)
    submitted_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Contact Us Query"
        verbose_name_plural = "Contact Us Queries"

    def __str__(self) -> str:
        return self.name + ' ' + self.email

class ContactusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contactus
        fields = ['name', 'email', 'message']
        extra_kwarg = {
            
        }
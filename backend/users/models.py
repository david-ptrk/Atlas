from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
import os

def avatar_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1]
    unique_name = f"{uuid.uuid4().hex}{ext}"
    return f"avatars/{unique_name}"

class User(AbstractUser):
    email = models.EmailField(unique=True)
    avatar = models.ImageField(upload_to=avatar_upload_path, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email
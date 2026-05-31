from django.db import models
from django.conf import settings
from pgvector.django import VectorField
import uuid
import os

def document_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1]
    unique_name = f"{uuid.uuid4().hex}{ext}"
    return f"documents/{instance.user.id}/{unique_name}"

class Document(models.Model):
    STATUS_CHOICES = [
        ('processing', 'Processing'),
        ('ready', 'Ready'),
        ('failed', 'Failed'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to=document_upload_path)
    file_type = models.CharField(max_length=50)
    file_size = models.PositiveIntegerField()
    extracted_text = models.TextField(blank=True)
    summary = models.TextField(blank=True)
    embedding = VectorField(dimensions=384, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.user.email})"

class Note(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notes')
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='notes', null=True, blank=True)
    title = models.CharField(max_length=255, blank=True)
    content = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.title} ({self.user.email})"
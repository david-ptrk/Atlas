from django.urls import path
from .views import (DocumentListView, DocumentUploadView, DocumentDetailView,
    DocumentAskView, NoteListView, NoteDetailView)

urlpatterns = [
    path('', DocumentListView.as_view(), name='document-list'),
    path('upload/', DocumentUploadView.as_view(), name='document-upload'),
    path('<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),
    path('<int:pk>/ask/', DocumentAskView.as_view(), name='document-ask'),
    path('notes/', NoteListView.as_view(), name='note-list'),
    path('notes/<int:pk>/', NoteDetailView.as_view(), name='note-detail'),
]
from django.urls import path
from .views import ChatSessionListView, ChatSessionDetailView, ChatMessageView

urlpatterns = [
    path('', ChatSessionListView.as_view(), name='chat-list'),
    path('<int:pk>/', ChatSessionDetailView.as_view(), name='chat-detail'),
    path('<int:pk>/message/', ChatMessageView.as_view(), name='chat-message'),
]
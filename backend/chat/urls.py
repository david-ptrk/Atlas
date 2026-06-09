from django.urls import path
from .views import ChatSessionListView, ChatSessionDetailView, ChatMessageView

urlpatterns = [
    path('', ChatSessionListView.as_view(), name='chat-list'),
    path('<str:pk>/', ChatSessionDetailView.as_view(), name='chat-detail'),
    path('<str:pk>/message/', ChatMessageView.as_view(), name='chat-message'),
]
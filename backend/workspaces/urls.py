from django.urls import path
from .views import WorkspaceListView, WorkspaceDetailView, WorkspaceJoinView, WorkspaceDocumentView

urlpatterns = [
    path('', WorkspaceListView.as_view(), name='workspace-list'),
    path('join/', WorkspaceJoinView.as_view(), name='workspace-join'),
    path('<int:pk>/', WorkspaceDetailView.as_view(), name='workspace-detail'),
    path('<int:pk>/documents/', WorkspaceDocumentView.as_view(), name='workspace-documents'),
    path('<int:pk>/documents/<int:doc_pk>/', WorkspaceDocumentView.as_view(), name='workspace-document-remove'),
]
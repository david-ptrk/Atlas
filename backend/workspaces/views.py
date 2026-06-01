from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import Workspace, WorkspaceMember, WorkspaceDocument
from .serializers import WorkspaceSerializer, WorkspaceDetailSerializer, WorkspaceDocumentSerializer
from documents.models import Document

User = get_user_model()

class WorkspaceListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        owned = Workspace.objects.filter(owner=request.user)
        member_of = Workspace.objects.filter(members__user=request.user)
        workspaces = (owned | member_of).distinct()
        serializer = WorkspaceSerializer(workspaces, many=True, context={'request': request})
        return Response(serializer.data)
    
    def post(self, request):
        name = request.data.get('name', '').strip()
        description = request.data.get('description', '').strip()
        if not name:
            return Response({'error': 'Name is required.'}, status=status.HTTP_400_BAD_REQUEST)
        workspace = Workspace.objects.create(
            name=name,
            description=description,
            owner=request.user
        )
        serializer = WorkspaceSerializer(workspace, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class WorkspaceDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_workspace(self, pk, user):
        try:
            workspace = Workspace.objects.get(pk=pk)
            if workspace.owner == user or workspace.members.filter(user=user).exists():
                return workspace
            return None
        except Workspace.DoesNotExist:
            return None
    
    def get(self, request, pk):
        workspace = self.get_workspace(pk, request.user)
        if not workspace:
            return Response({'error': 'Workspace not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = WorkspaceDetailSerializer(workspace, context={'request': request})
        return Response(serializer.data)
    
    def delete(self, request, pk):
        try:
            workspace = Workspace.objects.get(pk=pk, owner=request.user)
            workspace.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Workspace.DoesNotExist:
            return Response({'error': 'Workspace not found.'}, status=status.HTTP_404_NOT_FOUND)

class WorkspaceJoinView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        invite_code = request.data.get('invite_code', '').strip()
        if not invite_code:
            return Response({'error': 'Invite code is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            workspace = Workspace.objects.get(invite_code=invite_code)
        except Workspace.DoesNotExist:
            return Response({'error': 'Invalid invite code.'}, status=status.HTTP_404_NOT_FOUND)
        
        if workspace.owner == request.user:
            return Response({'error': 'You are the owner of this workspace.'}, status=status.HTTP_400_BAD_REQUEST)
        
        member, created = WorkspaceMember.objects.get_or_create(
            workspace=workspace,
            user=request.user,
            defaults={'role': 'member'}
        )
        if not created:
            return Response({'error': 'You are already a member.'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = WorkspaceSerializer(workspace, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class WorkspaceDocumentView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            workspace = Workspace.objects.get(pk=pk)
            if workspace.owner != request.user and not workspace.members.filter(user=request.user, role__in=['admin', 'member']).exists():
                return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        except Workspace.DoesNotExist:
            return Response({'error': 'Workspace not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        document_id = request.data.get('document_id')
        try:
            document = Document.objects.get(pk=document_id, user=request.user)
        except Document.DoesNotExist:
            return Response({'error': 'Document not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        ws_doc, created = WorkspaceDocument.objects.get_or_create(
            workspace=workspace,
            document=document,
            defaults={'added_by': request.user}
        )
        if not created:
            return Response({'error': 'Document already in workspace.'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'message': 'Document added to workspace.'}, status=status.HTTP_201_CREATED)
    
    def delete(self, request, pk, doc_pk):
        try:
            workspace = Workspace.objects.get(pk=pk)
            if workspace.owner != request.user and not workspace.members.filter(user=request.user, role='admin').exists():
                return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
            WorkspaceDocument.objects.filter(workspace=workspace, document_id=doc_pk).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Workspace.DoesNotExist:
            return Response({'error': 'Workspace not found.'}, status=status.HTTP_404_NOT_FOUND)
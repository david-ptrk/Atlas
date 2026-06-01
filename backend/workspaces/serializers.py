from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Workspace, WorkspaceMember, WorkspaceDocument
from documents.serializers import DocumentSerializer

User = get_user_model()

class MemberSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = WorkspaceMember
        fields = ['id', 'email', 'username', 'role', 'joined_at']

class WorkspaceDocumentSerializer(serializers.ModelSerializer):
    document = DocumentSerializer(read_only=True)
    
    class Meta:
        model = WorkspaceDocument
        fields = ['id', 'document', 'added_at']

class WorkspaceSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    member_count = serializers.SerializerMethodField()
    document_count = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    invite_code = serializers.SerializerMethodField()
    
    class Meta:
        model = Workspace
        fields = ['id', 'name', 'description', 'owner_email', 'invite_code', 'member_count', 'document_count', 'role', 'created_at']
    
    def get_invite_code(self, obj):
        return str(obj.invite_code)
    
    def get_member_count(self, obj):
        return obj.members.count()
    
    def get_document_count(self, obj):
        return obj.documents.count()
    
    def get_role(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        if obj.owner == request.user:
            return 'owner'
        member = obj.members.filter(user=request.user).first()
        return member.role if member else None

class WorkspaceDetailSerializer(WorkspaceSerializer):
    members = MemberSerializer(many=True, read_only=True)
    documents = WorkspaceDocumentSerializer(many=True, read_only=True)
    
    class Meta(WorkspaceSerializer.Meta):
        fields = WorkspaceSerializer.Meta.fields + ['members', 'documents']
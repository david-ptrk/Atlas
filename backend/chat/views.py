from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatSessionDetailSerializer, ChatMessageSerializer
from documents.models import Document
from documents.utils import generate_embedding, research_chat
from pgvector.django import CosineDistance
from django.db import models

class ChatSessionListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        sessions = ChatSession.objects.filter(user=request.user)
        serializer = ChatSessionSerializer(sessions, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        title = request.data.get('title', 'New Chat')
        session = ChatSession.objects.create(user=request.user, title=title)
        serializer = ChatSessionDetailSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ChatSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            session = ChatSession.objects.get(id=pk, user=request.user)
            serializer = ChatSessionDetailSerializer(session)
            return Response(serializer.data)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Chat not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, pk):
        try:
            session = ChatSession.objects.get(id=pk, user=request.user)
            session.title = request.data.get('title', session.title)
            session.save()
            return Response(ChatSessionSerializer(session).data)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Chat not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, pk):
        try:
            session = ChatSession.objects.get(id=pk, user=request.user)
            session.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Chat not found.'}, status=status.HTTP_404_NOT_FOUND)

class ChatMessageView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            session = ChatSession.objects.get(id=pk, user=request.user)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Chat not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        question = request.data.get('question', '').strip()
        if not question:
            return Response({'error': 'Question is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        ChatMessage.objects.create(session=session, role='user', content=question)
        
        query_embedding = generate_embedding(question)
        if query_embedding:
            relevant_docs = Document.objects.filter(
                user=request.user,
                embedding__isnull=False
            ).annotate(
                distance=CosineDistance('embedding', query_embedding)
            ).filter(
                distance__lt=0.9
            ).order_by('distance')[:5]
        else:
            relevant_docs = Document.objects.filter(
                user=request.user
            ).order_by('-created_at')[:5]
        
        context_parts = []
        sources = []
        for doc in relevant_docs:
            if doc.extracted_text:
                context_parts.append(f"Document: {doc.title}\n{doc.extracted_text[:2000]}")
                sources.append({'id': doc.id, 'title': doc.title})
        
        context = "\n\n---\n\n".join(context_parts)
        answer = research_chat(question, context)
        
        assistant_message = ChatMessage.objects.create(
            session=session,
            role='assistant',
            content=answer,
            sources=sources
        )
        
        if session.messages.count() <= 2:
            session.title = question[:60]
            session.save()
        
        return Response({
            'answer': answer,
            'sources': sources,
            'message_id': assistant_message.id
        })
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Document, Note
from .serializers import DocumentSerializer, DocumentDetailSerializer, NoteSerializer
from .utils import extract_text_from_pdf, generate_summary, ask_question
import os
from django.db import models

class DocumentListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        documents = Document.objects.filter(user=request.user)
        serializer = DocumentSerializer(documents, many=True, context={'request': request})
        return Response(serializer.data)

class DocumentUploadView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file type
        allowed_types = ['application/pdf']
        if file.content_type not in allowed_types:
            return Response({'error': 'Only PDF files are supported.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create document record
        document = Document.objects.create(
            user=request.user,
            title=request.data.get('title', file.name),
            file=file,
            file_type=file.content_type,
            file_size=file.size,
            status='processing'
        )
        
        # Extract text and generate summary
        try:
            file_path = document.file.path
            extracted_text = extract_text_from_pdf(file_path)
            summary = generate_summary(extracted_text) if extracted_text else ""
            
            document.extracted_text = extracted_text
            document.summary = summary
            document.status = 'ready'
            document.save()
        except Exception as e:
            document.status = 'failed'
            document.save()
            print(f"Processing error: {e}")
        
        serializer = DocumentSerializer(document, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class DocumentDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            document = Document.objects.get(pk=pk, user=request.user)
            serializer = DocumentDetailSerializer(document, context={'request': request})
            return Response(serializer.data)
        except Document.DoesNotExist:
            return Response({'error': 'Document not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, pk):
        try:
            document = Document.objects.get(pk=pk, user=request.user)
            if document.file and os.path.isfile(document.file.path):
                os.remove(document.file.path)
            document.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Document.DoesNotExist:
            return Response({'error': 'Document not found.'}, status=status.HTTP_404_NOT_FOUND)

class DocumentAskView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            document = Document.objects.get(pk=pk, user=request.user)
        except Document.DoesNotExist:
            return Response({'error': 'Document not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        question = request.data.get('question', '').strip()
        highlighted_text = request.data.get('highlighted_text', '').strip()
        
        if not question:
            return Response({'error': 'Question is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        answer = ask_question(
            document_text = document.extracted_text,
            highlighted_text=highlighted_text,
            question=question
        )
        
        return Response({'answer': answer})

class NoteListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        document_id = request.query_params.get('document')
        if document_id:
            notes = Note.objects.filter(user=request.user, document_id=document_id)
        else:
            notes = Note.objects.filter(user=request.user)
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = NoteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NoteDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            note = Note.objects.get(pk=pk, user=request.user)
            return Response(NoteSerializer(note).data)
        except Note.DoesNotExist:
            return Response({'error': 'Note not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, pk):
        try:
            note = Note.objects.get(pk=pk, user=request.user)
            serializer = NoteSerializer(note, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Note.DoesNotExist:
            return Response({'error': 'Note not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, pk):
        try:
            note = Note.objects.get(pk=pk, user=request.user)
            note.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Note.DoesNotExist:
            return Response({'error': 'Note not found.'}, status=status.HTTP_404_NOT_FOUND)

class DocumentSearchView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response([])
        
        documents = Document.objects.filter(
            user=request.user
        ).filter(
            models.Q(title__icontains=query) |
            models.Q(summary__icontains=query) |
            models.Q(extracted_text__icontains=query)
        )
        
        serializer = DocumentSerializer(documents, many=True, context={'request': request})
        return Response(serializer.data)
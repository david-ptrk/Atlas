from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Document
from .serializers import DocumentSerializer, DocumentUploadSerializer, DocumentDetailSerializer
from .utils import extract_text_from_pdf, generate_summary
import os

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
from django.shortcuts import render
from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import OrganisationModel, PageConfigurationModel
from .serializers import OrganisationSerializer, PageConfigurationSerializer


class CreateOrganisationView(generics.CreateAPIView):
    queryset = OrganisationModel.objects.all()
    serializer_class = OrganisationSerializer
    parser_classes = [MultiPartParser, FormParser]


class OrganisationDetailView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, pk):
        try:
            org = OrganisationModel.objects.get(pk=pk)
        except OrganisationModel.DoesNotExist:
            return Response({"error": "Organisation not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = OrganisationSerializer(org)
        return Response(serializer.data)

    def post(self, request, pk):
        try:
            org = OrganisationModel.objects.get(pk=pk)
        except OrganisationModel.DoesNotExist:
            return Response({"error": "Organisation not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = OrganisationSerializer(org, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
class PageConfigurationView(generics.ListCreateAPIView):
    queryset = PageConfigurationModel.objects.all()
    serializer_class = PageConfigurationSerializer

    def create(self, request, *args, **kwargs):
        is_many = isinstance(request.data, list)
        input_data = request.data if is_many else [request.data]

        for item in input_data:
            exists = PageConfigurationModel.objects.filter(
                page_identifier=item.get('page_identifier'),
                display_order=item.get('display_order'),
                custom_name=item.get('custom_name')
            ).first()

            if not exists:
                serializer = self.get_serializer(data=item)
                serializer.is_valid(raise_exception=True)
                self.perform_create(serializer)

        return Response({"message":"Page configurations created successfully"}, status=status.HTTP_201_CREATED)


class MapPageConfigurationsView(APIView):
    def post(self, request, id):
        try:
            org = OrganisationModel.objects.get(id=id)
        except OrganisationModel.DoesNotExist:
            return Response({"error": "Organisation not found"}, status=status.HTTP_404_NOT_FOUND)

        page_ids = request.data.get("page_config_ids", [])
        pages = PageConfigurationModel.objects.filter(id__in=page_ids)

        if len(page_ids) != pages.count():
            return Response({"error": "Invalid page ids."}, status=status.HTTP_400_BAD_REQUEST)

        org.page_configurations.set(pages)
        org.save()

        return Response({
            "message": f"Mapped {pages.count()} configurations to organisation '{org.name}'"
        }, status=status.HTTP_200_OK)

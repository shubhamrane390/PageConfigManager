
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import LocationHierarchyModel, LocationModel
from .serializers import (
    LocationCreateSerializer,
    LocationHierarchyCreateSerializer,
    LocationHierarchyListSerializer,
    LocationHierarchyRemoveSerializer,
    LocationHierarchyUpdateSerializer,
    LocationListSerializer,
    LocationRemoveSerializer,
    LocationUpdateSerializer,
)


class LocationHierarchyView(APIView):
    def get(self, request):
        hierarchy_id = request.query_params.get("id")
        organisation_id = request.query_params.get("organisation_id")
        if hierarchy_id:
            try:
                obj = LocationHierarchyModel.objects.get(id=hierarchy_id)
                serializer = LocationHierarchyListSerializer(obj, many= True)
                return Response(
                    {
                        "status": True,
                        "message": "LocationHierarchy details",
                        "details": serializer.data,
                        "error": None,
                    }
                )
            except LocationHierarchyModel.DoesNotExist:
                return Response(
                    {
                        "status": False,
                        "message": "Not Found",
                        "details": {},
                        "error": "LocationHierarchy not found",
                    },
                    status=404,
                )
        elif organisation_id:
            try:
                qs = LocationHierarchyModel.objects.filter(organisation_id=organisation_id)
                serializer = LocationHierarchyListSerializer(qs, many=True)
                return Response(
                    {
                        "status": True,
                        "message": "LocationHierarchy details",
                        "details": serializer.data,
                        "error": None,
                    }
                )
            except LocationHierarchyModel.DoesNotExist:
                return Response(
                    {
                        "status": False,
                        "message": "Not Found",
                        "details": {},
                        "error": "LocationHierarchy not found",
                    },
                    status=404,
                )


        else:
            qs = LocationHierarchyModel.objects.all()

        serializer = LocationHierarchyListSerializer(qs, many=True)
        return Response(
                {
                    "status": True,
                    "message": "Filtered LocationHierarchy list",
                    "details": serializer.data,
                    "error": None,
                }
            )

    def post(self, request):
        serializer = LocationHierarchyCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "status": True,
                    "message": "LocationHierarchy created",
                    "details": serializer.data,
                    "error": None,
                },
                status=201,
            )
        return Response(
            {
                "status": False,
                "message": "Validation error",
                "details": {},
                "error": serializer.errors,
            },
            status=400,
        )


class LocationHierarchyUpdateView(APIView):
    def post(self, request):
        serializer = LocationHierarchyUpdateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.update()
            return Response(
                {
                    "status": True,
                    "message": "LocationHierarchy updated",
                    "details": serializer.data,
                    "error": None,
                }
            )
        return Response(
            {
                "status": False,
                "message": "Validation error",
                "details": {},
                "error": serializer.errors,
            },
            status=400,
        )


class LocationHierarchyRemoveView(APIView):
    def post(self, request):
        serializer = LocationHierarchyRemoveSerializer(data=request.data)
        if serializer.is_valid():
            serializer.delete()
            return Response(
                {
                    "status": True,
                    "message": "LocationHierarchy deleted",
                    "details": {},
                    "error": None,
                }
            )
        return Response(
            {
                "status": False,
                "message": "Validation error",
                "details": {},
                "error": serializer.errors,
            },
            status=400,
        )


class LocationView(APIView):
    def get(self, request):
        location_id = request.query_params.get("id")
        organisation_id = request.query_params.get("organisation_id")
        if location_id:
            try:
                obj = LocationModel.objects.get(id=location_id)
                serializer = LocationListSerializer(obj)
                return Response(
                    {
                        "status": True,
                        "message": "Location details",
                        "details": serializer.data,
                        "error": None,
                    }
                )
            except LocationModel.DoesNotExist:
                return Response(
                    {
                        "status": False,
                        "message": "Not Found",
                        "details": {},
                        "error": "Location not found",
                    },
                    status=404,
                )
        else:
            if organisation_id:
                # Filter locations by hierarchy types that belong to the organisation
                qs = LocationModel.objects.filter(
                    hierarchy_type__organisation_id=organisation_id
                )
            else:
                qs = LocationModel.objects.all()  

            serializer = LocationListSerializer(qs, many=True)
            return Response(
                {
                    "status": True,
                    "message": "Filtered location list",
                    "details": serializer.data,
                    "error": None,
                }
            )

    def post(self, request):
        serializer = LocationCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "status": True,
                    "message": "Location created",
                    "details": serializer.data,
                    "error": None,
                },
                status=201,
            )
        return Response(
            {
                "status": False,
                "message": "Validation error",
                "details": {},
                "error": serializer.errors,
            },
            status=400,
        )


class LocationUpdateView(APIView):
    def post(self, request):
        serializer = LocationUpdateSerializer(data=request.data)
        if serializer.is_valid():
            updated_instance = serializer.update(serializer.instance, serializer.validated_data)
            return Response(
                {
                    "status": True,
                    "message": "Location updated",
                    "details": {
                        "id": updated_instance.id,
                        "name": updated_instance.name
                    },
                    "error": None,
                }
            )
        return Response(
            {
                "status": False,
                "message": "Validation error",
                "details": {},
                "error": serializer.errors,
            },
            status=400,
        )



class LocationRemoveView(APIView):
    def post(self, request):
        serializer = LocationRemoveSerializer(data=request.data)
        if serializer.is_valid():
            serializer.delete()
            return Response(
                {
                    "status": True,
                    "message": "Location deleted",
                    "details": {},
                    "error": None,
                }
            )
        return Response(
            {
                "status": False,
                "message": "Validation error",
                "details": {},
                "error": serializer.errors,
            },
            status=400,
        )
    

def get_last_location(org_id):
    try:  
        deepest_hierarchy = LocationHierarchyModel.objects.filter(
            organisation_id=org_id
        ).order_by('-level').first()

        if not deepest_hierarchy:
            return []
  
        lowest_locations = LocationModel.objects.filter(
            hierarchy_type=deepest_hierarchy
        )
        return [loc.name for loc in lowest_locations]
    
    except Exception as e:
        print(f"Error: {e}")
        return []

from django.urls import path

from .views import (
    LocationHierarchyRemoveView,
    LocationHierarchyUpdateView,
    LocationHierarchyView,
    LocationRemoveView,
    LocationUpdateView,
    LocationView,
)

urlpatterns = [
    path(
        "location-hierarchy/",
        LocationHierarchyView.as_view(),
        name="location_hierarchy",
    ),
    path(
        "location-hierarchy/update",
        LocationHierarchyUpdateView.as_view(),
        name="location_hierarchy_update",
    ),
    path(
        "location-hierarchy/remove",
        LocationHierarchyRemoveView.as_view(),
        name="location_hierarchy_remove",
    ),
    path("location/", LocationView.as_view(), name="location"),
    path("location/update", LocationUpdateView.as_view(), name="location_update"),
    path("location/remove", LocationRemoveView.as_view(), name="location_remove"),
]
from django.urls import path
from .views import *


urlpatterns = [
    path('create_organisation/', CreateOrganisationView.as_view(), name='create_organisation'),
    path('organisations/<int:pk>/', OrganisationDetailView.as_view(), name='organisation-detail'),
    path('page_configs/', PageConfigurationView.as_view(), name='page_configs'),
    path('map_org_pages/<int:id>/', MapPageConfigurationsView.as_view(), name='map_org_pages'),
]
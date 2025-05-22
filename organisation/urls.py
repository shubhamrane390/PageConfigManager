from django.urls import path
from .template_views import (
    DashboardView,
    OrganisationListView,
    OrganisationCreateView,
    OrganisationDetailView,
    PageConfigView,
    MappingView,
    dashboard_data,
    organizations_list_api
)
from .views import (
    CreateOrganisationView,
    OrganisationDetailView as OrgAPIDetailView,
    PageConfigurationView,
    MapPageConfigurationsView
)

urlpatterns = [
    # Dashboard
    path('', DashboardView.as_view(), name='dashboard'),
    path('dashboard/data/', dashboard_data, name='dashboard-data'),
    
    # API endpoints
    path('create_organisation/', CreateOrganisationView.as_view(), name='create_organisation_api'),
    path('organisations/<int:pk>/', OrgAPIDetailView.as_view(), name='organisation-detail-api'),
    path('organisations/list/', organizations_list_api, name='organisations-list-api'),
    path('page_configs/', PageConfigurationView.as_view(), name='page_configs_api'),
    path('map_org_pages/<int:id>/', MapPageConfigurationsView.as_view(), name='map_org_pages_api'),
    
    # Template views
    path('organisations/', OrganisationListView.as_view(), name='organisation-list'),
    path('organisations/create/', OrganisationCreateView.as_view(), name='organisation-create'),
    path('organisations/<int:pk>/view/', OrganisationDetailView.as_view(), name='organisation-view'),
    path('page_configs/view/', PageConfigView.as_view(), name='page-config'),
    path('map_org_pages/<int:pk>/view/', MappingView.as_view(), name='mapping-view'),
]
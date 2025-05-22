"""
URL configuration for accesscontrol project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

# Import API views
from organisation.views import (
    CreateOrganisationView, 
    OrganisationDetailView, 
    PageConfigurationView, 
    MapPageConfigurationsView
)

# Import template views
from organisation.template_views import (
    DashboardView, 
    OrganisationListView,
    OrganisationCreateView,
    OrganisationDetailView as OrgTemplateDetailView,
    PageConfigView,
    MappingView,
    dashboard_data
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Dashboard
    path('', DashboardView.as_view(), name='dashboard'),
    path('dashboard/data/', dashboard_data, name='dashboard-data'),
    
    # API endpoints
    path('create_organisation/', CreateOrganisationView.as_view(), name='create_organisation_api'),
    path('organisations/<int:pk>/', OrganisationDetailView.as_view(), name='organisation-detail-api'),
    path('page_configs/', PageConfigurationView.as_view(), name='page_configs_api'),
    path('map_org_pages/<int:id>/', MapPageConfigurationsView.as_view(), name='map_org_pages_api'),
    
    # Template views
    path('organisations/', OrganisationListView.as_view(), name='organisation-list'),
    path('organisations/create/', OrganisationCreateView.as_view(), name='organisation-create'),
    path('organisations/<int:pk>/view/', OrgTemplateDetailView.as_view(), name='organisation-view'),
    path('page_configs/view/', PageConfigView.as_view(), name='page-config'),
    path('map_org_pages/<int:pk>/view/', MappingView.as_view(), name='mapping-view'),
]

# Add static and media URL configurations
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

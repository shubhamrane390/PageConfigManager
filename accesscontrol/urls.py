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
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from organisation.template_views import (
    DashboardView, OrganisationListView, OrganisationCreateView, 
    OrganisationDetailView, PageConfigView, MappingView,
    organizations_list_api, dashboard_data
)
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Dashboard
    path('', DashboardView.as_view(), name='dashboard'),
    path('dashboard/data/', dashboard_data, name='dashboard-data'),
    
    # Organization views
    path('organisations/', OrganisationListView.as_view(), name='organisation-list'),
    path('organisations/create/', OrganisationCreateView.as_view(), name='organisation-create'),
    path('organisations/<int:pk>/view/', OrganisationDetailView.as_view(), name='organisation-detail'),
    path('organisations/list/', organizations_list_api, name='organisations-list-api'),
    
    # Page configuration
    path('page_configs/view/', PageConfigView.as_view(), name='page-config'),
    path('map_org_pages/<int:pk>/view/', MappingView.as_view(), name='mapping'),
    
    # Configuration page
    path('configuration/', TemplateView.as_view(template_name='configuration.html'), name='configuration'),
    
    # User management
    path('users/', TemplateView.as_view(template_name='users/list.html'), name='users-list'),
    
    # Permissions
    path('permissions/', TemplateView.as_view(template_name='permissions/list.html'), name='permissions'),
    
    # Location hierarchy
    path('location_hierarchy/', TemplateView.as_view(template_name='location_hierarchy/list.html'), name='location-hierarchy'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
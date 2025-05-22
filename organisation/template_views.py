from django.shortcuts import render, get_object_or_404
from django.views.generic import TemplateView, ListView, DetailView, CreateView, UpdateView
from django.http import JsonResponse
from .models import OrganisationModel, PageConfigurationModel
from django.utils import timezone


class DashboardView(TemplateView):
    """Dashboard view showing overview of the system"""
    template_name = 'dashboard.html'


class OrganisationListView(TemplateView):
    """View for listing all organizations"""
    template_name = 'organisation/list.html'


class OrganisationCreateView(TemplateView):
    """View for creating a new organization"""
    template_name = 'organisation/create.html'


class OrganisationDetailView(TemplateView):
    """View for displaying organization details"""
    template_name = 'organisation/detail.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['organization_id'] = self.kwargs.get('pk')
        return context


class PageConfigView(TemplateView):
    """View for page configuration management"""
    template_name = 'organisation/page_config.html'


class MappingView(TemplateView):
    """View for mapping page configurations to organizations"""
    template_name = 'organisation/mapping.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['organization_id'] = self.kwargs.get('pk')
        return context


# Organizations list API for AJAX calls
def organizations_list_api(request):
    """API endpoint for organizations list"""
    organizations = []
    for org in OrganisationModel.objects.all():
        created_at = timezone.now().isoformat() if not hasattr(org, 'created_at') else org.created_at.isoformat()
        organizations.append({
            'id': org.id,
            'name': org.name,
            'member_count': 0,  # We'll implement this later
            'created_at': created_at,
        })
    
    return JsonResponse(organizations, safe=False)


# Dashboard data view for AJAX calls
def dashboard_data(request):
    """API endpoint for dashboard data"""
    # Get counts
    organizations_count = OrganisationModel.objects.count()
    page_configs_count = PageConfigurationModel.objects.count()
    
    # Get recent organizations
    recent_organizations = []
    for org in OrganisationModel.objects.all().order_by('-id')[:5]:
        created_at = timezone.now().isoformat() if not hasattr(org, 'created_at') else org.created_at.isoformat()
        recent_organizations.append({
            'id': org.id,
            'name': org.name,
            'created_at': created_at,
        })
    
    # Count mappings
    mappings_count = 0
    for org in OrganisationModel.objects.all():
        mappings_count += org.page_configurations.count()
    
    # Create a simple organization hierarchy for display
    organization_preview = []
    orgs = list(OrganisationModel.objects.all())
    if orgs:
        # For demo purposes, we'll create a sample hierarchy
        root_org = {
            'id': orgs[0].id,
            'name': orgs[0].name,
            'children': []
        }
        
        # Add other orgs as children for visualization
        for org in orgs[1:]:
            root_org['children'].append({
                'id': org.id,
                'name': org.name
            })
        
        organization_preview.append(root_org)
    
    # Sample data for roles (to be implemented with actual user models)
    role_counts = {
        'admin': 2,
        'manager': 3,
        'user': 10
    }
    
    # Sample recent activities (to be implemented with actual activity log)
    recent_activities = [
        {
            'user': 'John Doe',
            'action': 'Created organization: ' + recent_organizations[0]['name'] if recent_organizations else 'New Organization',
            'timestamp': timezone.now().isoformat()
        },
        {
            'user': 'Admin',
            'action': 'Updated page configurations',
            'timestamp': (timezone.now() - timezone.timedelta(hours=2)).isoformat()
        },
        {
            'user': 'Jane Smith',
            'action': 'Added new user',
            'timestamp': (timezone.now() - timezone.timedelta(days=1)).isoformat()
        }
    ]
    
    data = {
        'organizations_count': organizations_count,
        'users_count': sum(role_counts.values()),
        'activities_count': len(recent_activities),
        'page_configs_count': page_configs_count,
        'mappings_count': mappings_count,
        'recent_organizations': recent_organizations,
        'organization_preview': organization_preview,
        'role_counts': role_counts,
        'recent_activities': recent_activities
    }
    
    return JsonResponse(data)
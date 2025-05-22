from django.shortcuts import render, get_object_or_404
from django.views.generic import TemplateView, ListView, DetailView, CreateView, UpdateView
from .models import OrganisationModel, PageConfigurationModel


class DashboardView(TemplateView):
    """Dashboard view showing overview of the system"""
    template_name = 'organisation/dashboard.html'


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


# Dashboard data view for AJAX calls
def dashboard_data(request):
    """API endpoint for dashboard data"""
    from django.http import JsonResponse
    
    # Get counts
    organizations_count = OrganisationModel.objects.count()
    page_configs_count = PageConfigurationModel.objects.count()
    
    # Get recent organizations
    recent_organizations = OrganisationModel.objects.all().order_by('-id')[:5]
    recent_orgs_data = []
    
    for org in recent_organizations:
        recent_orgs_data.append({
            'id': org.id,
            'name': org.name,
            'created_at': org.created_at.isoformat() if hasattr(org, 'created_at') else None,
        })
    
    # Count mappings
    mappings_count = sum(org.page_configurations.count() for org in OrganisationModel.objects.all())
    
    data = {
        'organizations_count': organizations_count,
        'page_configs_count': page_configs_count,
        'mappings_count': mappings_count,
        'recent_organizations': recent_orgs_data
    }
    
    return JsonResponse(data)
from django.contrib import admin
from .models import OrganisationModel, PageConfigurationModel

class OrganisationModelAdmin(admin.ModelAdmin):
    """ Admin class for Organisation Model """
class PageConfigurationModelAdmin(admin.ModelAdmin):
    """ Admin class for Organisation Model """


admin.site.register(OrganisationModel, OrganisationModelAdmin)
admin.site.register(PageConfigurationModel, PageConfigurationModelAdmin)

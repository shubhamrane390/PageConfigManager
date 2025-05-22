from django.db import models


class PageConfigurationModel(models.Model):
    PAGE_CHOICES = [
        ('charts', 'Dashboard'),
        ('display_alerts', 'Alerts'),
        ('cctv_doctor', 'CCTV Doctor'),
        ('select_stream_view', 'VMS'),
        ('people_counting', 'People Counting'),
        ('retail_dashboard', 'Retail Dashboard'),
        ('create_alert', 'Create Alert'),
        ('add_site', 'Add Site'),
        ('select_camera', 'Analytics'),
    ]

    page_identifier = models.CharField(max_length=50, choices=PAGE_CHOICES)
    display_order = models.PositiveIntegerField()
    custom_name = models.CharField(max_length=50)

    def __str__(self):
        return self.custom_name
    
    class Meta:
        ordering = ['display_order']


class OrganisationModel(models.Model):
    name = models.CharField(max_length=100, unique=True)
    logo = models.ImageField(upload_to='organisation_logos/', blank=True, null=True)
    page_configurations = models.ManyToManyField(PageConfigurationModel, related_name="organisations", blank=True)

    def __str__(self):
        return self.name

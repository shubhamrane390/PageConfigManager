from rest_framework import serializers
from .models import PageConfigurationModel, OrganisationModel


class PageConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageConfigurationModel
        fields = '__all__'


class OrganisationSerializer(serializers.ModelSerializer):
    page_configurations = PageConfigurationSerializer(many=True, read_only=True)

    class Meta:
        model = OrganisationModel
        fields = ['id', 'name', 'logo', 'page_configurations']


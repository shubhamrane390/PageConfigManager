from django.contrib import admin
from .models import LocationHierarchyModel, LocationModel


@admin.register(LocationHierarchyModel)
class LocationHierarchyAdmin(admin.ModelAdmin):
    list_display = ('id', 'organisation', 'level', 'name', 'created_at', 'updated_at')
    list_filter = ('organisation', 'level')
    search_fields = ('name',)
    ordering = ('organisation', 'level')


@admin.register(LocationModel)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'hierarchy_type', 'parent', 'path', 'full_name', 'created_at', 'updated_at')
    list_filter = ('hierarchy_type',)
    search_fields = ('name', 'full_name')
    ordering = ('hierarchy_type', 'path')

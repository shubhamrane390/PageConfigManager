from rest_framework import serializers

from .models import LocationHierarchyModel, LocationModel
from django.db import models

# -------- LocationHierarchy Serializers --------


class LocationHierarchyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationHierarchyModel
        fields = "__all__"

    # def validate(self, data):
    #     if LocationHierarchyModel.objects.filter(
    #         organisation=data["organisation"], level=data["level"]
    #     ).exists():
    #         raise serializers.ValidationError("Level already exists for this organisation.")
    #     return data


class LocationHierarchyListSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationHierarchyModel
        fields = "__all__"


class LocationHierarchyUpdateSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()

    def validate_id(self, value):
        if not LocationHierarchyModel.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid ID")
        return value

    def update(self):
        instance = LocationHierarchyModel.objects.get(id=self.validated_data["id"])
        instance.name = self.validated_data["name"]
        instance.save()
        return instance


class LocationHierarchyRemoveSerializer(serializers.Serializer):
    id = serializers.IntegerField()

    def validate_id(self, value):
        if not LocationHierarchyModel.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid ID")
        return value

    def delete(self):
        instance = LocationHierarchyModel.objects.get(id=self.validated_data["id"])
        organisation = instance.organisation
        deleted_level = instance.level

        # Step 1: Delete the current instance
        instance.delete()

        # Step 2: Decrease level of other entries in the same organisation
        LocationHierarchyModel.objects.filter(
            organisation=organisation,
            level__gt=deleted_level
        ).update(level=models.F("level") - 1)


# -------- Location Serializers --------


class LocationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationModel
        fields = "__all__"

    def validate(self, data):
        parent = data.get("parent")
        hierarchy_type = data.get("hierarchy_type")

        if (
            hierarchy_type.level
            != LocationHierarchyModel.objects.filter(organisation=hierarchy_type.organisation)
            .order_by("level")
            .values_list("level", flat=True)
            .first()
            and not parent
        ):
            raise serializers.ValidationError(
                "Parent is required for non-top-level locations."
            )
        if parent and hierarchy_type:
            if parent.hierarchy_type.level > hierarchy_type.level:
                raise serializers.ValidationError(
                    "Child level must be below parent level."
                )

        if parent and parent == self.instance:
            raise serializers.ValidationError("A location cannot be its own parent.")

        if parent and parent.hierarchy_type.organisation != hierarchy_type.organisation:
            raise serializers.ValidationError(
                "Parent and child must belong to the same organisation hierarchy."
            )
        return data


class LocationListSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationModel
        fields = "__all__"


class LocationUpdateSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()

    def validate_id(self, value):
        try:
            instance = LocationModel.objects.get(id=value)
            self.instance = instance  # store instance for DRF usage
            return value
        except LocationModel.DoesNotExist:
            raise serializers.ValidationError("Invalid ID")

    def update(self, instance, validated_data):
        instance.name = validated_data.get("name", instance.name)
        instance.save()
        return instance



class LocationRemoveSerializer(serializers.Serializer):
    id = serializers.IntegerField()

    def validate_id(self, value):
        if not LocationModel.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid ID")
        return value

    def delete(self):
        LocationModel.objects.filter(id=self.validated_data["id"]).delete()
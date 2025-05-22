from django.db import models
from organisation.models import OrganisationModel


class LocationHierarchyModel(models.Model):
    """
    Defines the hierarchy levels for each organisation
    """

    organisation = models.ForeignKey(
        OrganisationModel, on_delete=models.CASCADE, related_name="hierarchy_levels", null=True , blank=True
    )
    level = models.PositiveSmallIntegerField()
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["level"]
        constraints = [
            models.UniqueConstraint(fields=["organisation", "name"], name="unique_org_name"),
            models.UniqueConstraint(fields=["organisation", "level"], name="unique_org_level"),
            models.UniqueConstraint(fields=["organisation", "level", "name"], name="unique_org_level_name"),
        ]


    def __str__(self):
        return f"{self.organisation} - {self.name} (Level {self.level})"


class LocationModel(models.Model):
    """
    Actual locations forming a tree structure with materialized path
    """

    hierarchy_type = models.ForeignKey(LocationHierarchyModel, on_delete=models.PROTECT, null=True, blank=True)
    name = models.CharField(max_length=255)
    parent = models.ForeignKey(
        "LocationModel",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
    )
    path = models.CharField(max_length=1000, editable=False, db_index=True)
    full_name = models.CharField(max_length=1000, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("parent", "name")
        indexes = [
            models.Index(fields=["hierarchy_type", "path"]),
        ]

    def save(self, *args, **kwargs):

        update_children = kwargs.pop("update_children", False)
        if not self.pk:

            super().save(*args, **kwargs)
            update_path = True
        else:

            if self.pk:
                old_instance = LocationModel.objects.get(pk=self.pk)
                update_path = old_instance.parent != self.parent
            else:
                update_path = True

            if not update_path:

                super().save(*args, **kwargs)
                return

            super().save(*args, **kwargs)

        if self.parent:
            self.path = f"{self.parent.path}/{self.pk}"
            self.full_name = f"{self.parent.full_name} > {self.name}"
        else:
            self.path = f"{self.pk}"
            self.full_name = self.name

        super().save(update_fields=["path", "full_name"])

        if update_path or update_children:
            self._update_child_paths()

    def _update_child_paths(self):
        """
        Recursively update paths of all children
        """
        for child in self.children.all():
            if self.path:
                child.path = f"{self.path}/{child.pk}"
            else:
                child.path = f"{child.pk}"

            if self.full_name:
                child.full_name = f"{self.full_name} > {child.name}"
            else:
                child.full_name = child.name

            # Save the child with updated path
            child.save(update_fields=["path", "full_name"], update_children=True)

    @property
    def get_ancestors(self):
        """
        Get all ancestors of this location in order
        """
        if not self.parent:
            return []

        path_ids = self.path.split("/")

        path_ids.pop()

        if not path_ids:
            return []

        path_ids = [int(id_) for id_ in path_ids]

        ancestors = list(LocationModel.objects.filter(pk__in=path_ids))

        return sorted(ancestors, key=lambda x: path_ids.index(x.pk))

    @property
    def get_descendants(self):
        """
        Get all descendants of this location
        """
        return LocationModel.objects.filter(path__startswith=f"{self.path}/")

    @property
    def get_level(self):
        """
        Get the depth level of this location in the tree
        """
        if not self.path:
            return 0
        return self.path.count("/")

    def __str__(self):
        return self.name
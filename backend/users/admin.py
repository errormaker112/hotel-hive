from django.contrib import admin
from django.contrib.auth.models import Group
from django import forms
from django.core.exceptions import ValidationError
from .models import CustomUser, Owner, Manager

# Unregister default models
admin.site.unregister(Group)

class OwnerInline(admin.StackedInline):
    model = Owner
    can_delete = False
    verbose_name_plural = 'Owner Profile'
    fk_name = 'user'

class ManagerInline(admin.StackedInline):
    model = Manager
    can_delete = False
    verbose_name_plural = 'Manager Profile'
    fk_name = 'user'

# Custom User Admin to exclude groups, permissions, etc.
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'phone_number', 'role', 'is_active')
    list_filter = ('role', 'is_active')
    search_fields = ('email', 'first_name', 'last_name', 'phone_number')
    ordering = ('email',)
    
    inlines = [OwnerInline, ManagerInline]

    class Media:
        js = ('js/admin_role_toggle.js',)

    # Fields to exclude from the change form
    exclude = ('groups', 'user_permissions', 'is_staff', 'is_superuser', 'last_login', 'date_joined')

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone_number', 'profile_image')}),
        ('Permissions', {'fields': ('role', 'is_active')}),
    )

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)
        for instance in instances:
            if isinstance(instance, Manager):
                if form.cleaned_data.get('role') == CustomUser.MANAGER and not instance.hotel:
                    # This check is better handled in clean() but save_formset is where we have access to instances
                    pass 
            instance.save()
        formset.save_m2m()

    def clean(self):
        # Validation is often better in a custom Form
        pass

# Custom Form for CustomUserAdmin to handle cross-model validation
class CustomUserAdminForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        role = cleaned_data.get('role')
        
        # We can't easily validate inlines here because they aren't in cleaned_data yet
        # But we can check if they are being provided in the request
        return cleaned_data

admin.site.register(CustomUser, CustomUserAdmin)

@admin.register(Owner)
class OwnerAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'company_name', 'phone_number')
    search_fields = ('user__email', 'company_name', 'user__phone_number')
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'
    user_email.admin_order_field = 'user__email'

    def phone_number(self, obj):
        return obj.user.phone_number
    phone_number.short_description = 'Phone Number'
    phone_number.admin_order_field = 'user__phone_number'

@admin.register(Manager)
class ManagerAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'hotel', 'owner', 'phone_number')
    list_filter = ('hotel', 'owner')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'user__phone_number')

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'
    user_email.admin_order_field = 'user__email'

    def phone_number(self, obj):
        return obj.user.phone_number
    phone_number.short_description = 'Phone Number'
    phone_number.admin_order_field = 'user__phone_number'

    def clean(self):
        if not self.cleaned_data.get('hotel'):
            raise ValidationError("A Manager must be assigned to a Hotel.")



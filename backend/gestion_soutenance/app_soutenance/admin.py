from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    CustomUser, Departement, CandidatProfile, EnseignantProfile,
    SessionSoutenance, Salle, DossierSoutenance, Document,
    Jury, MembreJury, Soutenance
)


# ============================================================================
# ADMIN UTILISATEURS
# ============================================================================

@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'first_name', 'last_name', 'role', 'is_active', 'date_joined']
    list_filter = ['role', 'is_active', 'is_staff', 'date_joined']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-date_joined']

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Informations personnelles', {'fields': ('first_name', 'last_name', 'phone')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Dates importantes', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'first_name', 'last_name', 'role', 'password1', 'password2'),
        }),
    )


# ============================================================================
# ADMIN DÉPARTEMENTS
# ============================================================================

@admin.register(Departement)
class DepartementAdmin(admin.ModelAdmin):
    list_display = ['code', 'nom']
    search_fields = ['code', 'nom']
    ordering = ['nom']


# ============================================================================
# ADMIN PROFILS
# ============================================================================

@admin.register(CandidatProfile)
class CandidatProfileAdmin(admin.ModelAdmin):
    list_display = ['matricule', 'get_full_name', 'cycle', 'departement', 'created_at']
    list_filter = ['cycle', 'departement', 'created_at']
    search_fields = ['matricule', 'user__first_name', 'user__last_name', 'user__email', 'departement__nom']
    readonly_fields = ['created_at', 'updated_at']

    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Nom complet'


@admin.register(EnseignantProfile)
class EnseignantProfileAdmin(admin.ModelAdmin):
    list_display = ['get_full_name', 'grade', 'get_departements', 'created_at']
    list_filter = ['grade', 'departements', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'departements__nom']
    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['departements']

    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Nom complet'

    def get_departements(self, obj):
        return ", ".join([d.code for d in obj.departements.all()])
    get_departements.short_description = 'Départements'


# ============================================================================
# ADMIN SESSIONS ET SALLES
# ============================================================================

@admin.register(SessionSoutenance)
class SessionSoutenanceAdmin(admin.ModelAdmin):
    list_display = ['titre', 'annee_academique', 'niveau_concerne', 'statut', 'date_ouverture', 'date_cloture']
    list_filter = ['statut', 'niveau_concerne', 'annee_academique', 'date_ouverture']
    search_fields = ['titre', 'annee_academique', 'description']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date_ouverture'


@admin.register(Salle)
class SalleAdmin(admin.ModelAdmin):
    list_display = ['nom', 'batiment', 'capacite', 'est_disponible', 'created_at']
    list_filter = ['batiment', 'est_disponible', 'created_at']
    search_fields = ['nom', 'batiment']
    readonly_fields = ['created_at']


# ============================================================================
# ADMIN DOSSIERS
# ============================================================================

class DocumentInline(admin.TabularInline):
    model = Document
    extra = 1
    readonly_fields = ['uploaded_at']


@admin.register(DossierSoutenance)
class DossierSoutenanceAdmin(admin.ModelAdmin):
    list_display = ['get_candidat', 'titre_memoire', 'session', 'statut', 'date_depot', 'date_validation']
    list_filter = ['statut', 'session', 'date_depot', 'candidat__cycle']
    search_fields = ['titre_memoire', 'theme', 'candidat__user__first_name', 'candidat__user__last_name', 'candidat__matricule']
    readonly_fields = ['date_depot', 'created_at', 'updated_at']
    inlines = [DocumentInline]
    date_hierarchy = 'date_depot'

    def get_candidat(self, obj):
        return obj.candidat.user.get_full_name()
    get_candidat.short_description = 'Candidat'


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['nom', 'get_dossier', 'type_piece', 'est_obligatoire', 'uploaded_at']
    list_filter = ['type_piece', 'est_obligatoire', 'uploaded_at']
    search_fields = ['nom', 'dossier__titre_memoire', 'dossier__candidat__user__last_name']
    readonly_fields = ['uploaded_at']

    def get_dossier(self, obj):
        return f"{obj.dossier.candidat.user.get_full_name()} - {obj.dossier.titre_memoire[:30]}..."
    get_dossier.short_description = 'Dossier'


# ============================================================================
# ADMIN JURYS
# ============================================================================

class MembreJuryInline(admin.TabularInline):
    model = MembreJury
    extra = 1
    readonly_fields = ['created_at']
    autocomplete_fields = ['enseignant']


@admin.register(Jury)
class JuryAdmin(admin.ModelAdmin):
    list_display = ['nom', 'session', 'get_nb_membres', 'statut', 'created_at']
    list_filter = ['statut', 'session', 'created_at']
    search_fields = ['nom']
    readonly_fields = ['created_at']
    inlines = [MembreJuryInline]

    def get_nb_membres(self, obj):
        return obj.composition.count()
    get_nb_membres.short_description = 'Nb membres'


@admin.register(MembreJury)
class MembreJuryAdmin(admin.ModelAdmin):
    list_display = ['get_enseignant', 'jury', 'role', 'created_at']
    list_filter = ['role', 'created_at']
    search_fields = ['jury__nom', 'enseignant__user__first_name', 'enseignant__user__last_name']
    readonly_fields = ['created_at']

    def get_enseignant(self, obj):
        return obj.enseignant.user.get_full_name()
    get_enseignant.short_description = 'Enseignant'


# ============================================================================
# ADMIN SOUTENANCES
# ============================================================================

@admin.register(Soutenance)
class SoutenanceAdmin(admin.ModelAdmin):
    list_display = ['get_candidat', 'get_session', 'date_heure', 'salle', 'ordre_passage', 'statut']
    list_filter = ['statut', 'date_heure']
    search_fields = [
        'dossier__candidat__user__first_name',
        'dossier__candidat__user__last_name',
        'dossier__titre_memoire'
    ]
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date_heure'

    def get_candidat(self, obj):
        return obj.dossier.candidat.user.get_full_name()
    get_candidat.short_description = 'Candidat'

    def get_session(self, obj):
        return obj.session.titre
    get_session.short_description = 'Session'

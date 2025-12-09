from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    CustomUser, CandidatProfile, EnseignantProfile,
    SessionSoutenance, Salle, DossierSoutenance, FichierAnnexe,
    Jury, Soutenance, Evaluation, ProcesVerbal,
    Notification, Commentaire
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


@admin.register(CandidatProfile)
class CandidatProfileAdmin(admin.ModelAdmin):
    list_display = ['matricule', 'get_full_name', 'niveau_etude', 'filiere', 'specialite', 'created_at']
    list_filter = ['niveau_etude', 'filiere', 'created_at']
    search_fields = ['matricule', 'user__first_name', 'user__last_name', 'user__email', 'filiere', 'specialite']
    readonly_fields = ['created_at', 'updated_at']

    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Nom complet'


@admin.register(EnseignantProfile)
class EnseignantProfileAdmin(admin.ModelAdmin):
    list_display = ['get_full_name', 'grade', 'departement', 'specialite', 'created_at']
    list_filter = ['grade', 'departement', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'departement', 'specialite']
    readonly_fields = ['created_at', 'updated_at']

    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Nom complet'


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

class FichierAnnexeInline(admin.TabularInline):
    model = FichierAnnexe
    extra = 1


@admin.register(DossierSoutenance)
class DossierSoutenanceAdmin(admin.ModelAdmin):
    list_display = ['get_candidat', 'titre_memoire', 'session', 'statut', 'date_depot', 'date_validation']
    list_filter = ['statut', 'session', 'date_depot', 'candidat__niveau_etude']
    search_fields = ['titre_memoire', 'theme', 'candidat__user__first_name', 'candidat__user__last_name', 'candidat__matricule']
    readonly_fields = ['date_depot', 'created_at', 'updated_at']
    inlines = [FichierAnnexeInline]
    date_hierarchy = 'date_depot'

    def get_candidat(self, obj):
        return obj.candidat.user.get_full_name()
    get_candidat.short_description = 'Candidat'


@admin.register(FichierAnnexe)
class FichierAnnexeAdmin(admin.ModelAdmin):
    list_display = ['nom', 'dossier', 'type_document', 'uploaded_at']
    list_filter = ['type_document', 'uploaded_at']
    search_fields = ['nom', 'dossier__titre_memoire']
    readonly_fields = ['uploaded_at']


# ============================================================================
# ADMIN JURYS
# ============================================================================

@admin.register(Jury)
class JuryAdmin(admin.ModelAdmin):
    list_display = ['nom', 'session', 'get_president', 'get_rapporteur', 'statut', 'created_at']
    list_filter = ['statut', 'session', 'created_at']
    search_fields = ['nom', 'president__user__last_name', 'rapporteur__user__last_name']
    filter_horizontal = ['examinateurs']
    readonly_fields = ['created_at']

    def get_president(self, obj):
        return obj.president.user.get_full_name() if obj.president else '-'
    get_president.short_description = 'Président'

    def get_rapporteur(self, obj):
        return obj.rapporteur.user.get_full_name() if obj.rapporteur else '-'
    get_rapporteur.short_description = 'Rapporteur'


# ============================================================================
# ADMIN SOUTENANCES
# ============================================================================

class EvaluationInline(admin.TabularInline):
    model = Evaluation
    extra = 0
    readonly_fields = ['date_evaluation', 'moyenne']


@admin.register(Soutenance)
class SoutenanceAdmin(admin.ModelAdmin):
    list_display = ['get_candidat', 'session', 'date_heure', 'salle', 'statut', 'note_finale', 'mention']
    list_filter = ['statut', 'session', 'date_heure', 'mention']
    search_fields = [
        'dossier__candidat__user__first_name',
        'dossier__candidat__user__last_name',
        'dossier__titre_memoire'
    ]
    readonly_fields = ['created_at', 'updated_at', 'pv_genere']
    inlines = [EvaluationInline]
    date_hierarchy = 'date_heure'

    def get_candidat(self, obj):
        return obj.dossier.candidat.user.get_full_name()
    get_candidat.short_description = 'Candidat'


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ['soutenance', 'evaluateur', 'note_memoire', 'note_presentation', 'note_reponses', 'moyenne', 'date_evaluation']
    list_filter = ['date_evaluation', 'evaluateur__grade']
    search_fields = ['soutenance__dossier__candidat__user__last_name', 'evaluateur__user__last_name']
    readonly_fields = ['date_evaluation', 'created_at', 'moyenne']


# ============================================================================
# ADMIN PROCES-VERBAUX
# ============================================================================

@admin.register(ProcesVerbal)
class ProcesVerbalAdmin(admin.ModelAdmin):
    list_display = ['numero_pv', 'get_candidat', 'est_valide', 'date_generation', 'date_validation']
    list_filter = ['est_valide', 'date_generation', 'date_validation']
    search_fields = ['numero_pv', 'soutenance__dossier__candidat__user__last_name']
    readonly_fields = ['date_generation', 'created_at']

    def get_candidat(self, obj):
        return obj.soutenance.dossier.candidat.user.get_full_name()
    get_candidat.short_description = 'Candidat'


# ============================================================================
# ADMIN NOTIFICATIONS ET COMMENTAIRES
# ============================================================================

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['destinataire', 'type', 'titre', 'est_lu', 'date_envoi']
    list_filter = ['type', 'est_lu', 'date_envoi']
    search_fields = ['destinataire__email', 'titre', 'message']
    readonly_fields = ['date_envoi', 'created_at']
    date_hierarchy = 'date_envoi'


@admin.register(Commentaire)
class CommentaireAdmin(admin.ModelAdmin):
    list_display = ['auteur', 'dossier', 'est_interne', 'created_at']
    list_filter = ['est_interne', 'created_at']
    search_fields = ['auteur__email', 'contenu', 'dossier__titre_memoire']
    readonly_fields = ['created_at']

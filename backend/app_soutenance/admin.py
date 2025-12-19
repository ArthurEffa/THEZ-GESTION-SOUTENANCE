from django.contrib import admin
from django.utils.html import format_html
from .models import (
    CustomUser, Departement, CandidatProfile, EnseignantProfile,
    SessionSoutenance, Salle, DossierSoutenance, Document,
    Jury, MembreJury, Soutenance
)

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ['email', 'first_name', 'last_name', 'role', 'is_active']
    list_filter = ['role', 'is_active']
    search_fields = ['email', 'first_name', 'last_name']

@admin.register(Departement)
class DepartementAdmin(admin.ModelAdmin):
    list_display = ['code', 'nom']
    search_fields = ['code', 'nom']

@admin.register(CandidatProfile)
class CandidatProfileAdmin(admin.ModelAdmin):
    list_display = ['matricule', 'get_full_name', 'cycle', 'departement']
    search_fields = ['matricule', 'user__first_name', 'user__last_name']
    def get_full_name(self, obj): return obj.user.get_full_name()
    get_full_name.short_description = 'Nom complet'

@admin.register(EnseignantProfile)
class EnseignantProfileAdmin(admin.ModelAdmin):
    list_display = ['get_full_name', 'grade']
    search_fields = ['user__first_name', 'user__last_name']
    def get_full_name(self, obj): return obj.user.get_full_name()
    get_full_name.short_description = 'Nom complet'

@admin.register(SessionSoutenance)
class SessionSoutenanceAdmin(admin.ModelAdmin):
    list_display = ['titre', 'annee_academique', 'statut']
    list_filter = ['statut', 'annee_academique']
    search_fields = ['titre']

@admin.register(Salle)
class SalleAdmin(admin.ModelAdmin):
    list_display = ['nom', 'batiment', 'capacite', 'est_disponible']
    list_filter = ['batiment', 'est_disponible']

class DocumentInline(admin.TabularInline):
    model = Document
    extra = 1
    readonly_fields = ['uploaded_at', 'lien_fichier']
    fields = ['nom', 'type_piece', 'fichier', 'lien_fichier', 'est_obligatoire']

    def lien_fichier(self, obj):
        if obj.fichier:
            return format_html('<a href="{}" target="_blank">Ouvrir</a>', obj.fichier.url)
        return "N/A"
    lien_fichier.short_description = "Lien"

@admin.register(DossierSoutenance)
class DossierSoutenanceAdmin(admin.ModelAdmin):
    list_display = ['get_candidat', 'titre_memoire', 'session', 'statut']
    list_filter = ['statut', 'session']
    search_fields = ['titre_memoire', 'candidat__user__first_name']
    inlines = [DocumentInline]

    def get_candidat(self, obj):
        return obj.candidat.user.get_full_name()
    get_candidat.short_description = 'Candidat'

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['nom', 'get_dossier', 'type_piece', 'lien_fichier']
    search_fields = ['nom', 'dossier__titre_memoire']
    readonly_fields = ['lien_fichier']

    def get_dossier(self, obj):
        return obj.dossier.titre_memoire
    get_dossier.short_description = 'Dossier'

    def lien_fichier(self, obj):
        if obj.fichier:
            return format_html('<a href="{}" target="_blank">Ouvrir</a>', obj.fichier.url)
        return "N/A"
    lien_fichier.short_description = "Lien"

class MembreJuryInline(admin.TabularInline):
    model = MembreJury
    extra = 1

@admin.register(Jury)
class JuryAdmin(admin.ModelAdmin):
    list_display = ['nom', 'session', 'statut']
    list_filter = ['statut', 'session']
    inlines = [MembreJuryInline]

@admin.register(Soutenance)
class SoutenanceAdmin(admin.ModelAdmin):
    list_display = ['dossier', 'date_heure', 'salle', 'statut']
    list_filter = ['statut', 'date_heure', 'salle']

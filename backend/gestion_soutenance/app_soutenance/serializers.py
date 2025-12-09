from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import (
    CustomUser, CandidatProfile, EnseignantProfile,
    SessionSoutenance, Salle, DossierSoutenance, FichierAnnexe,
    Jury, Soutenance, ProcesVerbal, Notification, Commentaire
)


# ============================================================================
# SERIALIZERS UTILISATEURS
# ============================================================================

class CustomUserSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle CustomUser"""

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'role', 'phone', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer pour l'inscription des utilisateurs"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'first_name', 'last_name', 'password', 'password2', 'role', 'phone']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(**validated_data)
        return user


class CandidatProfileSerializer(serializers.ModelSerializer):
    """Serializer pour le profil Candidat"""
    user = CustomUserSerializer(read_only=True)
    user_email = serializers.EmailField(write_only=True, required=False)

    class Meta:
        model = CandidatProfile
        fields = ['id', 'user', 'user_email', 'matricule', 'niveau_etude', 'filiere', 'specialite', 'photo', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class EnseignantProfileSerializer(serializers.ModelSerializer):
    """Serializer pour le profil Enseignant"""
    user = CustomUserSerializer(read_only=True)
    user_email = serializers.EmailField(write_only=True, required=False)

    class Meta:
        model = EnseignantProfile
        fields = ['id', 'user', 'user_email', 'grade', 'departement', 'specialite', 'disponibilites', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


# ============================================================================
# SERIALIZERS SESSIONS ET SALLES
# ============================================================================

class SessionSoutenanceSerializer(serializers.ModelSerializer):
    """Serializer pour SessionSoutenance"""
    created_by = CustomUserSerializer(read_only=True)
    nb_dossiers = serializers.SerializerMethodField()
    nb_soutenances = serializers.SerializerMethodField()

    class Meta:
        model = SessionSoutenance
        fields = [
            'id', 'titre', 'annee_academique', 'date_ouverture', 'date_cloture',
            'niveau_concerne', 'statut', 'description', 'created_by',
            'nb_dossiers', 'nb_soutenances', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_nb_dossiers(self, obj):
        return obj.dossiers.count()

    def get_nb_soutenances(self, obj):
        return obj.soutenances.count()


class SalleSerializer(serializers.ModelSerializer):
    """Serializer pour Salle"""

    class Meta:
        model = Salle
        fields = ['id', 'nom', 'batiment', 'capacite', 'equipements', 'est_disponible', 'created_at']
        read_only_fields = ['id', 'created_at']


# ============================================================================
# SERIALIZERS DOSSIERS
# ============================================================================

class FichierAnnexeSerializer(serializers.ModelSerializer):
    """Serializer pour FichierAnnexe"""

    class Meta:
        model = FichierAnnexe
        fields = ['id', 'dossier', 'nom', 'fichier', 'type_document', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class DossierSoutenanceSerializer(serializers.ModelSerializer):
    """Serializer pour DossierSoutenance"""
    candidat = CandidatProfileSerializer(read_only=True)
    session = SessionSoutenanceSerializer(read_only=True)
    encadreur = EnseignantProfileSerializer(read_only=True)
    fichiers_annexes = FichierAnnexeSerializer(many=True, read_only=True)

    candidat_id = serializers.UUIDField(write_only=True, required=False)
    session_id = serializers.UUIDField(write_only=True)
    encadreur_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = DossierSoutenance
        fields = [
            'id', 'candidat', 'candidat_id', 'session', 'session_id',
            'titre_memoire', 'theme', 'encadreur', 'encadreur_id',
            'memoire_pdf', 'annexes', 'fichiers_annexes', 'statut',
            'date_depot', 'date_validation', 'commentaires_admin',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'date_depot', 'date_validation', 'created_at', 'updated_at']


class DossierSoutenanceListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour liste de dossiers"""
    candidat_nom = serializers.SerializerMethodField()
    session_titre = serializers.SerializerMethodField()
    encadreur_nom = serializers.SerializerMethodField()

    class Meta:
        model = DossierSoutenance
        fields = [
            'id', 'candidat_nom', 'session_titre', 'titre_memoire',
            'encadreur_nom', 'statut', 'date_depot', 'date_validation'
        ]

    def get_candidat_nom(self, obj):
        return obj.candidat.user.get_full_name()

    def get_session_titre(self, obj):
        return obj.session.titre

    def get_encadreur_nom(self, obj):
        return obj.encadreur.user.get_full_name() if obj.encadreur else None


# ============================================================================
# SERIALIZERS JURYS
# ============================================================================

class JurySerializer(serializers.ModelSerializer):
    """Serializer pour Jury"""
    president = EnseignantProfileSerializer(read_only=True)
    rapporteur = EnseignantProfileSerializer(read_only=True)
    examinateurs = EnseignantProfileSerializer(many=True, read_only=True)
    session = SessionSoutenanceSerializer(read_only=True)

    president_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    rapporteur_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    examinateurs_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    session_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Jury
        fields = [
            'id', 'nom', 'session', 'session_id', 'president', 'president_id',
            'rapporteur', 'rapporteur_id', 'examinateurs', 'examinateurs_ids',
            'statut', 'date_validation', 'created_at'
        ]
        read_only_fields = ['id', 'date_validation', 'created_at']


class JuryListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour liste de jurys"""
    president_nom = serializers.SerializerMethodField()
    rapporteur_nom = serializers.SerializerMethodField()
    nb_examinateurs = serializers.SerializerMethodField()

    class Meta:
        model = Jury
        fields = ['id', 'nom', 'president_nom', 'rapporteur_nom', 'nb_examinateurs', 'statut', 'created_at']

    def get_president_nom(self, obj):
        return obj.president.user.get_full_name() if obj.president else None

    def get_rapporteur_nom(self, obj):
        return obj.rapporteur.user.get_full_name() if obj.rapporteur else None

    def get_nb_examinateurs(self, obj):
        return obj.examinateurs.count()


# ============================================================================
# SERIALIZERS SOUTENANCES
# ============================================================================

class SoutenanceSerializer(serializers.ModelSerializer):
    """Serializer pour Soutenance"""
    dossier = DossierSoutenanceSerializer(read_only=True)
    jury = JurySerializer(read_only=True)
    session = SessionSoutenanceSerializer(read_only=True)
    salle = SalleSerializer(read_only=True)

    dossier_id = serializers.UUIDField(write_only=True)
    jury_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    session_id = serializers.UUIDField(write_only=True)
    salle_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Soutenance
        fields = [
            'id', 'dossier', 'dossier_id', 'jury', 'jury_id', 'session', 'session_id',
            'salle', 'salle_id', 'date_heure', 'duree_minutes', 'ordre_passage',
            'statut', 'note_finale', 'mention', 'observations', 'pv_genere',
            'pv_file', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'pv_genere', 'created_at', 'updated_at']


class SoutenanceListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour liste de soutenances"""
    candidat_nom = serializers.SerializerMethodField()
    titre_memoire = serializers.SerializerMethodField()
    salle_nom = serializers.SerializerMethodField()

    class Meta:
        model = Soutenance
        fields = [
            'id', 'candidat_nom', 'titre_memoire', 'date_heure',
            'salle_nom', 'ordre_passage', 'statut', 'note_finale', 'mention'
        ]

    def get_candidat_nom(self, obj):
        return obj.dossier.candidat.user.get_full_name()

    def get_titre_memoire(self, obj):
        return obj.dossier.titre_memoire

    def get_salle_nom(self, obj):
        return f"{obj.salle.nom} ({obj.salle.batiment})" if obj.salle else None


# ============================================================================
# SERIALIZERS PROCÈS-VERBAUX
# ============================================================================

class ProcesVerbalSerializer(serializers.ModelSerializer):
    """Serializer pour ProcesVerbal"""
    soutenance = SoutenanceSerializer(read_only=True)
    soutenance_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = ProcesVerbal
        fields = [
            'id', 'soutenance', 'soutenance_id', 'numero_pv', 'contenu',
            'date_generation', 'fichier_pdf', 'signatures_jury',
            'est_valide', 'date_validation', 'created_at'
        ]
        read_only_fields = ['id', 'date_generation', 'created_at']


# ============================================================================
# SERIALIZERS NOTIFICATIONS & COMMENTAIRES
# ============================================================================

class NotificationSerializer(serializers.ModelSerializer):
    """Serializer pour Notification"""
    destinataire = CustomUserSerializer(read_only=True)
    soutenance = SoutenanceListSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'destinataire', 'type', 'titre', 'message',
            'soutenance', 'est_lu', 'date_envoi', 'created_at'
        ]
        read_only_fields = ['id', 'date_envoi', 'created_at']


class CommentaireSerializer(serializers.ModelSerializer):
    """Serializer pour Commentaire"""
    auteur = CustomUserSerializer(read_only=True)
    dossier = DossierSoutenanceListSerializer(read_only=True)
    dossier_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Commentaire
        fields = [
            'id', 'dossier', 'dossier_id', 'auteur', 'contenu',
            'est_interne', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

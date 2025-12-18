from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    CustomUser, Departement, CandidatProfile, EnseignantProfile,
    SessionSoutenance, Salle, DossierSoutenance, Document,
    Jury, MembreJury, Soutenance
)


# ============================================================================
# SERIALIZERS UTILISATEURS
# ============================================================================

class SimpleUserSerializer(serializers.ModelSerializer):
    """Serializer minimal pour User (objets imbriqués)"""
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'full_name', 'role']

    def get_full_name(self, obj):
        return obj.get_full_name()


class CustomUserSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle CustomUser"""
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'role', 'phone', 'password', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }

    def create(self, validated_data):
        """Créer un utilisateur avec mot de passe hashé"""
        password = validated_data.pop('password', None)

        # Auto-générer username si non fourni
        if 'username' not in validated_data or not validated_data['username']:
            validated_data['username'] = validated_data['email'].split('@')[0]

        # Créer l'utilisateur
        if password:
            user = CustomUser.objects.create_user(password=password, **validated_data)
        else:
            # Si pas de password fourni, générer un password aléatoire temporaire
            import secrets
            temp_password = secrets.token_urlsafe(16)
            user = CustomUser.objects.create_user(password=temp_password, **validated_data)

        return user

    def update(self, instance, validated_data):
        """Mettre à jour un utilisateur (avec gestion du password)"""
        password = validated_data.pop('password', None)

        # Mettre à jour les autres champs
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Si un nouveau password est fourni, le hashé
        if password:
            instance.set_password(password)

        instance.save()
        return instance


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer pour l'inscription des utilisateurs"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'first_name', 'last_name', 'password', 'password2', 'role', 'phone']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        # Auto-générer username depuis first_name
        validated_data['username'] = validated_data['first_name'].lower().replace(' ', '')
        user = CustomUser.objects.create_user(**validated_data)
        return user


# ============================================================================
# SERIALIZERS DÉPARTEMENTS
# ============================================================================

class SimpleDepartementSerializer(serializers.ModelSerializer):
    """Serializer minimal pour Departement (objets imbriqués)"""
    class Meta:
        model = Departement
        fields = ['id', 'code', 'nom']


class DepartementSerializer(serializers.ModelSerializer):
    """Serializer pour Departement"""
    nb_candidats = serializers.SerializerMethodField()
    nb_enseignants = serializers.SerializerMethodField()

    class Meta:
        model = Departement
        fields = ['id', 'code', 'nom', 'nb_candidats', 'nb_enseignants']
        read_only_fields = ['id']

    def get_nb_candidats(self, obj):
        return obj.candidats.count()

    def get_nb_enseignants(self, obj):
        return obj.enseignants.count()


# ============================================================================
# SERIALIZERS PROFILS
# ============================================================================

class SimpleCandidatProfileSerializer(serializers.ModelSerializer):
    """Serializer minimal pour CandidatProfile (objets imbriqués)"""
    nom_complet = serializers.SerializerMethodField()

    class Meta:
        model = CandidatProfile
        fields = ['id', 'matricule', 'nom_complet', 'cycle']

    def get_nom_complet(self, obj):
        return obj.user.get_full_name()


class SimpleEnseignantProfileSerializer(serializers.ModelSerializer):
    """Serializer minimal pour EnseignantProfile (objets imbriqués)"""
    nom_complet = serializers.SerializerMethodField()

    class Meta:
        model = EnseignantProfile
        fields = ['id', 'nom_complet', 'grade']

    def get_nom_complet(self, obj):
        return obj.user.get_full_name()


class CandidatProfileSerializer(serializers.ModelSerializer):
    """Serializer pour le profil Candidat"""
    user = CustomUserSerializer(read_only=True)
    departement = DepartementSerializer(read_only=True)

    # Champs pour créer l'utilisateur en même temps (write_only)
    email = serializers.EmailField(write_only=True, required=True)
    first_name = serializers.CharField(write_only=True, required=True)
    last_name = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    username = serializers.CharField(write_only=True, required=False)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)

    departement_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = CandidatProfile
        fields = [
            'id', 'user',
            # Champs utilisateur (write_only pour création)
            'email', 'first_name', 'last_name', 'password', 'username', 'phone',
            # Champs profil candidat
            'matricule', 'cycle', 'departement', 'departement_id', 'photo',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        """Créer un utilisateur ET son profil candidat en une seule opération"""
        # Extraire les données utilisateur
        email = validated_data.pop('email')
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        password = validated_data.pop('password')
        username = validated_data.pop('username', email.split('@')[0])
        phone = validated_data.pop('phone', '')

        # Vérifier si l'email existe déjà
        if CustomUser.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Cet email est déjà utilisé"})

        # Créer l'utilisateur avec role CANDIDAT
        user = CustomUser.objects.create_user(
            email=email,
            username=username,
            first_name=first_name,
            last_name=last_name,
            password=password,
            phone=phone,
            role='CANDIDAT'
        )

        # Créer le profil candidat
        candidat = CandidatProfile.objects.create(user=user, **validated_data)
        return candidat

    def update(self, instance, validated_data):
        """Mettre à jour un profil candidat et ses données utilisateur"""
        # Extraire les données utilisateur si présentes
        email = validated_data.pop('email', None)
        first_name = validated_data.pop('first_name', None)
        last_name = validated_data.pop('last_name', None)
        password = validated_data.pop('password', None)
        username = validated_data.pop('username', None)
        phone = validated_data.pop('phone', None)

        # Mettre à jour l'utilisateur
        if email: instance.user.email = email
        if first_name: instance.user.first_name = first_name
        if last_name: instance.user.last_name = last_name
        if username: instance.user.username = username
        if phone is not None: instance.user.phone = phone
        if password: instance.user.set_password(password)

        if any([email, first_name, last_name, username, phone, password]):
            instance.user.save()

        # Mettre à jour le profil
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance


class EnseignantProfileSerializer(serializers.ModelSerializer):
    """Serializer pour le profil Enseignant"""
    user = CustomUserSerializer(read_only=True)
    departements = DepartementSerializer(many=True, read_only=True)

    # Champs pour créer l'utilisateur en même temps (write_only)
    email = serializers.EmailField(write_only=True, required=True)
    first_name = serializers.CharField(write_only=True, required=True)
    last_name = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    username = serializers.CharField(write_only=True, required=False)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)

    departement_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = EnseignantProfile
        fields = [
            'id', 'user',
            # Champs utilisateur (write_only pour création)
            'email', 'first_name', 'last_name', 'password', 'username', 'phone',
            # Champs profil enseignant
            'grade', 'departements', 'departement_ids',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        """Créer un utilisateur ET son profil enseignant en une seule opération"""
        # Extraire les données utilisateur
        email = validated_data.pop('email')
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        password = validated_data.pop('password')
        username = validated_data.pop('username', email.split('@')[0])
        phone = validated_data.pop('phone', '')
        departement_ids = validated_data.pop('departement_ids', [])

        # Vérifier si l'email existe déjà
        if CustomUser.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Cet email est déjà utilisé"})

        # Créer l'utilisateur avec role ENSEIGNANT
        user = CustomUser.objects.create_user(
            email=email,
            username=username,
            first_name=first_name,
            last_name=last_name,
            password=password,
            phone=phone,
            role='ENSEIGNANT'
        )

        # Créer le profil enseignant
        enseignant = EnseignantProfile.objects.create(user=user, **validated_data)

        # Assigner les départements
        if departement_ids:
            enseignant.departements.set(departement_ids)

        return enseignant

    def update(self, instance, validated_data):
        """Mettre à jour un profil enseignant et ses données utilisateur"""
        # Extraire les données utilisateur si présentes
        email = validated_data.pop('email', None)
        first_name = validated_data.pop('first_name', None)
        last_name = validated_data.pop('last_name', None)
        password = validated_data.pop('password', None)
        username = validated_data.pop('username', None)
        phone = validated_data.pop('phone', None)
        departement_ids = validated_data.pop('departement_ids', None)

        # Mettre à jour l'utilisateur
        if email: instance.user.email = email
        if first_name: instance.user.first_name = first_name
        if last_name: instance.user.last_name = last_name
        if username: instance.user.username = username
        if phone is not None: instance.user.phone = phone
        if password: instance.user.set_password(password)

        if any([email, first_name, last_name, username, phone, password]):
            instance.user.save()

        # Mettre à jour le profil
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Mettre à jour les départements
        if departement_ids is not None:
            instance.departements.set(departement_ids)

        return instance


# ============================================================================
# SERIALIZERS SESSIONS ET SALLES
# ============================================================================

class SimpleSessionSoutenanceSerializer(serializers.ModelSerializer):
    """Serializer minimal pour Session (objets imbriqués)"""
    class Meta:
        model = SessionSoutenance
        fields = ['id', 'titre', 'annee_academique', 'statut']


class SimpleSalleSerializer(serializers.ModelSerializer):
    """Serializer minimal pour Salle (objets imbriqués)"""
    class Meta:
        model = Salle
        fields = ['id', 'nom', 'batiment']


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
        # Compter les soutenances via les dossiers de cette session
        from .models import Soutenance
        return Soutenance.objects.filter(dossier__session=obj).count()


class SalleSerializer(serializers.ModelSerializer):
    """Serializer pour Salle"""

    class Meta:
        model = Salle
        fields = ['id', 'nom', 'batiment', 'capacite', 'est_disponible', 'created_at']
        read_only_fields = ['id', 'created_at']


# ============================================================================
# SERIALIZERS DOSSIERS
# ============================================================================

class DocumentSerializer(serializers.ModelSerializer):
    """Serializer pour Document"""

    class Meta:
        model = Document
        fields = ['id', 'dossier', 'nom', 'fichier', 'type_piece', 'est_obligatoire', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class DossierSoutenanceSerializer(serializers.ModelSerializer):
    """Serializer pour DossierSoutenance"""
    candidat = SimpleCandidatProfileSerializer(read_only=True)
    session = SimpleSessionSoutenanceSerializer(read_only=True)
    encadreur = SimpleEnseignantProfileSerializer(read_only=True)
    documents = DocumentSerializer(many=True, read_only=True)

    candidat_id = serializers.UUIDField(write_only=True, required=False)
    session_id = serializers.UUIDField(write_only=True)
    encadreur_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = DossierSoutenance
        fields = [
            'id', 'candidat', 'candidat_id', 'session', 'session_id',
            'titre_memoire', 'encadreur', 'encadreur_id',
            'documents', 'statut', 'date_depot', 'date_validation',
            'commentaires_admin', 'demande_suppression', 'commentaire_suppression',
            'date_demande_suppression', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'date_depot', 'date_validation', 'date_demande_suppression', 'created_at', 'updated_at']


class DossierSoutenanceListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour liste de dossiers"""
    candidat_nom = serializers.SerializerMethodField()
    session_titre = serializers.SerializerMethodField()
    encadreur_nom = serializers.SerializerMethodField()
    nb_documents = serializers.SerializerMethodField()

    class Meta:
        model = DossierSoutenance
        fields = [
            'id', 'candidat_nom', 'session_titre', 'titre_memoire',
            'encadreur_nom', 'nb_documents', 'statut', 'date_depot', 'date_validation'
        ]

    def get_candidat_nom(self, obj):
        return obj.candidat.user.get_full_name()

    def get_session_titre(self, obj):
        return obj.session.titre

    def get_encadreur_nom(self, obj):
        return obj.encadreur.user.get_full_name() if obj.encadreur else None

    def get_nb_documents(self, obj):
        return obj.documents.count()


# ============================================================================
# SERIALIZERS DOSSIERS (SUITE)
# ============================================================================

class SimpleDossierSoutenanceSerializer(serializers.ModelSerializer):
    """Serializer minimal pour DossierSoutenance (objets imbriqués)"""
    candidat_nom = serializers.SerializerMethodField()

    class Meta:
        model = DossierSoutenance
        fields = ['id', 'candidat_nom', 'titre_memoire', 'statut']

    def get_candidat_nom(self, obj):
        return obj.candidat.user.get_full_name()


# ============================================================================
# SERIALIZERS JURYS
# ============================================================================

class SimpleJurySerializer(serializers.ModelSerializer):
    """Serializer minimal pour Jury (objets imbriqués)"""
    class Meta:
        model = Jury
        fields = ['id', 'nom', 'statut']


class MembreJurySerializer(serializers.ModelSerializer):
    """Serializer pour MembreJury"""
    enseignant = SimpleEnseignantProfileSerializer(read_only=True)
    enseignant_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = MembreJury
        fields = ['id', 'enseignant', 'enseignant_id', 'role', 'created_at']
        read_only_fields = ['id', 'created_at']


class JurySerializer(serializers.ModelSerializer):
    """Serializer pour Jury"""
    session = SimpleSessionSoutenanceSerializer(read_only=True)
    composition = MembreJurySerializer(many=True, read_only=True)

    session_id = serializers.UUIDField(write_only=True)
    membres_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False,
        help_text="Liste des membres: [{'enseignant_id': 'uuid', 'role': 'PRESIDENT'}, ...]"
    )

    class Meta:
        model = Jury
        fields = [
            'id', 'nom', 'session', 'session_id', 'composition', 'membres_data',
            'statut', 'date_validation', 'created_at'
        ]
        read_only_fields = ['id', 'date_validation', 'created_at']

    def create(self, validated_data):
        membres_data = validated_data.pop('membres_data', [])
        jury = Jury.objects.create(**validated_data)

        for membre in membres_data:
            MembreJury.objects.create(
                jury=jury,
                enseignant_id=membre['enseignant_id'],
                role=membre['role']
            )

        # Recharger le jury avec ses relations
        jury = Jury.objects.select_related('session').prefetch_related(
            'composition__enseignant__user'
        ).get(pk=jury.pk)

        return jury


class JuryListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour liste de jurys"""
    session_titre = serializers.SerializerMethodField()
    nb_membres = serializers.SerializerMethodField()
    president = serializers.SerializerMethodField()

    class Meta:
        model = Jury
        fields = ['id', 'nom', 'session_titre', 'nb_membres', 'president', 'statut', 'created_at']

    def get_session_titre(self, obj):
        return obj.session.titre

    def get_nb_membres(self, obj):
        return obj.composition.count()

    def get_president(self, obj):
        president_membre = obj.composition.filter(role='PRESIDENT').first()
        return president_membre.enseignant.user.get_full_name() if president_membre else None


# ============================================================================
# SERIALIZERS SOUTENANCES
# ============================================================================

class SoutenanceSerializer(serializers.ModelSerializer):
    """Serializer pour Soutenance"""
    dossier = SimpleDossierSoutenanceSerializer(read_only=True)
    jury = SimpleJurySerializer(read_only=True)
    session = SimpleSessionSoutenanceSerializer(read_only=True)
    salle = SimpleSalleSerializer(read_only=True)

    dossier_id = serializers.UUIDField(write_only=True)
    jury_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    salle_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Soutenance
        fields = [
            'id', 'dossier', 'dossier_id', 'jury', 'jury_id', 'session',
            'salle', 'salle_id', 'date_heure', 'duree_minutes', 'ordre_passage',
            'statut', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'session', 'created_at', 'updated_at']


class SoutenanceListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour liste de soutenances"""
    candidat_nom = serializers.SerializerMethodField()
    titre_memoire = serializers.SerializerMethodField()
    salle_nom = serializers.SerializerMethodField()
    jury_nom = serializers.SerializerMethodField()

    class Meta:
        model = Soutenance
        fields = [
            'id', 'candidat_nom', 'titre_memoire', 'date_heure',
            'salle_nom', 'jury_nom', 'ordre_passage', 'statut'
        ]

    def get_candidat_nom(self, obj):
        return obj.dossier.candidat.user.get_full_name()

    def get_titre_memoire(self, obj):
        return obj.dossier.titre_memoire

    def get_salle_nom(self, obj):
        return f"{obj.salle.nom} ({obj.salle.batiment})" if obj.salle else None

    def get_jury_nom(self, obj):
        return obj.jury.nom if obj.jury else None

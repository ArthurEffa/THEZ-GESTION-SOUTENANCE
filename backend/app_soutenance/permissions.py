from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Permission pour vérifier que l'utilisateur est un administrateur
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'


class IsCandidat(permissions.BasePermission):
    """
    Permission pour vérifier que l'utilisateur est un candidat
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'CANDIDAT'


class IsEnseignant(permissions.BasePermission):
    """
    Permission pour vérifier que l'utilisateur est un enseignant
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ENSEIGNANT'


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission qui autorise:
    - Admin: toutes les opérations
    - Autres: lecture seule
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission qui autorise:
    - Admin: tout
    - Propriétaire: ses propres ressources
    """
    def has_object_permission(self, request, view, obj):
        # Admin a tous les droits
        if request.user.role == 'ADMIN':
            return True

        # Vérifier si l'objet appartient à l'utilisateur
        if hasattr(obj, 'user'):
            return obj.user == request.user

        return False


class IsCandidatOwnerOrAdmin(permissions.BasePermission):
    """
    Permission spécifique pour les dossiers:
    - Admin: tout
    - Candidat: uniquement ses propres dossiers
    """
    def has_object_permission(self, request, view, obj):
        # Admin a tous les droits
        if request.user.role == 'ADMIN':
            return True

        # Candidat peut accéder à son propre dossier
        if request.user.role == 'CANDIDAT':
            if hasattr(obj, 'candidat'):
                return obj.candidat.user == request.user
            elif hasattr(obj, 'user'):
                return obj.user == request.user

        return False


class IsJuryMemberOrAdmin(permissions.BasePermission):
    """
    Permission pour les soutenances:
    - Admin: tout
    - Enseignant: uniquement les soutenances où il est membre du jury
    """
    def has_object_permission(self, request, view, obj):
        # Admin a tous les droits
        if request.user.role == 'ADMIN':
            return True

        # Enseignant membre du jury
        if request.user.role == 'ENSEIGNANT':
            if hasattr(request.user, 'enseignant_profile'):
                enseignant_profile = request.user.enseignant_profile
                jury = obj.jury if hasattr(obj, 'jury') else None

                if jury:
                    # Vérifier si l'enseignant est président, rapporteur ou examinateur
                    is_president = jury.president == enseignant_profile
                    is_rapporteur = jury.rapporteur == enseignant_profile
                    is_examinateur = enseignant_profile in jury.examinateurs.all()

                    return is_president or is_rapporteur or is_examinateur

        return False


class IsEncadreurOrAdmin(permissions.BasePermission):
    """
    Permission pour les dossiers:
    - Admin: tout
    - Enseignant encadreur: dossiers qu'il encadre
    """
    def has_object_permission(self, request, view, obj):
        # Admin a tous les droits
        if request.user.role == 'ADMIN':
            return True

        # Enseignant encadreur
        if request.user.role == 'ENSEIGNANT':
            if hasattr(request.user, 'enseignant_profile'):
                enseignant_profile = request.user.enseignant_profile

                if hasattr(obj, 'encadreur'):
                    return obj.encadreur == enseignant_profile

        return False


class CanCreateDossier(permissions.BasePermission):
    """
    Permission pour créer un dossier:
    - Admin: oui
    - Candidat: oui (uniquement pour lui-même)
    - Enseignant: non
    """
    def has_permission(self, request, view):
        if request.method == 'POST':
            return request.user and request.user.is_authenticated and \
                   request.user.role in ['ADMIN', 'CANDIDAT']
        return True


class CanValidateDossier(permissions.BasePermission):
    """
    Permission pour valider/rejeter un dossier:
    - Seulement Admin
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'


class CanManageJury(permissions.BasePermission):
    """
    Permission pour gérer les jurys:
    - Seulement Admin
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'


class CanPlanSoutenance(permissions.BasePermission):
    """
    Permission pour planifier une soutenance:
    - Seulement Admin
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            # Tout le monde peut lire (mais filtré par les vues)
            return request.user and request.user.is_authenticated
        # Seulement admin peut créer/modifier/supprimer
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'


class CandidatProfilePermission(permissions.BasePermission):
    """
    Permission pour les profils candidats:
    - Admin: tout
    - Candidat: modifier son propre profil uniquement
    - Enseignant: read-only
    """
    def has_permission(self, request, view):
        # Tout le monde authentifié peut lire (filtré par get_queryset)
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # Création: seulement admin
        if request.method == 'POST':
            return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'

        # Pour PUT/PATCH/DELETE, on vérifie au niveau objet
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Admin a tous les droits
        if request.user.role == 'ADMIN':
            return True

        # Enseignant en read-only
        if request.user.role == 'ENSEIGNANT':
            return request.method in permissions.SAFE_METHODS

        # Candidat peut modifier son propre profil
        if request.user.role == 'CANDIDAT':
            return obj.user == request.user

        return False


class DossierSoutenancePermission(permissions.BasePermission):
    """
    Permission pour les dossiers de soutenance:
    - Admin: tout
    - Candidat: créer et modifier ses propres dossiers
    - Enseignant: read-only pour les dossiers qu'ils encadrent
    """
    def has_permission(self, request, view):
        # Tout le monde authentifié peut lire (filtré par get_queryset)
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # Création: admin et candidat
        if request.method == 'POST':
            return request.user and request.user.is_authenticated and \
                   request.user.role in ['ADMIN', 'CANDIDAT']

        # Pour PUT/PATCH/DELETE, on vérifie au niveau objet
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Admin a tous les droits
        if request.user.role == 'ADMIN':
            return True

        # Enseignant en read-only
        if request.user.role == 'ENSEIGNANT':
            return request.method in permissions.SAFE_METHODS

        # Candidat peut modifier son propre dossier
        if request.user.role == 'CANDIDAT':
            if hasattr(obj, 'candidat'):
                return obj.candidat.user == request.user

        return False

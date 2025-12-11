from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import (
    CustomUser, Departement, CandidatProfile, EnseignantProfile,
    SessionSoutenance, Salle, DossierSoutenance, Document,
    Jury, MembreJury, Soutenance
)
from .serializers import (
    CustomUserSerializer, UserRegistrationSerializer,
    DepartementSerializer, CandidatProfileSerializer, EnseignantProfileSerializer,
    SessionSoutenanceSerializer, SalleSerializer,
    DossierSoutenanceSerializer, DossierSoutenanceListSerializer,
    DocumentSerializer, JurySerializer, JuryListSerializer,
    MembreJurySerializer, SoutenanceSerializer, SoutenanceListSerializer
)
from .permissions import (
    IsAdmin, IsCandidat, IsEnseignant, IsAdminOrReadOnly,
    IsOwnerOrAdmin, IsCandidatOwnerOrAdmin, CanCreateDossier,
    CanValidateDossier, CanManageJury, CanPlanSoutenance,
    CandidatProfilePermission, DossierSoutenancePermission
)


# ============================================================================
# VIEWSETS UTILISATEURS
# ============================================================================

class CustomUserViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les utilisateurs"""
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['email', 'first_name', 'last_name', 'username']
    ordering_fields = ['date_joined', 'email', 'last_name']
    filterset_fields = ['role', 'is_active']

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Récupérer le profil de l'utilisateur connecté"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


# ============================================================================
# VIEWSETS DÉPARTEMENTS
# ============================================================================

class DepartementViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les départements"""
    queryset = Departement.objects.all()
    serializer_class = DepartementSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'nom']
    ordering_fields = ['code', 'nom']


# ============================================================================
# VIEWSETS PROFILS
# ============================================================================

class CandidatProfileViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les profils candidats"""
    queryset = CandidatProfile.objects.all()
    serializer_class = CandidatProfileSerializer
    permission_classes = [IsAuthenticated, CandidatProfilePermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['matricule', 'user__first_name', 'user__last_name', 'user__email']
    ordering_fields = ['created_at', 'matricule']
    filterset_fields = ['niveau_etude', 'departement']

    def get_queryset(self):
        """Filtrer selon le rôle"""
        user = self.request.user
        if user.role == 'ADMIN':
            return CandidatProfile.objects.all()
        elif user.role == 'CANDIDAT':
            # Candidat voit uniquement son propre profil
            return CandidatProfile.objects.filter(user=user)
        elif user.role == 'ENSEIGNANT':
            # Enseignant voit:
            # 1. Tous les candidats de son/ses département(s)
            # 2. Candidats qu'il encadre
            # 3. Candidats dont il est membre du jury
            from django.db.models import Q

            enseignant_profile = user.enseignant_profile

            # Candidats des départements de l'enseignant
            candidats_departement = Q(departement__in=enseignant_profile.departements.all())

            # Candidats qu'il encadre
            candidats_encadres = Q(dossiers__encadreur=enseignant_profile)

            # Candidats dont il est membre du jury
            candidats_jury = Q(
                dossiers__soutenance__jury__composition__enseignant=enseignant_profile
            )

            return CandidatProfile.objects.filter(
                candidats_departement | candidats_encadres | candidats_jury
            ).distinct()

        return CandidatProfile.objects.none()


class EnseignantProfileViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les profils enseignants"""
    queryset = EnseignantProfile.objects.all()
    serializer_class = EnseignantProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['user__first_name', 'user__last_name', 'user__email']
    ordering_fields = ['created_at', 'user__last_name']
    filterset_fields = ['grade', 'departements']


# ============================================================================
# VIEWSETS SESSIONS ET SALLES
# ============================================================================

class SessionSoutenanceViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les sessions de soutenance"""
    queryset = SessionSoutenance.objects.all()
    serializer_class = SessionSoutenanceSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['titre', 'annee_academique']
    ordering_fields = ['date_ouverture', 'created_at']
    filterset_fields = ['statut', 'niveau_concerne', 'annee_academique']

    def perform_create(self, serializer):
        """Enregistrer l'utilisateur qui a créé la session"""
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Récupérer la session active actuelle"""
        now = timezone.now()
        session = SessionSoutenance.objects.filter(
            statut='OUVERT',
            date_ouverture__lte=now,
            date_cloture__gte=now
        ).first()

        if session:
            serializer = self.get_serializer(session)
            return Response(serializer.data)
        return Response({'detail': 'Aucune session active'}, status=status.HTTP_404_NOT_FOUND)


class SalleViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les salles"""
    queryset = Salle.objects.all()
    serializer_class = SalleSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['nom', 'batiment']
    ordering_fields = ['nom', 'batiment', 'capacite']
    filterset_fields = ['batiment', 'est_disponible']

    @action(detail=False, methods=['get'])
    def disponibles(self, request):
        """Liste des salles disponibles"""
        salles = Salle.objects.filter(est_disponible=True)
        serializer = self.get_serializer(salles, many=True)
        return Response(serializer.data)


# ============================================================================
# VIEWSETS DOSSIERS
# ============================================================================

class DossierSoutenanceViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les dossiers de soutenance"""
    queryset = DossierSoutenance.objects.all()
    permission_classes = [IsAuthenticated, DossierSoutenancePermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['titre_memoire', 'candidat__matricule', 'candidat__user__last_name']
    ordering_fields = ['date_depot', 'created_at']
    filterset_fields = ['statut', 'session', 'candidat__niveau_etude', 'demande_suppression']

    def get_serializer_class(self):
        """Utiliser un serializer différent pour la liste"""
        if self.action == 'list':
            return DossierSoutenanceListSerializer
        return DossierSoutenanceSerializer

    def get_queryset(self):
        """Filtrer selon le rôle"""
        user = self.request.user
        if user.role == 'ADMIN':
            return DossierSoutenance.objects.all()
        elif user.role == 'CANDIDAT':
            return DossierSoutenance.objects.filter(candidat__user=user)
        elif user.role == 'ENSEIGNANT':
            return DossierSoutenance.objects.filter(encadreur__user=user)
        return DossierSoutenance.objects.none()

    def perform_create(self, serializer):
        """Associer automatiquement le candidat connecté - seuls les candidats peuvent créer"""
        if self.request.user.role == 'CANDIDAT':
            serializer.save(candidat=self.request.user.candidat_profile)
        else:
            # Seuls les candidats peuvent créer des dossiers
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Seuls les candidats peuvent créer des dossiers de soutenance.")

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanValidateDossier])
    def valider(self, request, pk=None):
        """Valider un dossier (Admin seulement)"""
        dossier = self.get_object()
        dossier.statut = 'VALIDE'
        dossier.date_validation = timezone.now()
        dossier.save()

        serializer = self.get_serializer(dossier)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanValidateDossier])
    def rejeter(self, request, pk=None):
        """Rejeter un dossier (Admin seulement)"""
        dossier = self.get_object()
        dossier.statut = 'REJETE'
        dossier.commentaires_admin = request.data.get('commentaires', '')
        dossier.save()

        serializer = self.get_serializer(dossier)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsCandidat])
    def mes_dossiers(self, request):
        """Récupérer les dossiers du candidat connecté"""
        dossiers = DossierSoutenance.objects.filter(candidat__user=request.user)
        serializer = self.get_serializer(dossiers, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsCandidat])
    def demander_suppression(self, request, pk=None):
        """Candidat demande la suppression de son dossier"""
        dossier = self.get_object()

        # Vérifier que c'est bien son dossier
        if dossier.candidat.user != request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Vous ne pouvez pas demander la suppression de ce dossier.")

        dossier.demande_suppression = True
        dossier.commentaire_suppression = request.data.get('commentaire', '')
        dossier.date_demande_suppression = timezone.now()
        dossier.save()

        serializer = self.get_serializer(dossier)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def accepter_suppression(self, request, pk=None):
        """Admin accepte et supprime le dossier"""
        dossier = self.get_object()

        if not dossier.demande_suppression:
            return Response(
                {'detail': 'Aucune demande de suppression pour ce dossier.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Supprimer le dossier
        dossier.delete()
        return Response({'detail': 'Dossier supprimé avec succès.'}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def rejeter_suppression(self, request, pk=None):
        """Admin rejette la demande de suppression"""
        dossier = self.get_object()

        if not dossier.demande_suppression:
            return Response(
                {'detail': 'Aucune demande de suppression pour ce dossier.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Réinitialiser la demande
        dossier.demande_suppression = False
        dossier.commentaire_suppression = ''
        dossier.date_demande_suppression = None
        dossier.save()

        serializer = self.get_serializer(dossier)
        return Response(serializer.data)


class DocumentViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les documents"""
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['nom', 'dossier__titre_memoire']
    ordering_fields = ['uploaded_at', 'nom']
    filterset_fields = ['type_piece', 'est_obligatoire', 'dossier']

    def get_queryset(self):
        """Filtrer selon le rôle"""
        user = self.request.user
        if user.role == 'ADMIN':
            return Document.objects.all()
        elif user.role == 'CANDIDAT':
            return Document.objects.filter(dossier__candidat__user=user)
        elif user.role == 'ENSEIGNANT':
            return Document.objects.filter(dossier__encadreur__user=user)
        return Document.objects.none()


# ============================================================================
# VIEWSETS JURYS
# ============================================================================

class JuryViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les jurys"""
    queryset = Jury.objects.all()
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['nom']
    ordering_fields = ['created_at', 'nom']
    filterset_fields = ['statut', 'session']

    def get_serializer_class(self):
        """Utiliser un serializer différent pour la liste"""
        if self.action == 'list':
            return JuryListSerializer
        return JurySerializer

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanManageJury])
    def valider(self, request, pk=None):
        """Valider un jury (Admin seulement)"""
        jury = self.get_object()
        jury.statut = 'VALIDE'
        jury.date_validation = timezone.now()
        jury.save()

        serializer = self.get_serializer(jury)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanManageJury])
    def activer(self, request, pk=None):
        """Activer un jury pour les soutenances (Admin seulement)"""
        jury = self.get_object()
        jury.statut = 'ACTIF'
        jury.save()

        serializer = self.get_serializer(jury)
        return Response(serializer.data)


class MembreJuryViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les membres de jury"""
    queryset = MembreJury.objects.all()
    serializer_class = MembreJurySerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['enseignant__user__first_name', 'enseignant__user__last_name', 'jury__nom']
    ordering_fields = ['created_at', 'role']
    filterset_fields = ['role', 'jury']


# ============================================================================
# VIEWSETS SOUTENANCES
# ============================================================================

class SoutenanceViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les soutenances"""
    queryset = Soutenance.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = [
        'dossier__titre_memoire',
        'dossier__candidat__user__first_name',
        'dossier__candidat__user__last_name'
    ]
    ordering_fields = ['date_heure', 'ordre_passage', 'created_at']
    filterset_fields = ['statut', 'salle']

    def get_serializer_class(self):
        """Utiliser un serializer différent pour la liste"""
        if self.action == 'list':
            return SoutenanceListSerializer
        return SoutenanceSerializer

    def get_queryset(self):
        """Filtrer selon le rôle"""
        user = self.request.user
        if user.role == 'ADMIN':
            return Soutenance.objects.all()
        elif user.role == 'CANDIDAT':
            return Soutenance.objects.filter(dossier__candidat__user=user)
        elif user.role == 'ENSEIGNANT':
            # Enseignant voit les soutenances où il est membre du jury
            return Soutenance.objects.filter(
                jury__composition__enseignant__user=user
            ).distinct()
        return Soutenance.objects.none()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanPlanSoutenance])
    def planifier(self, request, pk=None):
        """Planifier une soutenance (Admin seulement)"""
        soutenance = self.get_object()

        soutenance.date_heure = request.data.get('date_heure')
        soutenance.salle_id = request.data.get('salle_id')
        soutenance.ordre_passage = request.data.get('ordre_passage')
        soutenance.duree_minutes = request.data.get('duree_minutes', 60)
        soutenance.statut = 'PLANIFIEE'
        soutenance.save()

        serializer = self.get_serializer(soutenance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def demarrer(self, request, pk=None):
        """Démarrer une soutenance"""
        soutenance = self.get_object()
        soutenance.statut = 'EN_COURS'
        soutenance.save()

        serializer = self.get_serializer(soutenance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def terminer(self, request, pk=None):
        """Terminer une soutenance"""
        soutenance = self.get_object()
        soutenance.statut = 'TERMINEE'
        soutenance.save()

        serializer = self.get_serializer(soutenance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mes_soutenances(self, request):
        """Récupérer les soutenances selon le rôle de l'utilisateur"""
        user = request.user

        if user.role == 'CANDIDAT':
            soutenances = Soutenance.objects.filter(dossier__candidat__user=user)
        elif user.role == 'ENSEIGNANT':
            soutenances = Soutenance.objects.filter(
                jury__composition__enseignant__user=user
            ).distinct()
        else:
            soutenances = Soutenance.objects.all()

        serializer = self.get_serializer(soutenances, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def calendrier(self, request):
        """Calendrier des soutenances"""
        soutenances = Soutenance.objects.filter(
            date_heure__isnull=False
        ).order_by('date_heure')

        serializer = self.get_serializer(soutenances, many=True)
        return Response(serializer.data)

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from drf_spectacular.utils import extend_schema, extend_schema_view

from .models import (
    CustomUser, CandidatProfile, EnseignantProfile,
    SessionSoutenance, Salle, DossierSoutenance, FichierAnnexe,
    Jury, Soutenance, ProcesVerbal, Notification, Commentaire
)
from .serializers import (
    CustomUserSerializer, UserRegistrationSerializer,
    CandidatProfileSerializer, EnseignantProfileSerializer,
    SessionSoutenanceSerializer, SalleSerializer,
    DossierSoutenanceSerializer, DossierSoutenanceListSerializer,
    FichierAnnexeSerializer, JurySerializer, JuryListSerializer,
    SoutenanceSerializer, SoutenanceListSerializer,
    ProcesVerbalSerializer, NotificationSerializer, CommentaireSerializer
)
from .permissions import (
    IsAdmin, IsCandidat, IsEnseignant, IsAdminOrReadOnly,
    IsOwnerOrAdmin, IsCandidatOwnerOrAdmin, CanCreateDossier,
    CanValidateDossier, CanManageJury, CanPlanSoutenance
)


# ============================================================================
# VIEWSETS UTILISATEURS
# ============================================================================

@extend_schema_view(
    list=extend_schema(description="Liste de tous les utilisateurs (Admin seulement)"),
    retrieve=extend_schema(description="Détails d'un utilisateur"),
    create=extend_schema(description="Créer un utilisateur (Admin seulement)"),
    update=extend_schema(description="Modifier un utilisateur (Admin seulement)"),
    destroy=extend_schema(description="Supprimer un utilisateur (Admin seulement)"),
)
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


class CandidatProfileViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les profils candidats"""
    queryset = CandidatProfile.objects.all()
    serializer_class = CandidatProfileSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['matricule', 'user__first_name', 'user__last_name', 'user__email']
    ordering_fields = ['created_at', 'matricule']
    filterset_fields = ['niveau_etude', 'filiere']

    def get_queryset(self):
        """Filtrer selon le rôle"""
        user = self.request.user
        if user.role == 'ADMIN':
            return CandidatProfile.objects.all()
        elif user.role == 'CANDIDAT':
            return CandidatProfile.objects.filter(user=user)
        return CandidatProfile.objects.none()


class EnseignantProfileViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les profils enseignants"""
    queryset = EnseignantProfile.objects.all()
    serializer_class = EnseignantProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'departement']
    ordering_fields = ['created_at', 'user__last_name']
    filterset_fields = ['grade', 'departement']


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
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['titre_memoire', 'theme', 'candidat__matricule', 'candidat__user__last_name']
    ordering_fields = ['date_depot', 'created_at']
    filterset_fields = ['statut', 'session', 'candidat__niveau_etude']

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
            # Enseignant voit les dossiers qu'il encadre
            return DossierSoutenance.objects.filter(encadreur__user=user)
        return DossierSoutenance.objects.none()

    def perform_create(self, serializer):
        """Associer automatiquement le candidat connecté"""
        if self.request.user.role == 'CANDIDAT':
            serializer.save(candidat=self.request.user.candidat_profile)
        else:
            serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanValidateDossier])
    def valider(self, request, pk=None):
        """Valider un dossier (Admin seulement)"""
        dossier = self.get_object()
        dossier.statut = 'VALIDE'
        dossier.date_validation = timezone.now()
        dossier.save()

        # Créer une notification pour le candidat
        Notification.objects.create(
            destinataire=dossier.candidat.user,
            type='VALIDATION',
            titre='Dossier validé',
            message=f'Votre dossier "{dossier.titre_memoire}" a été validé par l\'administration.'
        )

        serializer = self.get_serializer(dossier)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, CanValidateDossier])
    def rejeter(self, request, pk=None):
        """Rejeter un dossier (Admin seulement)"""
        dossier = self.get_object()
        dossier.statut = 'REJETE'
        dossier.commentaires_admin = request.data.get('commentaires', '')
        dossier.save()

        # Créer une notification pour le candidat
        Notification.objects.create(
            destinataire=dossier.candidat.user,
            type='INFO',
            titre='Dossier rejeté',
            message=f'Votre dossier "{dossier.titre_memoire}" a été rejeté. Consultez les commentaires.'
        )

        serializer = self.get_serializer(dossier)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def mes_dossiers(self, request):
        """Récupérer les dossiers de l'utilisateur connecté (Candidat)"""
        if request.user.role == 'CANDIDAT':
            dossiers = DossierSoutenance.objects.filter(candidat__user=request.user)
            serializer = self.get_serializer(dossiers, many=True)
            return Response(serializer.data)
        return Response({'detail': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)


# ============================================================================
# VIEWSETS JURYS
# ============================================================================

class JuryViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les jurys"""
    queryset = Jury.objects.all()
    permission_classes = [IsAuthenticated, CanManageJury]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['nom', 'president__user__last_name', 'rapporteur__user__last_name']
    ordering_fields = ['created_at', 'date_validation']
    filterset_fields = ['statut', 'session']

    def get_serializer_class(self):
        """Utiliser un serializer différent pour la liste"""
        if self.action == 'list':
            return JuryListSerializer
        return JurySerializer

    def perform_create(self, serializer):
        """Gérer la création d'un jury avec ses examinateurs"""
        examinateurs_ids = self.request.data.get('examinateurs_ids', [])
        jury = serializer.save()

        if examinateurs_ids:
            examinateurs = EnseignantProfile.objects.filter(id__in=examinateurs_ids)
            jury.examinateurs.set(examinateurs)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def valider(self, request, pk=None):
        """Valider la composition d'un jury"""
        jury = self.get_object()
        jury.statut = 'VALIDE'
        jury.date_validation = timezone.now()
        jury.save()

        serializer = self.get_serializer(jury)
        return Response(serializer.data)


# ============================================================================
# VIEWSETS SOUTENANCES
# ============================================================================

class SoutenanceViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les soutenances"""
    queryset = Soutenance.objects.all()
    permission_classes = [IsAuthenticated, CanPlanSoutenance]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['dossier__titre_memoire', 'dossier__candidat__user__last_name']
    ordering_fields = ['date_heure', 'ordre_passage', 'created_at']
    filterset_fields = ['statut', 'session', 'salle', 'mention']

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
            enseignant_profile = user.enseignant_profile
            return Soutenance.objects.filter(
                jury__president=enseignant_profile
            ) | Soutenance.objects.filter(
                jury__rapporteur=enseignant_profile
            ) | Soutenance.objects.filter(
                jury__examinateurs=enseignant_profile
            )
        return Soutenance.objects.none()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def planifier(self, request, pk=None):
        """Planifier une soutenance (date, heure, salle)"""
        soutenance = self.get_object()

        date_heure = request.data.get('date_heure')
        salle_id = request.data.get('salle_id')
        ordre_passage = request.data.get('ordre_passage')

        if date_heure:
            soutenance.date_heure = date_heure
        if salle_id:
            soutenance.salle_id = salle_id
        if ordre_passage:
            soutenance.ordre_passage = ordre_passage

        soutenance.statut = 'PLANIFIEE'
        soutenance.save()

        # Créer des notifications pour le candidat
        Notification.objects.create(
            destinataire=soutenance.dossier.candidat.user,
            type='CONVOCATION',
            titre='Soutenance planifiée',
            message=f'Votre soutenance a été planifiée le {soutenance.date_heure}.',
            soutenance=soutenance
        )

        serializer = self.get_serializer(soutenance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def mes_soutenances(self, request):
        """Récupérer les soutenances de l'utilisateur connecté"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def planning(self, request):
        """Récupérer le planning global des soutenances"""
        if request.user.role != 'ADMIN':
            return Response({'detail': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)

        soutenances = Soutenance.objects.filter(
            statut__in=['PLANIFIEE', 'EN_COURS']
        ).order_by('date_heure', 'ordre_passage')

        serializer = self.get_serializer(soutenances, many=True)
        return Response(serializer.data)


# ============================================================================
# VIEWSETS NOTIFICATIONS
# ============================================================================

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour gérer les notifications (lecture seule)"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter, DjangoFilterBackend]
    ordering_fields = ['date_envoi']
    filterset_fields = ['type', 'est_lu']

    def get_queryset(self):
        """Récupérer uniquement les notifications de l'utilisateur connecté"""
        return Notification.objects.filter(destinataire=self.request.user)

    @action(detail=True, methods=['patch'])
    def marquer_lu(self, request, pk=None):
        """Marquer une notification comme lue"""
        notification = self.get_object()
        notification.est_lu = True
        notification.save()

        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def marquer_tout_lu(self, request):
        """Marquer toutes les notifications comme lues"""
        Notification.objects.filter(
            destinataire=request.user,
            est_lu=False
        ).update(est_lu=True)

        return Response({'detail': 'Toutes les notifications ont été marquées comme lues'})


# ============================================================================
# VIEWSETS COMMENTAIRES
# ============================================================================

class CommentaireViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les commentaires"""
    queryset = Commentaire.objects.all()
    serializer_class = CommentaireSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter, DjangoFilterBackend]
    ordering_fields = ['created_at']
    filterset_fields = ['dossier', 'est_interne']

    def get_queryset(self):
        """Filtrer les commentaires selon le rôle"""
        user = self.request.user
        if user.role == 'ADMIN':
            return Commentaire.objects.all()
        elif user.role == 'CANDIDAT':
            # Candidat voit seulement les commentaires non internes de ses dossiers
            return Commentaire.objects.filter(
                dossier__candidat__user=user,
                est_interne=False
            )
        elif user.role == 'ENSEIGNANT':
            # Enseignant voit tous les commentaires des dossiers qu'il encadre
            return Commentaire.objects.filter(dossier__encadreur__user=user)
        return Commentaire.objects.none()

    def perform_create(self, serializer):
        """Associer l'auteur automatiquement"""
        serializer.save(auteur=self.request.user)

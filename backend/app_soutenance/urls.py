from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

from .views import (
    CustomUserViewSet,
    DepartementViewSet,
    CandidatProfileViewSet,
    EnseignantProfileViewSet,
    SessionSoutenanceViewSet,
    SalleViewSet,
    DossierSoutenanceViewSet,
    DocumentViewSet,
    JuryViewSet,
    MembreJuryViewSet,
    SoutenanceViewSet,
)

# Router pour les ViewSets
router = DefaultRouter()

# Enregistrement des routes
router.register(r'users', CustomUserViewSet, basename='user')
router.register(r'departements', DepartementViewSet, basename='departement')
router.register(r'candidats', CandidatProfileViewSet, basename='candidat')
router.register(r'enseignants', EnseignantProfileViewSet, basename='enseignant')
router.register(r'sessions', SessionSoutenanceViewSet, basename='session')
router.register(r'salles', SalleViewSet, basename='salle')
router.register(r'dossiers', DossierSoutenanceViewSet, basename='dossier')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'jurys', JuryViewSet, basename='jury')
router.register(r'membres-jury', MembreJuryViewSet, basename='membre-jury')
router.register(r'soutenances', SoutenanceViewSet, basename='soutenance')

urlpatterns = [
    # Authentication endpoints (JWT)
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', TokenBlacklistView.as_view(), name='token_blacklist'),

    # Routes du router
    path('', include(router.urls)),
]

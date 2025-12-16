import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator


# ============================================================================
# MODÈLE UTILISATEUR PERSONNALISÉ (CustomUser) - RBAC
# ============================================================================

class CustomUser(AbstractUser):
    """
    Modèle utilisateur personnalisé avec système de rôles (RBAC)
    """
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrateur'
        CANDIDAT = 'CANDIDAT', 'Candidat'
        ENSEIGNANT = 'ENSEIGNANT', 'Enseignant'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, verbose_name="Email")
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CANDIDAT,
        verbose_name="Rôle"
    )
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Téléphone")

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    @property
    def is_candidat(self):
        return self.role == self.Role.CANDIDAT

    @property
    def is_enseignant(self):
        return self.role == self.Role.ENSEIGNANT


# ============================================================================
# DÉPARTEMENTS
# ============================================================================

class Departement(models.Model):
    """
    Département académique
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=20, unique=True, verbose_name="Code")
    nom = models.CharField(max_length=200, verbose_name="Nom")

    class Meta:
        verbose_name = "Département"
        verbose_name_plural = "Départements"
        ordering = ['nom']

    def __str__(self):
        return f"{self.code} - {self.nom}"


# ============================================================================
# PROFILS UTILISATEURS
# ============================================================================

class CandidatProfile(models.Model):
    """
    Profil étendu pour les candidats
    """
    class Cycle(models.TextChoices):
        INGENIEUR = 'INGENIEUR', 'Ingénieur'
        SCIENCE_INGENIEUR = 'SCIENCE_INGENIEUR', 'Science de l\'ingénieur'
        MASTER_PRO = 'MASTER_PRO', 'Master professionnel'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='candidat_profile',
        verbose_name="Utilisateur"
    )
    matricule = models.CharField(max_length=50, unique=True, verbose_name="Matricule")
    cycle = models.CharField(
        max_length=30,
        choices=Cycle.choices,
        default='INGENIEUR',
        verbose_name="Cycle"
    )
    departement = models.ForeignKey(
        'Departement',
        on_delete=models.PROTECT,
        related_name='candidats',
        verbose_name="Département",
        null=True,
        blank=True
    )
    photo = models.ImageField(
        upload_to='photos/candidats/',
        blank=True,
        null=True,
        verbose_name="Photo"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")

    class Meta:
        verbose_name = "Profil Candidat"
        verbose_name_plural = "Profils Candidats"
        ordering = ['matricule']

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.matricule}"


class EnseignantProfile(models.Model):
    """
    Profil étendu pour les enseignants
    """
    class Grade(models.TextChoices):
        PROFESSEUR = 'PROFESSEUR', 'Professeur'
        MAITRE_CONF = 'MAITRE_CONF', 'Maître de Conférence'
        CHARGE_COURS = 'CHARGE_COURS', 'Chargé de Cours'
        ASSISTANT = 'ASSISTANT', 'Assistant'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='enseignant_profile',
        verbose_name="Utilisateur"
    )
    grade = models.CharField(
        max_length=20,
        choices=Grade.choices,
        verbose_name="Grade"
    )
    departements = models.ManyToManyField(
        'Departement',
        related_name='enseignants',
        verbose_name="Départements"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")

    class Meta:
        verbose_name = "Profil Enseignant"
        verbose_name_plural = "Profils Enseignants"
        ordering = ['user__last_name']

    def __str__(self):
        return f"{self.get_grade_display()} {self.user.get_full_name()}"


# ============================================================================
# GESTION DES SESSIONS ET SALLES
# ============================================================================

class SessionSoutenance(models.Model):
    """
    Session de soutenance (ex: Session Master 2024-2025)
    """
    class Statut(models.TextChoices):
        OUVERT = 'OUVERT', 'Ouvert'
        FERME = 'FERME', 'Fermé'
        EN_COURS = 'EN_COURS', 'En cours'
        TERMINE = 'TERMINE', 'Terminé'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    titre = models.CharField(max_length=200, verbose_name="Titre")
    annee_academique = models.CharField(max_length=20, verbose_name="Année académique")
    date_ouverture = models.DateTimeField(verbose_name="Date d'ouverture")
    date_cloture = models.DateTimeField(verbose_name="Date de clôture")
    niveau_concerne = models.CharField(max_length=20, verbose_name="Niveau concerné")
    statut = models.CharField(
        max_length=20,
        choices=Statut.choices,
        default=Statut.OUVERT,
        verbose_name="Statut"
    )
    description = models.TextField(blank=True, verbose_name="Description")
    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sessions_created',
        verbose_name="Créé par"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")

    class Meta:
        verbose_name = "Session de Soutenance"
        verbose_name_plural = "Sessions de Soutenance"
        ordering = ['-date_ouverture']

    def __str__(self):
        return f"{self.titre} ({self.annee_academique})"


class Salle(models.Model):
    """
    Salle de soutenance
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom = models.CharField(max_length=100, verbose_name="Nom")
    batiment = models.CharField(max_length=100, verbose_name="Bâtiment")
    capacite = models.IntegerField(verbose_name="Capacité")
    est_disponible = models.BooleanField(default=True, verbose_name="Disponible")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")

    class Meta:
        verbose_name = "Salle"
        verbose_name_plural = "Salles"
        ordering = ['batiment', 'nom']

    def __str__(self):
        return f"{self.nom} ({self.batiment})"


# ============================================================================
# DOSSIERS DE SOUTENANCE
# ============================================================================

class DossierSoutenance(models.Model):
    """
    Dossier de soutenance créé par le candidat
    """
    class Statut(models.TextChoices):
        BROUILLON = 'BROUILLON', 'Brouillon'
        DEPOSE = 'DEPOSE', 'Déposé'
        VALIDE = 'VALIDE', 'Validé'
        REJETE = 'REJETE', 'Rejeté'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidat = models.ForeignKey(
        CandidatProfile,
        on_delete=models.CASCADE,
        related_name='dossiers',
        verbose_name="Candidat"
    )
    session = models.ForeignKey(
        SessionSoutenance,
        on_delete=models.CASCADE,
        related_name='dossiers',
        verbose_name="Session"
    )
    titre_memoire = models.CharField(max_length=300, verbose_name="Titre du mémoire")
    encadreur = models.ForeignKey(
        EnseignantProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='dossiers_encadres',
        verbose_name="Encadreur"
    )
    statut = models.CharField(
        max_length=20,
        choices=Statut.choices,
        default=Statut.BROUILLON,
        verbose_name="Statut"
    )
    date_depot = models.DateTimeField(auto_now_add=True, verbose_name="Date de dépôt")
    date_validation = models.DateTimeField(null=True, blank=True, verbose_name="Date de validation")
    commentaires_admin = models.TextField(blank=True, verbose_name="Commentaires admin")

    # Demande de suppression
    demande_suppression = models.BooleanField(default=False, verbose_name="Demande de suppression")
    commentaire_suppression = models.TextField(blank=True, verbose_name="Commentaire suppression")
    date_demande_suppression = models.DateTimeField(null=True, blank=True, verbose_name="Date demande suppression")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")

    class Meta:
        verbose_name = "Dossier de Soutenance"
        verbose_name_plural = "Dossiers de Soutenance"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.candidat.user.get_full_name()} - {self.titre_memoire[:50]}"


class Document(models.Model):
    """
    Document/Pièce jointe d'un dossier de soutenance
    """
    class TypePiece(models.TextChoices):
        MEMOIRE = 'MEMOIRE', 'Mémoire'
        RECU_PAIEMENT = 'RECU_PAIEMENT', 'Reçu de paiement'
        ACCORD_STAGE = 'ACCORD_STAGE', 'Accord de stage'
        LETTRE_MISE_EN_STAGE = 'LETTRE_MISE_EN_STAGE', 'Lettre de mise en stage'
        CERTIFICAT_SCOLARITE = 'CERTIFICAT_SCOLARITE', 'Certificat de scolarité'
        ATTESTATION = 'ATTESTATION', 'Attestation'
        AUTRE = 'AUTRE', 'Autre'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dossier = models.ForeignKey(
        DossierSoutenance,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name="Dossier"
    )
    nom = models.CharField(max_length=200, verbose_name="Nom du document")
    fichier = models.FileField(upload_to='documents/', verbose_name="Fichier")
    type_piece = models.CharField(
        max_length=30,
        choices=TypePiece.choices,
        verbose_name="Type de pièce"
    )
    est_obligatoire = models.BooleanField(default=False, verbose_name="Obligatoire")
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name="Uploadé le")

    class Meta:
        verbose_name = "Document"
        verbose_name_plural = "Documents"
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.get_type_piece_display()} - {self.nom}"


# ============================================================================
# JURYS
# ============================================================================

class Jury(models.Model):
    """
    Composition d'un jury de soutenance
    """
    class Statut(models.TextChoices):
        PROPOSE = 'PROPOSE', 'Proposé'
        VALIDE = 'VALIDE', 'Validé'
        ACTIF = 'ACTIF', 'Actif'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom = models.CharField(max_length=200, verbose_name="Nom du jury")
    session = models.ForeignKey(
        SessionSoutenance,
        on_delete=models.CASCADE,
        related_name='jurys',
        verbose_name="Session"
    )
    membres = models.ManyToManyField(
        EnseignantProfile,
        through='MembreJury',
        related_name='jurys',
        verbose_name="Membres du jury"
    )
    statut = models.CharField(
        max_length=20,
        choices=Statut.choices,
        default=Statut.PROPOSE,
        verbose_name="Statut"
    )
    date_validation = models.DateTimeField(null=True, blank=True, verbose_name="Date de validation")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")

    class Meta:
        verbose_name = "Jury"
        verbose_name_plural = "Jurys"
        ordering = ['-created_at']

    def __str__(self):
        return self.nom


class MembreJury(models.Model):
    """
    Table intermédiaire pour associer un enseignant à un jury avec un rôle spécifique
    """
    class Role(models.TextChoices):
        PRESIDENT = 'PRESIDENT', 'Président'
        RAPPORTEUR = 'RAPPORTEUR', 'Rapporteur'
        ENCADREUR = 'ENCADREUR', 'Encadreur'
        EXAMINATEUR = 'EXAMINATEUR', 'Examinateur'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    jury = models.ForeignKey(
        Jury,
        on_delete=models.CASCADE,
        related_name='composition',
        verbose_name="Jury"
    )
    enseignant = models.ForeignKey(
        EnseignantProfile,
        on_delete=models.CASCADE,
        related_name='participations_jury',
        verbose_name="Enseignant"
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        verbose_name="Rôle"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ajouté le")

    class Meta:
        verbose_name = "Membre du Jury"
        verbose_name_plural = "Membres du Jury"
        unique_together = ['jury', 'enseignant', 'role']
        ordering = ['role', 'enseignant__user__last_name']

    def __str__(self):
        return f"{self.enseignant.user.get_full_name()} - {self.get_role_display()} ({self.jury.nom})"


# ============================================================================
# SOUTENANCES
# ============================================================================

class Soutenance(models.Model):
    """
    Soutenance (assignation dossier + jury + planification)
    """
    class Statut(models.TextChoices):
        PLANIFIEE = 'PLANIFIEE', 'Planifiée'
        EN_COURS = 'EN_COURS', 'En cours'
        TERMINEE = 'TERMINEE', 'Terminée'
        ANNULEE = 'ANNULEE', 'Annulée'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dossier = models.OneToOneField(
        DossierSoutenance,
        on_delete=models.CASCADE,
        related_name='soutenance',
        verbose_name="Dossier"
    )
    jury = models.ForeignKey(
        Jury,
        on_delete=models.SET_NULL,
        null=True,
        related_name='soutenances',
        verbose_name="Jury"
    )
    salle = models.ForeignKey(
        Salle,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='soutenances',
        verbose_name="Salle"
    )
    date_heure = models.DateTimeField(null=True, blank=True, verbose_name="Date et heure")
    duree_minutes = models.IntegerField(default=45, verbose_name="Durée (minutes)")
    ordre_passage = models.IntegerField(null=True, blank=True, verbose_name="Ordre de passage")
    statut = models.CharField(
        max_length=20,
        choices=Statut.choices,
        default=Statut.PLANIFIEE,
        verbose_name="Statut"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")

    class Meta:
        verbose_name = "Soutenance"
        verbose_name_plural = "Soutenances"
        ordering = ['date_heure', 'ordre_passage']

    @property
    def session(self):
        """Récupérer la session depuis le dossier"""
        return self.dossier.session

    def __str__(self):
        return f"Soutenance de {self.dossier.candidat.user.get_full_name()}"

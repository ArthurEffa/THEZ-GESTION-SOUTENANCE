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
# PROFILS UTILISATEURS
# ============================================================================

class CandidatProfile(models.Model):
    """
    Profil étendu pour les candidats
    """
    class NiveauEtude(models.TextChoices):
        LICENCE = 'LICENCE', 'Licence'
        MASTER = 'MASTER', 'Master'
        DOCTORAT = 'DOCTORAT', 'Doctorat'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='candidat_profile',
        verbose_name="Utilisateur"
    )
    matricule = models.CharField(max_length=50, unique=True, verbose_name="Matricule")
    niveau_etude = models.CharField(
        max_length=20,
        choices=NiveauEtude.choices,
        verbose_name="Niveau d'étude"
    )
    filiere = models.CharField(max_length=100, verbose_name="Filière")
    specialite = models.CharField(max_length=100, verbose_name="Spécialité")
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
    departement = models.CharField(max_length=100, verbose_name="Département")
    specialite = models.CharField(max_length=100, verbose_name="Spécialité")
    disponibilites = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Disponibilités",
        help_text="Format JSON pour les disponibilités de planification"
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
    equipements = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Équipements",
        help_text="Liste des équipements disponibles"
    )
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
    theme = models.CharField(max_length=200, verbose_name="Thème")
    encadreur = models.ForeignKey(
        EnseignantProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='dossiers_encadres',
        verbose_name="Encadreur"
    )
    memoire_pdf = models.FileField(
        upload_to='memoires/',
        validators=[FileExtensionValidator(allowed_extensions=['pdf'])],
        blank=True,
        null=True,
        verbose_name="Mémoire PDF"
    )
    annexes = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Annexes",
        help_text="Liste des fichiers annexes"
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
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")

    class Meta:
        verbose_name = "Dossier de Soutenance"
        verbose_name_plural = "Dossiers de Soutenance"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.candidat.user.get_full_name()} - {self.titre_memoire[:50]}"


class FichierAnnexe(models.Model):
    """
    Fichiers annexes liés à un dossier
    """
    class TypeDocument(models.TextChoices):
        ATTESTATION = 'ATTESTATION', 'Attestation'
        FICHE_EVAL = 'FICHE_EVAL', 'Fiche d\'évaluation'
        AUTRE = 'AUTRE', 'Autre'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dossier = models.ForeignKey(
        DossierSoutenance,
        on_delete=models.CASCADE,
        related_name='fichiers_annexes',
        verbose_name="Dossier"
    )
    nom = models.CharField(max_length=200, verbose_name="Nom du fichier")
    fichier = models.FileField(upload_to='annexes/', verbose_name="Fichier")
    type_document = models.CharField(
        max_length=20,
        choices=TypeDocument.choices,
        default=TypeDocument.AUTRE,
        verbose_name="Type de document"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name="Uploadé le")

    class Meta:
        verbose_name = "Fichier Annexe"
        verbose_name_plural = "Fichiers Annexes"
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.nom} ({self.dossier.candidat.matricule})"


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
    president = models.ForeignKey(
        EnseignantProfile,
        on_delete=models.SET_NULL,
        null=True,
        related_name='jurys_presides',
        verbose_name="Président"
    )
    rapporteur = models.ForeignKey(
        EnseignantProfile,
        on_delete=models.SET_NULL,
        null=True,
        related_name='jurys_rapportes',
        verbose_name="Rapporteur"
    )
    examinateurs = models.ManyToManyField(
        EnseignantProfile,
        related_name='jurys_examines',
        blank=True,
        verbose_name="Examinateurs"
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

    class Mention(models.TextChoices):
        PASSABLE = 'PASSABLE', 'Passable'
        ASSEZ_BIEN = 'ASSEZ_BIEN', 'Assez Bien'
        BIEN = 'BIEN', 'Bien'
        TRES_BIEN = 'TRES_BIEN', 'Très Bien'
        EXCELLENT = 'EXCELLENT', 'Excellent'

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
    session = models.ForeignKey(
        SessionSoutenance,
        on_delete=models.CASCADE,
        related_name='soutenances',
        verbose_name="Session"
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
    duree_minutes = models.IntegerField(default=60, verbose_name="Durée (minutes)")
    ordre_passage = models.IntegerField(null=True, blank=True, verbose_name="Ordre de passage")
    statut = models.CharField(
        max_length=20,
        choices=Statut.choices,
        default=Statut.PLANIFIEE,
        verbose_name="Statut"
    )
    note_finale = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Note finale"
    )
    mention = models.CharField(
        max_length=20,
        choices=Mention.choices,
        null=True,
        blank=True,
        verbose_name="Mention"
    )
    observations = models.TextField(blank=True, verbose_name="Observations")
    pv_genere = models.BooleanField(default=False, verbose_name="PV généré")
    pv_file = models.FileField(
        upload_to='pv/',
        blank=True,
        null=True,
        verbose_name="Fichier PV"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modifié le")

    class Meta:
        verbose_name = "Soutenance"
        verbose_name_plural = "Soutenances"
        ordering = ['date_heure', 'ordre_passage']

    def __str__(self):
        return f"Soutenance de {self.dossier.candidat.user.get_full_name()}"

    def calculer_mention(self):
        """Calcule la mention selon la note finale"""
        if self.note_finale is None:
            return None

        note = float(self.note_finale)
        if note < 10:
            return None
        elif note < 12:
            return self.Mention.PASSABLE
        elif note < 14:
            return self.Mention.ASSEZ_BIEN
        elif note < 16:
            return self.Mention.BIEN
        elif note < 18:
            return self.Mention.TRES_BIEN
        else:
            return self.Mention.EXCELLENT


# ============================================================================
# EVALUATIONS
# ============================================================================

class Evaluation(models.Model):
    """
    Évaluation d'un membre du jury pour une soutenance
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    soutenance = models.ForeignKey(
        Soutenance,
        on_delete=models.CASCADE,
        related_name='evaluations',
        verbose_name="Soutenance"
    )
    evaluateur = models.ForeignKey(
        EnseignantProfile,
        on_delete=models.CASCADE,
        related_name='evaluations',
        verbose_name="Évaluateur"
    )
    note_memoire = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name="Note mémoire (/20)"
    )
    note_presentation = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name="Note présentation (/20)"
    )
    note_reponses = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name="Note réponses (/20)"
    )
    commentaires = models.TextField(blank=True, verbose_name="Commentaires")
    date_evaluation = models.DateTimeField(auto_now_add=True, verbose_name="Date d'évaluation")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")

    class Meta:
        verbose_name = "Évaluation"
        verbose_name_plural = "Évaluations"
        unique_together = ['soutenance', 'evaluateur']
        ordering = ['-date_evaluation']

    def __str__(self):
        return f"Évaluation de {self.evaluateur.user.get_full_name()} pour {self.soutenance}"

    @property
    def moyenne(self):
        """Calcule la moyenne pondérée de l'évaluation"""
        return (
            float(self.note_memoire) * 0.4 +
            float(self.note_presentation) * 0.3 +
            float(self.note_reponses) * 0.3
        )


# ============================================================================
# PROCÈS-VERBAUX
# ============================================================================

class ProcesVerbal(models.Model):
    """
    Procès-verbal d'une soutenance
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    soutenance = models.OneToOneField(
        Soutenance,
        on_delete=models.CASCADE,
        related_name='proces_verbal',
        verbose_name="Soutenance"
    )
    numero_pv = models.CharField(max_length=50, unique=True, verbose_name="Numéro PV")
    contenu = models.TextField(verbose_name="Contenu")
    date_generation = models.DateTimeField(auto_now_add=True, verbose_name="Date de génération")
    fichier_pdf = models.FileField(upload_to='pv/', verbose_name="Fichier PDF")
    signatures_jury = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Signatures du jury",
        help_text="Format: {president: true/false, rapporteur: true/false, ...}"
    )
    est_valide = models.BooleanField(default=False, verbose_name="Validé")
    date_validation = models.DateTimeField(null=True, blank=True, verbose_name="Date de validation")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")

    class Meta:
        verbose_name = "Procès-Verbal"
        verbose_name_plural = "Procès-Verbaux"
        ordering = ['-date_generation']

    def __str__(self):
        return f"PV {self.numero_pv} - {self.soutenance.dossier.candidat.user.get_full_name()}"


# ============================================================================
# NOTIFICATIONS
# ============================================================================

class Notification(models.Model):
    """
    Système de notifications pour les utilisateurs
    """
    class Type(models.TextChoices):
        CONVOCATION = 'CONVOCATION', 'Convocation'
        RAPPEL = 'RAPPEL', 'Rappel'
        MODIFICATION = 'MODIFICATION', 'Modification'
        INFO = 'INFO', 'Information'
        VALIDATION = 'VALIDATION', 'Validation'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    destinataire = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name="Destinataire"
    )
    type = models.CharField(
        max_length=20,
        choices=Type.choices,
        verbose_name="Type"
    )
    titre = models.CharField(max_length=200, verbose_name="Titre")
    message = models.TextField(verbose_name="Message")
    soutenance = models.ForeignKey(
        Soutenance,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name="Soutenance"
    )
    est_lu = models.BooleanField(default=False, verbose_name="Lu")
    date_envoi = models.DateTimeField(auto_now_add=True, verbose_name="Date d'envoi")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-date_envoi']

    def __str__(self):
        return f"{self.get_type_display()} - {self.destinataire.get_full_name()}"


# ============================================================================
# COMMENTAIRES
# ============================================================================

class Commentaire(models.Model):
    """
    Commentaires sur les dossiers de soutenance
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dossier = models.ForeignKey(
        DossierSoutenance,
        on_delete=models.CASCADE,
        related_name='commentaires',
        verbose_name="Dossier"
    )
    auteur = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='commentaires',
        verbose_name="Auteur"
    )
    contenu = models.TextField(verbose_name="Contenu")
    est_interne = models.BooleanField(
        default=False,
        verbose_name="Interne",
        help_text="Visible seulement par admin et encadreur"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Créé le")

    class Meta:
        verbose_name = "Commentaire"
        verbose_name_plural = "Commentaires"
        ordering = ['-created_at']

    def __str__(self):
        return f"Commentaire de {self.auteur.get_full_name()} sur {self.dossier}"

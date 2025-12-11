// ============================================================================
// TYPES CORRESPONDANT AUX MODELS DJANGO
// ============================================================================

// Rôles utilisateur (RBAC)
export type UserRole = 'ADMIN' | 'CANDIDAT' | 'ENSEIGNANT';

// Niveaux d'étude
export type NiveauEtude = 'LICENCE' | 'MASTER' | 'DOCTORAT';

// Grades enseignant
export type GradeEnseignant = 'PROFESSEUR' | 'MAITRE_CONF' | 'CHARGE_COURS' | 'ASSISTANT';

// Statuts session
export type StatutSession = 'OUVERT' | 'FERME' | 'EN_COURS' | 'TERMINE';

// Statuts dossier
export type StatutDossier = 'BROUILLON' | 'DEPOSE' | 'VALIDE' | 'REJETE';

// Statuts jury
export type StatutJury = 'PROPOSE' | 'VALIDE' | 'ACTIF';

// Rôles membre jury
export type RoleMembreJury = 'PRESIDENT' | 'RAPPORTEUR' | 'ENCADREUR' | 'EXAMINATEUR';

// Statuts soutenance
export type StatutSoutenance = 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

// Types de documents
export type TypeDocument = 
  | 'MEMOIRE' 
  | 'RECU_PAIEMENT' 
  | 'ACCORD_STAGE' 
  | 'LETTRE_MISE_EN_STAGE' 
  | 'CERTIFICAT_SCOLARITE' 
  | 'ATTESTATION' 
  | 'AUTRE';

// ============================================================================
// INTERFACES
// ============================================================================

export interface CustomUser {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  date_joined: string;
}

export interface Departement {
  id: string;
  code: string;
  nom: string;
  description?: string;
}

export interface CandidatProfile {
  id: string;
  user: CustomUser;
  user_id: string;
  matricule: string;
  niveau_etude: NiveauEtude;
  departement: Departement;
  departement_id: string;
  specialite: string;
  photo?: string;
  created_at: string;
  updated_at: string;
}

export interface EnseignantProfile {
  id: string;
  user: CustomUser;
  user_id: string;
  grade: GradeEnseignant;
  departements: Departement[];
  specialite: string;
  disponibilites: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SessionSoutenance {
  id: string;
  titre: string;
  annee_academique: string;
  date_ouverture: string;
  date_cloture: string;
  niveau_concerne: string;
  statut: StatutSession;
  description?: string;
  created_by_id?: string;
  created_by?: CustomUser;
  created_at: string;
  updated_at: string;
}

export interface Salle {
  id: string;
  nom: string;
  batiment: string;
  capacite: number;
  equipements: string[];
  est_disponible: boolean;
  created_at: string;
}

export interface DossierSoutenance {
  id: string;
  candidat: CandidatProfile;
  candidat_id: string;
  session: SessionSoutenance;
  session_id: string;
  titre_memoire: string;
  theme: string;
  encadreur?: EnseignantProfile;
  encadreur_id?: string;
  statut: StatutDossier;
  date_depot: string;
  date_validation?: string;
  commentaires_admin?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  dossier: DossierSoutenance;
  dossier_id: string;
  nom: string;
  fichier: string;
  type_piece: TypeDocument;
  est_obligatoire: boolean;
  uploaded_at: string;
}

export interface Jury {
  id: string;
  nom: string;
  session: SessionSoutenance;
  session_id: string;
  membres: MembreJury[];
  statut: StatutJury;
  date_validation?: string;
  created_at: string;
}

export interface MembreJury {
  id: string;
  jury_id: string;
  enseignant: EnseignantProfile;
  enseignant_id: string;
  role: RoleMembreJury;
  created_at: string;
}

export interface Soutenance {
  id: string;
  dossier: DossierSoutenance;
  dossier_id: string;
  jury?: Jury;
  jury_id?: string;
  session: SessionSoutenance;
  session_id: string;
  salle?: Salle;
  salle_id?: string;
  date_heure?: string;
  duree_minutes: number;
  ordre_passage?: number;
  statut: StatutSoutenance;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// LABELS FRANÇAIS
// ============================================================================

export const NIVEAU_ETUDE_LABELS: Record<NiveauEtude, string> = {
  LICENCE: 'Licence',
  MASTER: 'Master',
  DOCTORAT: 'Doctorat',
};

export const GRADE_ENSEIGNANT_LABELS: Record<GradeEnseignant, string> = {
  PROFESSEUR: 'Professeur',
  MAITRE_CONF: 'Maître de Conférence',
  CHARGE_COURS: 'Chargé de Cours',
  ASSISTANT: 'Assistant',
};

export const STATUT_SESSION_LABELS: Record<StatutSession, string> = {
  OUVERT: 'Ouvert',
  FERME: 'Fermé',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
};

export const STATUT_DOSSIER_LABELS: Record<StatutDossier, string> = {
  BROUILLON: 'Brouillon',
  DEPOSE: 'Déposé',
  VALIDE: 'Validé',
  REJETE: 'Rejeté',
};

export const STATUT_JURY_LABELS: Record<StatutJury, string> = {
  PROPOSE: 'Proposé',
  VALIDE: 'Validé',
  ACTIF: 'Actif',
};

export const ROLE_MEMBRE_JURY_LABELS: Record<RoleMembreJury, string> = {
  PRESIDENT: 'Président',
  RAPPORTEUR: 'Rapporteur',
  ENCADREUR: 'Encadreur',
  EXAMINATEUR: 'Examinateur',
};

export const STATUT_SOUTENANCE_LABELS: Record<StatutSoutenance, string> = {
  PLANIFIEE: 'Planifiée',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée',
};

export const TYPE_DOCUMENT_LABELS: Record<TypeDocument, string> = {
  MEMOIRE: 'Mémoire',
  RECU_PAIEMENT: 'Reçu de paiement',
  ACCORD_STAGE: 'Accord de stage',
  LETTRE_MISE_EN_STAGE: 'Lettre de mise en stage',
  CERTIFICAT_SCOLARITE: 'Certificat de scolarité',
  ATTESTATION: 'Attestation',
  AUTRE: 'Autre',
};

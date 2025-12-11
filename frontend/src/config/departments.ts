// Configuration centralisée des départements de l'école

export interface Department {
  id: string;
  code: string;
  nom: string;
  description: string;
  color: {
    bg: string;
    text: string;
    border: string;
  };
}

export const DEPARTMENTS: Department[] = [
  { 
    id: "1", 
    code: "GIT", 
    nom: "Génie Informatique & Télécommunications", 
    description: "Informatique, réseaux et systèmes de communication",
    color: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-l-blue-500" }
  },
  { 
    id: "2", 
    code: "GESI", 
    nom: "Génie Électrique et Systèmes Intelligents", 
    description: "Électronique, automatique et systèmes embarqués",
    color: { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-l-purple-500" }
  },
  { 
    id: "3", 
    code: "GQHSEI", 
    nom: "Génie de la Qualité HSE Industriel", 
    description: "Management de la qualité et sécurité industrielle",
    color: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-l-emerald-500" }
  },
  { 
    id: "4", 
    code: "GAM", 
    nom: "Génie Automobile et Mécatronique", 
    description: "Conception automobile et systèmes mécatroniques",
    color: { bg: "bg-rose-500/10", text: "text-rose-600", border: "border-l-rose-500" }
  },
  { 
    id: "5", 
    code: "GMP", 
    nom: "Génie Maritime et Portuaire", 
    description: "Ingénierie maritime et gestion portuaire",
    color: { bg: "bg-cyan-500/10", text: "text-cyan-600", border: "border-l-cyan-500" }
  },
  { 
    id: "6", 
    code: "GP", 
    nom: "Génie des Procédés", 
    description: "Transformation de la matière et procédés industriels",
    color: { bg: "bg-orange-500/10", text: "text-orange-600", border: "border-l-orange-500" }
  },
  { 
    id: "7", 
    code: "GEN", 
    nom: "Génie Énergétique", 
    description: "Production et gestion de l'énergie",
    color: { bg: "bg-yellow-500/10", text: "text-yellow-600", border: "border-l-yellow-500" }
  },
  { 
    id: "8", 
    code: "GM", 
    nom: "Génie Mécanique", 
    description: "Conception et fabrication mécanique",
    color: { bg: "bg-slate-500/10", text: "text-slate-600", border: "border-l-slate-500" }
  },
  { 
    id: "9", 
    code: "GPH", 
    nom: "Génie Physique", 
    description: "Applications industrielles de la physique",
    color: { bg: "bg-indigo-500/10", text: "text-indigo-600", border: "border-l-indigo-500" }
  },
  { 
    id: "10", 
    code: "GC", 
    nom: "Génie Civil", 
    description: "Construction et infrastructures",
    color: { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-l-amber-500" }
  },
  { 
    id: "11", 
    code: "MP", 
    nom: "Master Professionnel", 
    description: "Formations professionnelles de troisième cycle",
    color: { bg: "bg-pink-500/10", text: "text-pink-600", border: "border-l-pink-500" }
  },
];

// Helper pour obtenir la couleur d'un département par son nom
export const getDepartmentColor = (departmentName: string) => {
  const dept = DEPARTMENTS.find(d => d.nom === departmentName);
  return dept?.color || { bg: "bg-muted", text: "text-muted-foreground", border: "border-l-muted-foreground" };
};

// Helper pour obtenir un département par son code
export const getDepartmentByCode = (code: string) => {
  return DEPARTMENTS.find(d => d.code === code);
};

// Helper pour obtenir un département par son nom
export const getDepartmentByName = (name: string) => {
  return DEPARTMENTS.find(d => d.nom === name);
};

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2, Mail, Lock, CalendarCheck, Users, GraduationCap } from "lucide-react";
import { toast } from "sonner";

import illustration from "@/assets/login-illustration.png";
import logo from "@/assets/logo.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);

    if (success) {
      toast.success("Connexion réussie !");
      navigate("/");
    } else {
      setError("Email ou mot de passe incorrect.");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans">
      {/* ==================== PARTIE GAUCHE - ILLUSTRATION EN FOND ==================== */}
      <div className="hidden lg:relative lg:block lg:overflow-hidden bg-gradient-to-br from-indigo-900 to-blue-700">
        {/* Image en arrière-plan absolue */}
        <img
          src={illustration}
          alt="Illustration Soutenance"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Overlay semi-transparent pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/70 via-blue-950/60 to-transparent" />

        {/* Contenu structure en 3 blocs */}
        <div className="relative z-10 flex h-full flex-col justify-between px-12 xl:px-16 py-16">

          {/* BLOC 1 : Titre + Slogan */}
          <div className="space-y-4">
            <h1 className="text-6xl xl:text-7xl font-extrabold text-white tracking-tight leading-none drop-shadow-lg"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800 }}>
              THEZ
            </h1>
            <p className="text-xl text-cyan-100 font-light leading-relaxed max-w-sm">
              Votre plateforme de gestion des soutenances academiques
            </p>
          </div>

          {/* BLOC 2 : Espace de respiration */}
          <div className="flex-1" />

          {/* BLOC 3 : Liste des benefices */}
          <div className="space-y-5">
            {/* Item 1 */}
            <div className="flex items-center gap-4">
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-3">
                <CalendarCheck className="h-6 w-6 text-yellow-300" />
              </div>
              <div>
                <span className="text-white font-semibold text-base">Planifiez les soutenances</span>
                <p className="text-cyan-200/80 text-sm">Organisez vos sessions en quelques clics</p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-center gap-4">
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-3">
                <Users className="h-6 w-6 text-yellow-300" />
              </div>
              <div>
                <span className="text-white font-semibold text-base">Gerez les jurys et salles</span>
                <p className="text-cyan-200/80 text-sm">Affectez les ressources facilement</p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-center gap-4">
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-3">
                <GraduationCap className="h-6 w-6 text-yellow-300" />
              </div>
              <div>
                <span className="text-white font-semibold text-base">Suivez les etudiants</span>
                <p className="text-cyan-200/80 text-sm">Accompagnez-les jusqu'a la reussite</p>
              </div>
            </div>
          </div>

          {/* Elements decoratifs */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-blue-400/15 rounded-full blur-3xl" />
        </div>
      </div>

      {/* ==================== PARTIE DROITE - FORMULAIRE ==================== */}
      <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12 lg:py-0">
        <div className="w-full max-w-md space-y-8">
          {/* Logo + Titre */}
          <div className="flex flex-col items-center space-y-4">
            <img
              src={logo}
              alt="THEZ Logo"
              className="h-20 w-auto object-contain"
            />
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Connexion
              </h2>
              <p className="text-sm text-slate-500">
                Entrez vos identifiants pour acceder a votre espace
              </p>
            </div>
            <div className="h-px w-full bg-slate-200 mt-2" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  className="h-11 pl-10 rounded-lg border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  className="h-11 pl-10 pr-10 rounded-lg border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Se souvenir de moi
              </label>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Mot de passe oublie ?
              </button>
            </div>

            {/* Message d'erreur */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            {/* Bouton Login */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium rounded-lg shadow-md shadow-blue-200/50 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

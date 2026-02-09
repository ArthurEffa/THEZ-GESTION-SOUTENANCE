import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, Mail, Lock, Github, Users, MousePointerClick } from "lucide-react";
import { toast } from "sonner";
import analyticsService from "@/services/analyticsService";

import logo from "@/assets/logo.png";

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

// Schéma de validation
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse email est requise")
    .email("Veuillez entrer une adresse email valide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['site-stats'],
    queryFn: () => analyticsService.getStats(),
    refetchInterval: 15000,
    enabled: IS_DEMO,
  });

  useEffect(() => {
    if (IS_DEMO) analyticsService.trackPageView();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: IS_DEMO
      ? { email: "admin@ecole.fr", password: "admin123456789" }
      : { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");
    setIsLoading(true);

    const success = await login(data.email, data.password);
    setIsLoading(false);

    if (success) {
      toast.success("Connexion réussie !");
      navigate("/");
    } else {
      setServerError("Email ou mot de passe incorrect.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="flex flex-col items-center space-y-4 pb-2">
          <img
            src={logo}
            alt="Logo THEZ"
            className="h-20 w-auto object-contain"
          />
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Connexion
            </h1>
            <p className="text-sm text-slate-500">
              Entrez vos identifiants pour accéder à votre espace
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  className={`h-11 pl-10 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  disabled={isLoading}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  className={`h-11 pl-10 pr-10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  disabled={isLoading}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Erreur serveur */}
            {serverError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                {serverError}
              </p>
            )}

            {/* Bouton */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11"
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
        </CardContent>
      </Card>

      {/* Encadré Open Source — visible uniquement en mode démo */}
      {IS_DEMO && (
        <div className="w-full max-w-md mt-4 p-4 rounded-lg border border-slate-200 bg-white shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Github className="h-5 w-5 text-slate-700" />
            <h3 className="font-semibold text-slate-800 text-sm">Projet Open Source</h3>
          </div>
          <p className="text-xs text-slate-500">
            THEZ est libre et open source. Clonez le repo, adaptez-le ou contribuez.
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => analyticsService.trackRepoClick()}
            >
              <Github className="h-4 w-4" />
              Cloner le repo
            </Button>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MousePointerClick className="h-3.5 w-3.5" />
                <strong className="text-slate-700">{stats?.repo_clicks ?? 0}</strong> clics
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <strong className="text-slate-700">{stats?.page_views ?? 0}</strong> vues
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400">
            Identifiants de test pré-remplis ci-dessus. Cliquez sur "Se connecter" pour tester.
          </p>
        </div>
      )}
    </div>
  );
}

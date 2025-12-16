import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import loginBackground from "@/assets/login-background.jpg";
import logo from "@/assets/logo.png";

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
      setError("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);

    if (success) {
      toast.success("Connexion reussie");
      navigate("/");
    } else {
      setError("Email ou mot de passe incorrect.");
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      {/* Glassmorphism Card */}
      <div className="w-full max-w-md">
        <div 
          className="relative backdrop-blur-md bg-white/20 rounded-2xl p-8 border border-amber-400/60 shadow-2xl"
          style={{
            boxShadow: '0 0 40px rgba(212, 175, 55, 0.2), 0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <img 
              src={logo} 
              alt="GestSoutenance Logo" 
              className="h-20 w-20 object-contain mb-4"
            />
            <h1 className="text-2xl font-bold text-blue-900 drop-shadow-sm">GestSoutenance</h1>
            <p className="text-sm text-amber-600 font-medium drop-shadow-sm mt-1">
              Gestion des soutenances academiques
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-900 drop-shadow-sm">Email</label>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-11 bg-white/90 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11 pr-10 bg-white/90 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex justify-center">
                <span className="inline-block px-3 py-1.5 text-sm text-white bg-red-500 rounded-md">
                  {error}
                </span>
              </div>
            )}

            {/* Actions Row */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                className="text-sm font-semibold text-amber-500 hover:text-amber-400 hover:underline transition-colors drop-shadow-sm"
              >
                Mot de passe oublie ?
              </button>
              
              <Button 
                type="submit" 
                className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-white/80 font-medium mt-6 drop-shadow-sm">
            2024 GestSoutenance
          </p>
        </div>
      </div>
    </div>
  );
}

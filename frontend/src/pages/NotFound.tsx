import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import notFoundHeroImg from "@/assets/illustrations/404-hero.png";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-6">
      <div className="w-full max-w-lg">
        <img
          src={notFoundHeroImg}
          alt="Page non trouvée"
          className="w-full h-auto"
        />
      </div>

      <div className="text-center space-y-3">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">Page non trouvée</h2>
        <p className="text-base text-muted-foreground max-w-md">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <Button
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <Home className="h-4 w-4" />
          Accueil
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import notFoundHeroImg from "@/assets/illustrations/404-hero.png";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Colonne de gauche (Image) */}
      <div className="hidden lg:flex items-center justify-center bg-muted/30 p-8">
        <img
          src={notFoundHeroImg}
          alt="Page non trouvée"
          className="w-full max-w-md object-contain"
        />
      </div>

      {/* Colonne de droite (Contenu) */}
      <div className="flex flex-col items-center justify-center p-8 space-y-6">
        {/* Image pour mobile */}
        <img
          src={notFoundHeroImg}
          alt="Page non trouvée"
          className="w-full max-w-sm lg:hidden"
        />
        <div className="text-center space-y-3">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold">Page Introuvable</h2>
          <p className="text-base text-muted-foreground max-w-md">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Button onClick={() => navigate("/")}>
            <Home className="h-4 w-4 mr-2" />
            Accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

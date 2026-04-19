import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 shadow-xl">
        <Sparkles className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-6xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
        404
      </h1>
      <h2 className="text-2xl font-bold mb-2">הדף לא נמצא</h2>
      <p className="text-muted-foreground mb-8 max-w-xs">
        נראה שהגעת לדף שלא קיים. אל דאגה, CleanMatch עדיין כאן בשבילך.
      </p>
      <Button
        onClick={() => navigate("/")}
        className="bg-gradient-to-r from-primary to-secondary text-white rounded-full px-8 py-5 text-base font-bold shadow-lg hover:scale-105 transition-transform"
      >
        חזור לדף הבית
      </Button>
    </div>
  );
};

export default NotFound;


import { Link, useNavigate } from "react-router-dom";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-3 sm:px-6 h-12 bg-black/40 backdrop-blur-[10px] border-b border-white/10 shadow-md">
        {/* App name */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="CleanMatch" className="h-8 w-auto drop-shadow" />
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
            CleanMatch
          </span>
        </Link>

        {/* Auth buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate("/auth?tab=login")}
            className="px-3 py-1 text-xs text-white/80 hover:text-white transition-colors"
          >
            התחברות
          </button>
          <button
            onClick={() => navigate("/auth?tab=signup")}
            className="px-3 py-1 text-xs font-medium rounded-full bg-primary hover:bg-primary/90 text-white transition-colors"
          >
            הרשמה
          </button>
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1 pt-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-50 px-4 py-2 flex flex-col items-center gap-1 bg-black/60 backdrop-blur-[12px]">
        <div className="flex items-center gap-3 text-[11px] text-white/50">
          <Link to="/privacy" className="hover:text-white/80 transition-colors">מדיניות פרטיות</Link>
          <span className="opacity-30">·</span>
          <Link to="/terms" className="hover:text-white/80 transition-colors">תנאי שימוש</Link>
        </div>
        <p className="text-[10px] text-white">© {new Date().getFullYear()} כל הזכויות שמורות ל-Relaya</p>
      </footer>
    </div>
  );
};

export default LandingLayout;

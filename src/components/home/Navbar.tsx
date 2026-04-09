import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = location.pathname === "/";

  const scrollToSection = useCallback(
    (id: string) => {
      if (isHome) {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    },
    [isHome]
  );

  const navLinkClass =
    "text-[11px] tracking-[0.25em] uppercase font-sans text-muted-foreground hover:text-foreground transition-colors duration-500 cursor-pointer";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border/30"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="font-serif text-xl tracking-[0.12em] text-foreground hover:text-accent transition-colors duration-500 leading-none"
        >
          MÉMOIRE
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-10">
          {isHome ? (
            <button onClick={() => scrollToSection("create-section")} className={navLinkClass}>
              Create
            </button>
          ) : (
            <Link to="/#create-section" className={navLinkClass}>
              Create
            </Link>
          )}
          {isHome ? (
            <button onClick={() => scrollToSection("compositions")} className={navLinkClass}>
              Compositions
            </button>
          ) : (
            <Link to="/#compositions" className={navLinkClass}>
              Compositions
            </Link>
          )}
          {isHome ? (
            <button onClick={() => scrollToSection("philosophy")} className={navLinkClass}>
              About
            </button>
          ) : (
            <Link to="/#philosophy" className={navLinkClass}>
              About
            </Link>
          )}
        </div>

        {/* Auth / Dashboard */}
        <div className="flex items-center gap-6">
          {user && (
            <Link
              to="/dashboard"
              className="text-[11px] tracking-[0.2em] uppercase font-sans text-muted-foreground hover:text-foreground transition-colors duration-500"
            >
              Dashboard
            </Link>
          )}
          <Link
            to={user ? "/dashboard" : "/auth"}
            className="text-[11px] tracking-[0.2em] uppercase font-sans px-5 py-2 border border-border/60 text-muted-foreground rounded-sm hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-500"
          >
            {user ? "My Account" : "Login / Sign Up"}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

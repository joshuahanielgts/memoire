import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = location.pathname === "/";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border/30"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="font-serif text-xl tracking-[0.05em] text-foreground hover:text-accent transition-colors duration-300">
          MÉMOIRE
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-10">
          <Link
            to="/create"
            className="text-[11px] tracking-[0.25em] uppercase font-sans text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            Create
          </Link>
          {isHome ? (
            <a
              href="#compositions"
              className="text-[11px] tracking-[0.25em] uppercase font-sans text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Compositions
            </a>
          ) : (
            <Link
              to="/#compositions"
              className="text-[11px] tracking-[0.25em] uppercase font-sans text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Compositions
            </Link>
          )}
          {isHome ? (
            <a
              href="#philosophy"
              className="text-[11px] tracking-[0.25em] uppercase font-sans text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              About
            </a>
          ) : (
            <Link
              to="/#philosophy"
              className="text-[11px] tracking-[0.25em] uppercase font-sans text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              About
            </Link>
          )}
        </div>

        {/* Login */}
        <button className="text-[11px] tracking-[0.2em] uppercase font-sans px-5 py-2 border border-border/60 text-muted-foreground rounded-sm hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300">
          Login
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

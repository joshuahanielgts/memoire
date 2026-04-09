import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (mode === "signup" && password !== confirmPassword) {
      toast.error("Passwords do not match");
      setSubmitting(false);
      return;
    }

    const { error } =
      mode === "login"
        ? await signIn(email, password)
        : await signUp(email, password, fullName);

    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (mode === "signup") {
      toast.success("Account created. Please check your email to confirm.");
      return;
    }

    // Successful login — return to checkout or home
    navigate(returnTo || "/");
  };

  const fromCheckout = returnTo === "/create?resume=checkout";

  const inputClass =
    "w-full bg-transparent border-b border-border/40 py-3 text-sm font-light text-foreground placeholder:text-muted-foreground/40 focus:border-accent focus:outline-none transition-colors duration-500";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 animate-fade-in">
      {/* Brand */}
      <Link
        to="/"
        className="absolute top-6 left-6 md:left-12 font-serif text-lg text-foreground hover:text-accent transition-colors duration-500"
      >
        MÉMOIRE
      </Link>

      <div className="w-full max-w-md space-y-12">
        {/* Heading */}
        <div className="text-center space-y-4">
          <h1 className="font-serif text-3xl md:text-4xl text-foreground font-light leading-snug">
            {fromCheckout
              ? "Continue your composition"
              : "Enter your private composition space"}
          </h1>
          <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-sm mx-auto">
            {fromCheckout
              ? "Sign in or create an account to complete your purchase. Your selected composition has been saved for this session."
              : "Save your fragrance compositions, access scent reports, and receive your uniqueness certificate."}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-8">
          <button
            onClick={() => setMode("login")}
            className={`text-[11px] tracking-[0.25em] uppercase font-sans pb-2 border-b-2 transition-all duration-500 ${
              mode === "login"
                ? "text-foreground border-accent"
                : "text-muted-foreground/40 border-transparent hover:text-muted-foreground"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`text-[11px] tracking-[0.25em] uppercase font-sans pb-2 border-b-2 transition-all duration-500 ${
              mode === "signup"
                ? "text-foreground border-accent"
                : "text-muted-foreground/40 border-transparent hover:text-muted-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className={inputClass}
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className={inputClass}
          />
          {mode === "signup" && (
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className={inputClass}
            />
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-foreground text-background py-4 text-xs tracking-[0.3em] uppercase font-sans hover:bg-foreground/90 transition-all duration-500 disabled:opacity-50 mt-4"
          >
            {submitting
              ? "Please wait…"
              : mode === "login"
              ? "Continue"
              : "Create Account"}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-muted-foreground/50 text-xs font-light">
          {mode === "login" ? (
            <>
              New here?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-foreground hover:text-accent transition-colors duration-300 underline underline-offset-4"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-foreground hover:text-accent transition-colors duration-300 underline underline-offset-4"
              >
                Sign in
              </button>
            </>
          )}
        </p>

        {/* Benefits */}
        <div className="pt-8 border-t border-border/20 space-y-3">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/40 font-sans text-center">
            Your account includes
          </p>
          <div className="flex flex-col items-center gap-2 text-muted-foreground/60 text-xs font-light">
            <span>· Save your fragrance compositions</span>
            <span>· Access your scent report</span>
            <span>· View your uniqueness certificate</span>
            <span>· Complete and track your order</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

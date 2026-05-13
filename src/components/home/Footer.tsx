import BrandLogo from "@/components/BrandLogo";

const Footer = () => (
  <footer className="py-16 px-6 border-t border-border/30">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <BrandLogo className="h-16 w-auto" />
      <p className="text-muted-foreground/50 text-[10px] tracking-[0.2em] uppercase font-sans">
        © 2026 · Personalized Fragrance Atelier
      </p>
    </div>
  </footer>
);

export default Footer;

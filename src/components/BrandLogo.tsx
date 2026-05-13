interface BrandLogoProps {
  className?: string;
  alt?: string;
}

const BrandLogo = ({ className = "h-12 w-auto", alt = "Memoire logo" }: BrandLogoProps) => {
  return <img src="/logo-full.png" alt={alt} className={className} />;
};

export default BrandLogo;

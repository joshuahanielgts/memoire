import Hero from "@/components/home/Hero";
import Process from "@/components/home/Process";
import FeaturedCreations from "@/components/home/FeaturedCreations";
import Philosophy from "@/components/home/Philosophy";
import ReportPreview from "@/components/home/ReportPreview";
import FinalCTA from "@/components/home/FinalCTA";
import Footer from "@/components/home/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Process />
      <FeaturedCreations />
      <Philosophy />
      <ReportPreview />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Index;

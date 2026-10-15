import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import Problem from "../../components/Problem/Problem";
import Features from "../../components/Features/Features";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import DashboardPreview from "../../components/DashboardPreview/DashboardPreview";
import WhyJobPulse from "../../components/WhyJobPulse/WhyJobPulse";
import AIDemo from "../../components/AIDemo/AIDemo";
import FAQ from "../../components/FAQ/FAQ";
import CTA from "../../components/CTA/CTA";
import Footer from "../../components/Footer/Footer";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Problem />
      <Features />
      <HowItWorks/>
      <DashboardPreview />
      <WhyJobPulse />
      <AIDemo/>
      <FAQ/>
      <CTA/>
      <Footer/>
    </>
  );
}

export default Home;
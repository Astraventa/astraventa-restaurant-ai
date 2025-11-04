import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ChatDemo from "@/components/ChatDemo";
import Features from "@/components/Features";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <ChatDemo />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

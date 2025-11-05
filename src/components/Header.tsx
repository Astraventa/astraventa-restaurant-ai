import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-colors ${
      scrolled ? "bg-background/70 backdrop-blur-md border-b border-white/10" : "bg-transparent"
    }`}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <a href="#hero" className="flex items-center space-x-3 group">
            <img src="/logo.png" alt="Astraventa AI" className="h-10 sm:h-11 w-auto drop-shadow-glow" />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("hero")}
              className={`text-sm font-medium transition-colors hover:underline underline-offset-4 ${
                scrolled ? "text-foreground hover:text-foreground" : "text-white/90 hover:text-white"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className={`text-sm font-medium transition-colors hover:underline underline-offset-4 ${
                scrolled ? "text-foreground hover:text-foreground" : "text-white/90 hover:text-white"
              }`}
            >
              Solutions
            </button>
            <button
              onClick={() => scrollToSection("demo")}
              className={`text-sm font-medium transition-colors hover:underline underline-offset-4 ${
                scrolled ? "text-foreground hover:text-foreground" : "text-white/90 hover:text-white"
              }`}
            >
              Demo
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className={`text-sm font-medium transition-colors hover:underline underline-offset-4 ${
                scrolled ? "text-foreground hover:text-foreground" : "text-white/90 hover:text-white"
              }`}
            >
              Contact
            </button>
            <Button
              onClick={() => scrollToSection("demo")}
              className="bg-gradient-premium hover:opacity-90 transition-opacity shadow-glow"
            >
              Try Demo
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 animate-fade-in bg-background/85 rounded-xl shadow-soft">
            <button
              onClick={() => scrollToSection("hero")}
              className="block w-full text-left px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="block w-full text-left px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Solutions
            </button>
            <button
              onClick={() => scrollToSection("demo")}
              className="block w-full text-left px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Demo
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="block w-full text-left px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Contact
            </button>
            <Button
              onClick={() => scrollToSection("demo")}
              className="w-full bg-gradient-premium hover:opacity-90 transition-opacity"
            >
              Try Demo
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;

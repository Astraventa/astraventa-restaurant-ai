import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import heroBg from "@/assets/restaurant-hero.jpg";

const Hero = () => {
  const scrollToDemo = () => {
    const element = document.getElementById("demo");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(0,0%,0%,0.75)] via-[hsl(24,85%,25%,0.85)] to-[hsl(12,80%,20%,0.9)]"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-pulse-soft"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }}></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center mt-8 md:mt-12">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Empower Your Restaurant with{" "}
            <span className="bg-gradient-gold bg-clip-text text-transparent drop-shadow-glow">
              24/7 AI Chat Assistance
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Astraventa AI helps restaurants automate reservations, menu inquiries,
            and lead capture effortlessly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={scrollToDemo}
              size="lg"
              className="bg-gradient-gold hover:opacity-90 text-white shadow-glow text-base sm:text-lg px-8 py-6 group font-semibold"
            >
              Try the Live Demo
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              onClick={() => {
                const message = encodeURIComponent("Hi! I'd like to schedule a demo call to see Astraventa AI in action for my restaurant.");
                window.open(`https://wa.me/923055255838?text=${message}`, "_blank", "noopener,noreferrer");
              }}
              size="lg"
              className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 text-base sm:text-lg px-8 py-6"
            >
              Book a Demo
            </Button>
          </div>

          {/* Stats or trust indicators */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2">24/7</div>
              <div className="text-sm sm:text-base text-white/90">Always Available</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2">&lt;1s</div>
              <div className="text-sm sm:text-base text-white/90">Response Time</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <div className="text-sm sm:text-base text-white/90">5-Star Rated</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;

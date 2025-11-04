import { Zap, Search, Calendar, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Zap,
    title: "Instant Replies",
    description: "Lightning-fast responses to customer queries with natural language understanding",
  },
  {
    icon: Search,
    title: "Smart Menu Search",
    description: "AI-powered menu navigation that helps customers find exactly what they're looking for",
  },
  {
    icon: Calendar,
    title: "Easy Table Booking",
    description: "Seamless reservation system integrated directly into the chat experience",
  },
  {
    icon: TrendingUp,
    title: "Lead Capture & Analytics",
    description: "Automatically capture customer information and gain insights from conversation data",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Powerful Features for{" "}
            <span className="bg-gradient-premium bg-clip-text text-transparent">
              Modern Restaurants
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to provide exceptional customer service, 24/7
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 sm:p-8 hover:shadow-glow transition-all duration-300 border-border hover:border-primary/50 animate-slide-up bg-gradient-to-br from-card to-muted/20 hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4 w-14 h-14 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-glow">
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Additional benefits section */}
        <div className="mt-20 text-center">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-3xl p-8 sm:p-12 border border-primary/20 animate-fade-in shadow-glow">
            <h3 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-premium bg-clip-text text-transparent">
              Why Choose Astraventa AI?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-sm">
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2">99.9%</div>
                <p className="text-foreground/80 font-medium">Uptime Guarantee</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-sm">
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2">5x</div>
                <p className="text-foreground/80 font-medium">Faster Response</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-sm">
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2">30%</div>
                <p className="text-foreground/80 font-medium">More Bookings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;

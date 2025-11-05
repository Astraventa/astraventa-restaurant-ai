import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin } from "lucide-react";
import { createSupabaseForClient } from "@/lib/supabase";
import { useClientId } from "@/hooks/use-client-id";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const { toast } = useToast();
  const clientId = useClientId();

  const isDisabled = useMemo(() => status === "submitting" || status === "success", [status]);

  const validate = () => {
    const next: { name?: string; email?: string; message?: string } = {};
    if (!formData.name || formData.name.trim().length < 2) next.name = "Please enter your full name.";
    if (formData.name.trim().length > 100) next.name = "Name is too long.";
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRe.test(formData.email)) next.email = "Please enter a valid email address.";
    if (!formData.message || formData.message.trim().length < 10) next.message = "Message must be at least 10 characters.";
    if (formData.message.trim().length > 2000) next.message = "Message is too long (max 2000 characters).";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setStatus("submitting");
    try {
      const sb = createSupabaseForClient(clientId || undefined);
      const { error } = await sb
        .from("contact_submissions")
        .insert(
          [
            {
              name: formData.name,
              email: formData.email,
              message: formData.message,
              source: "web",
              user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
              utm: {},
            },
          ],
          { returning: "minimal", count: "none" }
        );

      if (error) throw error;

      // Attempt to send confirmation email via Edge Function (non-blocking)
      try {
        const { data, error: fnError } = await sb.functions.invoke("send-contact-email", {
          body: { name: formData.name, email: formData.email, message: formData.message },
        });
        if (!fnError && (data as any)?.ok) {
          const via = (data as any)?.from ? ` via ${(data as any).from}` : "";
          toast({ title: "Email notification sent", description: `We have notified our team${via}.` });
        } else {
          toast({ title: "Saved, but email not delivered", description: "We'll still follow up from the dashboard.", variant: "destructive" });
        }
      } catch (e) {
        // Non-blocking: log but do not surface error to user
        console.warn("send-contact-email failed", e);
      }

      toast({ title: "Message sent!", description: "We’ll get back to you within 24 hours." });
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      toast({ title: "Something went wrong", description: "Please try again later.", variant: "destructive" });
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Get in <span className="bg-gradient-premium bg-clip-text text-transparent">Touch</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ready to transform your restaurant's customer service? Let's talk!
          </p>
        </div>

        {status === "submitting" && (
          <div className="mb-6">
            <div className="h-1 w-full bg-muted rounded">
              <div className="h-1 w-1/3 bg-primary rounded animate-pulse" style={{ animationDuration: "1s" }}></div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="animate-slide-up">
            {status === "success" ? (
              <div className="space-y-4 p-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/10 shadow-glow">
                <h4 className="text-2xl font-bold">Thank you!</h4>
                <p className="text-muted-foreground">Your message has been delivered. Our team will reach out within 24 hours.</p>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: undefined }); }}
                  required
                  disabled={isDisabled}
                  placeholder="John Doe"
                  className="rounded-xl"
                />
                {errors.name && <p className="mt-2 text-sm text-destructive">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                  required
                  disabled={isDisabled}
                  placeholder="john@restaurant.com"
                  className="rounded-xl"
                />
                {errors.email && <p className="mt-2 text-sm text-destructive">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={(e) => { setFormData({ ...formData, message: e.target.value }); if (errors.message) setErrors({ ...errors, message: undefined }); }}
                  required
                  disabled={isDisabled}
                  placeholder="Tell us about your restaurant and how we can help..."
                  rows={6}
                  className="rounded-xl resize-none"
                />
                {errors.message && <p className="mt-2 text-sm text-destructive">{errors.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={isDisabled}
                className="w-full bg-gradient-gold hover:opacity-90 transition-opacity shadow-glow text-base py-6 font-semibold"
              >
                {status === "submitting" ? "Sending..." : status === "success" ? "Delivered" : "Send Message"}
              </Button>
            </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="bg-card rounded-3xl p-8 border border-primary/20 shadow-glow">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-premium bg-clip-text text-transparent">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-gold rounded-xl flex items-center justify-center flex-shrink-0 shadow-soft">
                    <Mail className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Email</h4>
                    <p className="text-muted-foreground">
                      <a href="mailto:astraventaai@gmail.com" className="hover:underline">astraventaai@gmail.com</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-gold rounded-xl flex items-center justify-center flex-shrink-0 shadow-soft">
                    <Phone className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Phone</h4>
                    <p className="text-muted-foreground">
                      <a href="tel:+923055255838" className="hover:underline">+92 305 525 5838</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-gold rounded-xl flex items-center justify-center flex-shrink-0 shadow-soft">
                    <MapPin className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Office</h4>
                    <p className="text-muted-foreground">
                      Dolmen Corporate Tower, Clifton<br />
                      Karachi 75600, Pakistan
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 border border-primary/30 shadow-soft">
              <h3 className="text-xl font-bold mb-4">Schedule a Demo</h3>
              <p className="text-muted-foreground mb-6">
                See Astraventa AI in action with a personalized demo tailored to your restaurant's needs.
              </p>
              <Button
                onClick={() => {
                  toast({
                    title: "Demo request received!",
                    description: "We'll contact you shortly to schedule.",
                  });
                }}
                className="w-full bg-gradient-premium hover:opacity-90 transition-opacity"
              >
                Book a Demo Call
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

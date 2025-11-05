const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <a href="#hero" className="mb-4">
            <img src="/logo.png" alt="Astraventa AI" className="h-10 w-auto" />
          </a>
          <div className="flex items-center gap-6 mb-4 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Solutions</a>
            <a href="#demo" className="hover:text-foreground transition-colors">Demo</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Astraventa AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

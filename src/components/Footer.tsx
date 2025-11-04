const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-premium rounded-lg"></div>
            <span className="text-lg font-semibold">Astraventa AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Astraventa AI. Powered by Qvexa AI Technologies.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { useEffect, useState } from "react";

const WhatsappButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const message = encodeURIComponent("Hi Astraventa AI, I'd like to learn more about your restaurant chatbot and bookings automation.");
  const href = `https://wa.me/923055255838?text=${message}`;

  if (!visible) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 md:bottom-8 md:right-8 z-50 group"
    >
      <div className="relative">
        <picture>
          <source srcSet="/whatsapp.png" type="image/png" />
          <img
            src="/whatsapp.svg"
            alt="WhatsApp"
            className="h-12 w-12 md:h-14 md:w-14 select-none rounded-full shadow-lg ring-1 ring-black/5 hover:scale-105 active:scale-95 transition-transform object-contain bg-transparent"
            loading="eager"
            decoding="sync"
          />
        </picture>
      </div>
    </a>
  );
};

export default WhatsappButton;



# Astraventa Restaurant AI

A production-ready demo web application showcasing AI-powered chatbots and booking automation for restaurants. Built with modern web technologies and deployed on Vercel.

## 🚀 Live Demo

**URL**: https://astraventa-restaurant-ai.vercel.app

## ✨ Features

- **AI-Powered Chatbot**: Multi-provider fallback system (Groq, OpenRouter, Hugging Face) for reliable restaurant assistance
- **Contact Form**: Email notifications via Resend API with Supabase storage
- **Responsive Design**: Modern, premium UI with Tailwind CSS and shadcn/ui
- **Real-time Chat**: Conversation history stored in Supabase with automatic fallback handling
- **WhatsApp Integration**: Floating button for direct customer contact

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui (Radix UI components)
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **AI Models**: Groq (Llama 3.1 70B), OpenRouter (Llama 3.3 8B), Hugging Face
- **Email**: Resend API
- **Deployment**: Vercel

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- API keys for AI providers (see `AI_SETUP.md`)

### Setup

```bash
# Clone the repository
git clone https://github.com/Astraventa/astraventa-restaurant-ai.git
cd astraventa-restaurant-ai

# Install dependencies
npm install

# Create .env file
cp ENV.example .env

# Add your Supabase credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start development server
npm run dev
```

## 🔧 Configuration

### Supabase Setup

1. Run the SQL schema: `supabase/schema.sql`
2. Deploy Edge Functions:
   ```bash
   npx supabase functions deploy send-contact-email
   npx supabase functions deploy chat-ai
   ```
3. Set secrets (see `API_KEYS_SETUP.md`):
   ```bash
   npx supabase secrets set GROQ_API_KEY=your_key
   npx supabase secrets set OPENROUTER_API_KEY=your_key
   npx supabase secrets set RESEND_API_KEY=your_key
   # ... etc
   ```

### Environment Variables

**Frontend (Vercel)**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Supabase Functions** (set via CLI):
- `GROQ_API_KEY`
- `OPENROUTER_API_KEY`
- `HF_TOKEN` (optional)
- `HUGGINGFACE_API_KEY` (optional)
- `RESEND_API_KEY`
- `RESEND_FROM`
- `RESEND_TO`
- `CORS_ORIGIN`

## 📚 Documentation

- `AI_SETUP.md` - Guide for setting up AI model APIs
- `API_KEYS_SETUP.md` - Detailed API key configuration
- `supabase/schema.sql` - Database schema

## 🚀 Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automatically on push to `main`

### Supabase Functions

Deploy Edge Functions separately:
```bash
npx supabase functions deploy send-contact-email
npx supabase functions deploy chat-ai
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🤝 Contributing

This is a demo project for Astraventa AI. For inquiries, contact: astraventaai@gmail.com

## 📄 License

© 2025 Astraventa AI. All rights reserved.

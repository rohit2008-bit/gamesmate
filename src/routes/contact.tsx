import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Mail, MessageCircle, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — GamesMate" },
      { name: "description", content: "Get in touch with the GamesMate team." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="px-4 pt-10 pb-16">
        <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-6 items-start">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">Say hello</h1>
            <p className="mt-3 text-white/75">Questions, partnerships, or feedback — we'd love to hear from you.</p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-white/85"><span className="w-10 h-10 rounded-2xl bg-[var(--brand-green)] border-2 border-[var(--gold)] grid place-items-center"><Mail className="w-5 h-5 text-white" /></span> hello@gamesmate.app</div>
              <div className="flex items-center gap-3 text-white/85"><span className="w-10 h-10 rounded-2xl bg-[var(--brand-blue)] border-2 border-[var(--gold)] grid place-items-center"><MessageCircle className="w-5 h-5 text-white" /></span> Support replies within 24h</div>
              <div className="flex items-center gap-3 text-white/85"><span className="w-10 h-10 rounded-2xl bg-[var(--brand-red)] border-2 border-[var(--gold)] grid place-items-center"><MapPin className="w-5 h-5 text-white" /></span> Made in India</div>
            </div>
          </div>

          <form className="panel-game p-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="relative z-10 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[color:var(--card-foreground)] mb-1">Name</label>
                <input className="w-full rounded-xl border-2 border-[var(--gold)] bg-white/90 px-4 py-2.5 text-[color:var(--card-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[color:var(--card-foreground)] mb-1">Email</label>
                <input type="email" className="w-full rounded-xl border-2 border-[var(--gold)] bg-white/90 px-4 py-2.5 text-[color:var(--card-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]" placeholder="you@email.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[color:var(--card-foreground)] mb-1">Message</label>
                <textarea rows={4} className="w-full rounded-xl border-2 border-[var(--gold)] bg-white/90 px-4 py-2.5 text-[color:var(--card-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]" placeholder="How can we help?" />
              </div>
              <button className="btn-game btn-game-green w-full">Send Message</button>
            </div>
          </form>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

import dynamic from "next/dynamic";
import Hero from "@/components/Hero";

// Lazy load below-the-fold components for better initial page load
const Services = dynamic(() => import("@/components/Services"), {
  loading: () => <div className="py-24" />,
});

const About = dynamic(() => import("@/components/About"), {
  loading: () => <div className="py-24" />,
});

const Testimonials = dynamic(() => import("@/components/Testimonials"), {
  loading: () => <div className="py-24" />,
});

const Pricing = dynamic(() => import("@/components/Pricing"), {
  loading: () => <div className="py-24" />,
});

const Booking = dynamic(() => import("@/components/Booking"), {
  loading: () => <div className="py-20" />,
});

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen bg-white text-black" tabIndex={-1}>
      <Hero />

      <Services />
      <About />
      <Testimonials />

      <Pricing />

      <Booking />

      <footer className="relative py-12" role="contentinfo">
        <div className="container-max mx-auto px-6 text-center text-sm text-zinc-600">
          <div>© Tarot by Alex</div>
          <div className="mt-3 flex items-center justify-center gap-4">
            <a href="#" aria-label="Instagram" className="text-zinc-600">IG</a>
            <a href="#" aria-label="Facebook" className="text-zinc-600">FB</a>
            <a href="#" aria-label="Email" className="text-zinc-600">Email</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

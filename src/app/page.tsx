import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import Booking from "@/components/Booking";

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

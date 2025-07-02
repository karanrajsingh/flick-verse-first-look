import { Button } from "@/components/ui/button";
import heroMovie from "@/assets/hero-movie.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-[70vh] overflow-hidden rounded-lg mx-4 mt-4">
      <div className="absolute inset-0 bg-gradient-hero"></div>
      <img
        src={heroMovie}
        alt="Featured Movie"
        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
      />
      <div className="relative z-10 h-full flex items-center justify-start px-8 md:px-16">
        <div className="max-w-lg text-left">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">
            Cosmic 
            <span className="text-primary"> Odyssey</span>
          </h2>
          <p className="text-lg md:text-xl mb-6 text-muted-foreground max-w-md">
            An epic space adventure that will take you beyond the stars. Experience the journey of a lifetime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="hero" size="lg">
              Book Now
            </Button>
            <Button variant="cinema" size="lg">
              Watch Trailer
            </Button>
          </div>
          <div className="mt-6 flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="px-2 py-1 bg-primary/20 rounded">Action</span>
            <span className="px-2 py-1 bg-primary/20 rounded">Sci-Fi</span>
            <span>★ 4.8/5</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
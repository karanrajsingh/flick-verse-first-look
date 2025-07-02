import { Button } from "@/components/ui/button";

interface MovieCardProps {
  title: string;
  image: string;
  genre: string[];
  rating: number;
  duration: string;
}

const MovieCard = ({ title, image, genre, rating, duration }: MovieCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-card shadow-card transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <div className="aspect-[3/4] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-card-foreground mb-2 line-clamp-1">
          {title}
        </h3>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {genre.slice(0, 2).map((g, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-primary/20 text-primary rounded"
            >
              {g}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <span className="flex items-center">
            ⭐ {rating}/5
          </span>
          <span>{duration}</span>
        </div>
        
        <Button variant="cinema" size="sm" className="w-full">
          Book Tickets
        </Button>
      </div>
      
      {/* Hover overlay with additional info */}
      <div className="absolute inset-0 bg-black/90 p-6 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {genre.map((g, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded"
            >
              {g}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-300 mb-4 line-clamp-3">
          Experience an unforgettable cinematic journey filled with action, drama, and stunning visuals.
        </p>
        <div className="space-y-2">
          <Button variant="hero" size="sm" className="w-full">
            Book Now
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            More Info
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
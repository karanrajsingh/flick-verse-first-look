import MovieCard from "./MovieCard";
import movie1 from "@/assets/movie-1.jpg";
import movie2 from "@/assets/movie-2.jpg";
import movie3 from "@/assets/movie-3.jpg";
import movie4 from "@/assets/movie-4.jpg";
import movie5 from "@/assets/movie-5.jpg";
import movie6 from "@/assets/movie-6.jpg";

const movies = [
  {
    id: 1,
    title: "Neon Futures",
    image: movie1,
    genre: ["Sci-Fi", "Thriller"],
    rating: 4.6,
    duration: "2h 15m"
  },
  {
    id: 2,
    title: "Golden Hearts",
    image: movie2,
    genre: ["Romance", "Drama"],
    rating: 4.3,
    duration: "1h 58m"
  },
  {
    id: 3,
    title: "Shadow's Edge",
    image: movie3,
    genre: ["Horror", "Mystery"],
    rating: 4.1,
    duration: "1h 47m"
  },
  {
    id: 4,
    title: "Adventure Quest",
    image: movie4,
    genre: ["Adventure", "Comedy"],
    rating: 4.4,
    duration: "2h 8m"
  },
  {
    id: 5,
    title: "Urban Legends",
    image: movie5,
    genre: ["Crime", "Drama"],
    rating: 4.7,
    duration: "2h 22m"
  },
  {
    id: 6,
    title: "Mystic Realms",
    image: movie6,
    genre: ["Fantasy", "Epic"],
    rating: 4.5,
    duration: "2h 35m"
  }
];

const MovieGrid = () => {
  return (
    <section className="px-4 py-8">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-foreground">Now Playing</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
              All
            </button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
              Action
            </button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
              Drama
            </button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
              Comedy
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              title={movie.title}
              image={movie.image}
              genre={movie.genre}
              rating={movie.rating}
              duration={movie.duration}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MovieGrid;
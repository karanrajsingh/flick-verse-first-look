import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import BookingFormComponent from '@/components/BookingForm';

interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string[];
  duration: number;
  rating: number;
  poster_url: string;
  language: string;
  director: string;
  movie_cast: string[];
  price: number;
  available_seats: number;
  theater_name: string;
  show_times: any;
}

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMovie();
    }
  }, [id]);

  const fetchMovie = async () => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Parse show_times if it's a JSON string
      const movieData = {
        ...data,
        show_times: typeof data.show_times === 'string' 
          ? JSON.parse(data.show_times) 
          : data.show_times || []
      };
      
      setMovie(movieData);
    } catch (error) {
      console.error('Error fetching movie:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    setBookingDialogOpen(false);
    fetchMovie(); // Refresh movie data to get updated seat count
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">Loading movie details...</div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">Movie not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-6">
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full md:w-64 h-96 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">{movie.title}</CardTitle>
                    <CardDescription className="text-lg mb-4">
                      {movie.description}
                    </CardDescription>
                    
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {movie.genre.map((g) => (
                          <Badge key={g} variant="secondary">{g}</Badge>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Duration:</strong> {movie.duration} mins
                        </div>
                        <div>
                          <strong>Rating:</strong> {movie.rating}/10
                        </div>
                        <div>
                          <strong>Language:</strong> {movie.language}
                        </div>
                        <div>
                          <strong>Director:</strong> {movie.director}
                        </div>
                      </div>
                      
                      <div>
                        <strong>Cast:</strong>
                        <p className="text-sm text-muted-foreground">
                          {movie.movie_cast.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Theater Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <strong>Theater:</strong>
                  <p>{movie.theater_name}</p>
                </div>
                
                <div>
                  <strong>Available Seats:</strong>
                  <p>{movie.available_seats}</p>
                </div>
                
                <div>
                  <strong>Price:</strong>
                  <p className="text-2xl font-bold text-primary">₹{movie.price}</p>
                </div>
                
                <div>
                  <strong>Show Times:</strong>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {movie.show_times.map((time) => (
                      <Badge key={time} variant="outline" className="justify-center py-2">
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {user ? (
                  <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        Book Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{movie.title}</DialogTitle>
                      </DialogHeader>
                      <BookingFormComponent
                        movie={movie}
                        onSuccess={handleBookingSuccess}
                      />
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => navigate('/auth')}
                  >
                    Sign In to Book
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
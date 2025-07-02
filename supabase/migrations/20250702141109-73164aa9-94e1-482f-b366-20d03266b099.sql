-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  city TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create movies table
CREATE TABLE public.movies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT[],
  duration INTEGER, -- in minutes
  rating DECIMAL(3,1),
  poster_url TEXT,
  trailer_url TEXT,
  release_date DATE,
  language TEXT,
  director TEXT,
  cast TEXT[],
  price DECIMAL(10,2),
  available_seats INTEGER DEFAULT 100,
  theater_name TEXT,
  show_times JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  movie_id UUID NOT NULL REFERENCES public.movies(id),
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  show_time TIMESTAMP WITH TIME ZONE NOT NULL,
  seats INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  payment_id TEXT,
  theater_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_preferences table for AI recommendations
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  preferred_genres TEXT[],
  preferred_languages TEXT[],
  favorite_actors TEXT[],
  rating_threshold DECIMAL(3,1) DEFAULT 7.0,
  price_range JSONB DEFAULT '{"min": 0, "max": 1000}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for movies (public read, admin write)
CREATE POLICY "Movies are viewable by everyone" 
ON public.movies 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can book movies" 
ON public.movies 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create policies for bookings
CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for user_preferences
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_movies_updated_at
BEFORE UPDATE ON public.movies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY definer SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name');
  RETURN new;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample movies data
INSERT INTO public.movies (title, description, genre, duration, rating, poster_url, language, director, cast, price, theater_name, show_times) VALUES
('Avatar: The Way of Water', 'Jake Sully and Neytiri have formed a family and are doing everything to stay together. However, they must leave their home and explore the regions of Pandora.', ARRAY['Action', 'Adventure', 'Sci-Fi'], 192, 7.8, '/placeholder.svg', 'English', 'James Cameron', ARRAY['Sam Worthington', 'Zoe Saldana'], 350.00, 'PVR Cinemas', '["10:00", "14:00", "18:00", "22:00"]'),
('Top Gun: Maverick', 'After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads Top Gun''s elite graduates on a mission.', ARRAY['Action', 'Drama'], 130, 8.3, '/placeholder.svg', 'English', 'Joseph Kosinski', ARRAY['Tom Cruise', 'Miles Teller'], 300.00, 'INOX', '["11:00", "15:00", "19:00", "23:00"]'),
('RRR', 'A fictitious story about two legendary revolutionaries and their journey away from home before they started fighting for their country in 1920s.', ARRAY['Action', 'Drama', 'History'], 187, 7.9, '/placeholder.svg', 'Telugu', 'S.S. Rajamouli', ARRAY['N.T. Rama Rao Jr.', 'Ram Charan'], 250.00, 'Cinepolis', '["12:00", "16:00", "20:00"]'),
('Spider-Man: No Way Home', 'With Spider-Man''s identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear.', ARRAY['Action', 'Adventure', 'Fantasy'], 148, 8.4, '/placeholder.svg', 'English', 'Jon Watts', ARRAY['Tom Holland', 'Zendaya'], 320.00, 'PVR Cinemas', '["10:30", "14:30", "18:30", "22:30"]'),
('Pushpa: The Rise', 'Violence erupts between red sandalwood smugglers and the police charged with bringing down their organization in the Seshachalam forests of South India.', ARRAY['Action', 'Crime', 'Drama'], 179, 7.6, '/placeholder.svg', 'Telugu', 'Sukumar', ARRAY['Allu Arjun', 'Rashmika Mandanna'], 280.00, 'INOX', '["13:00", "17:00", "21:00"]'),
('Dune', 'Feature adaptation of Frank Herbert''s science fiction novel about the son of a noble family entrusted with the protection of the most valuable asset in the galaxy.', ARRAY['Adventure', 'Drama', 'Sci-Fi'], 155, 8.0, '/placeholder.svg', 'English', 'Denis Villeneuve', ARRAY['Timothée Chalamet', 'Rebecca Ferguson'], 300.00, 'Cinepolis', '["11:30", "15:30", "19:30"]');

-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.movies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
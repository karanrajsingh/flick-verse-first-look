import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get user preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get user's booking history to understand their preferences
    const { data: bookingHistory } = await supabase
      .from('bookings')
      .select(`
        *,
        movies (*)
      `)
      .eq('user_id', userId);

    // Get all available movies
    const { data: allMovies } = await supabase
      .from('movies')
      .select('*')
      .gt('available_seats', 0);

    if (!allMovies) {
      throw new Error('No movies found');
    }

    // Simple recommendation algorithm
    let recommendations = [...allMovies];

    if (preferences) {
      // Filter by preferred genres
      if (preferences.preferred_genres && preferences.preferred_genres.length > 0) {
        recommendations = recommendations.filter(movie => 
          movie.genre.some((g: string) => preferences.preferred_genres.includes(g))
        );
      }

      // Filter by preferred languages
      if (preferences.preferred_languages && preferences.preferred_languages.length > 0) {
        recommendations = recommendations.filter(movie => 
          preferences.preferred_languages.includes(movie.language)
        );
      }

      // Filter by rating threshold
      if (preferences.rating_threshold) {
        recommendations = recommendations.filter(movie => 
          movie.rating >= preferences.rating_threshold
        );
      }

      // Filter by price range
      if (preferences.price_range) {
        const priceRange = preferences.price_range as { min: number; max: number };
        recommendations = recommendations.filter(movie => 
          movie.price >= priceRange.min && movie.price <= priceRange.max
        );
      }
    }

    // If user has booking history, prioritize similar genres
    if (bookingHistory && bookingHistory.length > 0) {
      const watchedGenres = new Set();
      bookingHistory.forEach((booking: any) => {
        if (booking.movies && booking.movies.genre) {
          booking.movies.genre.forEach((genre: string) => watchedGenres.add(genre));
        }
      });

      // Sort recommendations by genre similarity
      recommendations.sort((a, b) => {
        const aGenreMatch = a.genre.filter((g: string) => watchedGenres.has(g)).length;
        const bGenreMatch = b.genre.filter((g: string) => watchedGenres.has(g)).length;
        return bGenreMatch - aGenreMatch;
      });
    }

    // If no preferences-based recommendations, fall back to popular movies (high rating)
    if (recommendations.length === 0) {
      recommendations = allMovies.sort((a, b) => b.rating - a.rating);
    }

    // Limit to top 6 recommendations
    const finalRecommendations = recommendations.slice(0, 6);

    return new Response(JSON.stringify({ 
      recommendations: finalRecommendations,
      message: `Found ${finalRecommendations.length} personalized recommendations`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-recommendations function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      recommendations: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
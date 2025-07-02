import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    console.log('Starting scheduled movie availability update...');

    // Reset seat availability for all movies (simulating daily refresh)
    const { data: movies, error: fetchError } = await supabase
      .from('movies')
      .select('id, title, available_seats');

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${movies?.length || 0} movies to update`);

    // Update movies with low availability (simulate restocking)
    const updates = [];
    for (const movie of movies || []) {
      if (movie.available_seats < 20) {
        // Reset to 100 seats for movies with low availability
        updates.push(
          supabase
            .from('movies')
            .update({ available_seats: 100 })
            .eq('id', movie.id)
        );
        console.log(`Resetting seats for ${movie.title} from ${movie.available_seats} to 100`);
      }
    }

    if (updates.length > 0) {
      await Promise.all(updates);
      console.log(`Updated ${updates.length} movies with fresh seat availability`);
    }

    // Log some analytics
    const { data: totalBookings } = await supabase
      .from('bookings')
      .select('id, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    console.log(`Total bookings in last 24 hours: ${totalBookings?.length || 0}`);

    return new Response(JSON.stringify({ 
      success: true,
      moviesUpdated: updates.length,
      totalBookingsLast24h: totalBookings?.length || 0,
      message: 'Movie availability updated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in update-movie-availability function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
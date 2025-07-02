import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const bookingSchema = z.object({
  showTime: z.string().min(1, 'Please select a show time'),
  seats: z.number().min(1, 'Please select at least 1 seat').max(10, 'Maximum 10 seats per booking'),
});

type BookingForm = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  movie: {
    id: string;
    title: string;
    price: number;
    show_times: string[];
    theater_name: string;
    available_seats: number;
  };
  onSuccess: () => void;
}

const BookingFormComponent = ({ movie, onSuccess }: BookingFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      seats: 1,
    },
  });

  const watchSeats = form.watch('seats');
  const totalAmount = watchSeats * movie.price;

  const onSubmit = async (data: BookingForm) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to book tickets",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create booking
      const bookingData = {
        user_id: user.id,
        movie_id: movie.id,
        show_time: new Date(`${new Date().toDateString()} ${data.showTime}`).toISOString(),
        seats: data.seats,
        total_amount: totalAmount,
        theater_name: movie.theater_name,
        payment_id: `PAY_${Date.now()}`, // Mock payment ID
      };

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingData]);

      if (bookingError) throw bookingError;

      // Update available seats
      const { error: updateError } = await supabase
        .from('movies')
        .update({ available_seats: movie.available_seats - data.seats })
        .eq('id', movie.id);

      if (updateError) throw updateError;

      // Call email notification function
      try {
        await supabase.functions.invoke('send-booking-confirmation', {
          body: {
            userEmail: user.email,
            movieTitle: movie.title,
            showTime: data.showTime,
            seats: data.seats,
            totalAmount: totalAmount,
            theaterName: movie.theater_name,
          },
        });
      } catch (emailError) {
        console.log('Email notification failed:', emailError);
        // Don't fail the booking if email fails
      }

      toast({
        title: "Success",
        description: "Booking confirmed! Check your email for confirmation.",
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processPayment = async () => {
    // Mock payment processing
    toast({
      title: "Payment Processing",
      description: "Processing your payment...",
    });

    // Simulate payment processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For demo purposes, we'll always succeed
    return { success: true, paymentId: `PAY_${Date.now()}` };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Tickets</CardTitle>
        <CardDescription>Select your show time and number of seats</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="showTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Show Time</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select show time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {movie.show_times.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="seats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Seats</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={Math.min(10, movie.available_seats)}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2 p-4 bg-secondary rounded-lg">
              <div className="flex justify-between">
                <span>Seats:</span>
                <span>{watchSeats || 1}</span>
              </div>
              <div className="flex justify-between">
                <span>Price per seat:</span>
                <span>₹{movie.price}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount:</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing..." : `Pay ₹${totalAmount} & Book Now`}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BookingFormComponent;
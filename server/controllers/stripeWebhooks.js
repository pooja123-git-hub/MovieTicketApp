import stripe from 'stripe';
import Booking from '../models/Booking.js';
import { inngest } from '../inngest/index.js'; // Ensure this is correct

export const stripeWebhooks = async (request, response) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers["stripe-signature"];

  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature error:", error.message);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {

      // ✅ Correct event for Stripe Checkout
      case "checkout.session.completed": {
        const session = event.data.object;

        // Extract booking ID from metadata
        const { bookingId } = session.metadata;
        if (!bookingId) {
          console.error("No bookingId found in metadata");
          return response.status(400).send("Missing bookingId in session metadata.");
        }

        // ✅ Update the booking
        await Booking.findByIdAndUpdate(bookingId, {
          isPaid: true,
          paymentLink: ""
        });

        // ✅ Optional: Trigger confirmation email or other logic
        await inngest.send({
          name: "app/show.booked",
          data: { bookingId }
        });

        console.log(`✅ Booking ${bookingId} marked as paid.`);
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    response.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    response.status(500).send("Internal server error");
  }
};

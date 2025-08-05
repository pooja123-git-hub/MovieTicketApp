import stripe from 'stripe';
import Booking from '../models/Booking.js';

export const stripeWebhooks = async (request, response) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers['stripe-signature'];

  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const bookingId = session.metadata.bookingId;

        await Booking.findByIdAndUpdate(bookingId, {
          isPaid: true,
          paymentLink: ''
        });

        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    response.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error); // ✅ fixed 'err'
    response.status(500).send('Internal Server Error');
  }
};

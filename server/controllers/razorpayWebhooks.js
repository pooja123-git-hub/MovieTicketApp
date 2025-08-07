// import stripe from 'stripe';
// import Booking from '../models/Booking.js'
// export const stripeWebhooks=async(request,response)=>{
//     const stripeInstance=new stripe(process.env.STRIPE_SECRET_KEY);
//     const sig=request.headers["stripe-signature"];

//     let event;
//     try {
//         event =stripeInstance.webhooks.constructEvent(request.body, sig,
//             process.env.STRIPE_WEBHOOK_SECRET);
//     } catch (error) {
//         return response.status(400).send(`Webhooks Error: ${error.message}`);
        
//     }
//     try {
//         switch(event.type){
            
//             case "payment_intent.succeeded":{
//                 const paymentIntent=event.data.object;
//                 const sessionList=await stripeInstance.checkout.sessions.list({
//                     payment_intent:paymentIntent.id
//                 })
//                 const session=sessionList.data[0];
//                 const {bookingId}=session.metadata;
//                 await Booking.findByIdAndUpdate(bookingId,{
//                     isPaid:true,
//                     paymentLink:""
//                 })
//                 //send confirmation email
//                 await inngest.send({
//                     name:'app/show.booked',
//                     data:{bookingId}
//                 })
//                 break;
//             }
//             default :
//             console.log('Unhandled event type:',event.type)

//         }
        
//         response.json({received:true})
//     } catch (error) {
//         console.error("Webhook processing error",error);
//         response.status(500).send("Internal server Error");
//     }

// }
import crypto from "crypto";
import Booking from "../models/Booking.js";
import { inngest } from "../inngest/index.js";
 // adjust this if location differs

export const razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  const body = JSON.stringify(req.body); // make sure bodyParser.raw is used

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    return res.status(400).send("Invalid signature.");
  }

  const event = req.body;

  try {
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const bookingId = payment.notes?.bookingId; // depends on how you created order

      if (!bookingId) {
        return res.status(400).json({ error: "Booking ID missing in payment notes." });
      }

      await Booking.findByIdAndUpdate(bookingId, {
        isPaid: true,
        paymentLink: ""
      });

      // Trigger your confirmation logic (like sending mail)
      await inngest.send({
        name: "app/show.booked",
        data: { bookingId }
      });

      return res.status(200).json({ success: true });
    } else {
      console.log("Unhandled Razorpay event:", event.event);
      return res.status(200).json({ success: true });
    }
  } catch (err) {
    console.error("Webhook processing error", err);
    return res.status(500).send("Internal Server Error");
  }
};

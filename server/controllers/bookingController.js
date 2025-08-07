// import { inngest } from "../inngest/index.js";
// import Booking from "../models/Booking.js";
// import Show from "../models/Show.js"
// import stripe from 'stripe'
  

// //function to check availability of selected seats for a movie
// const checkSeatsAvailability=async(showId,selectedSeats)=>{
// try {
//     const showData=await Show.findById(showId)
//     if(!showData) return false;
//     const occupiedSeats=showData.occupiedSeats;
//     const isAnySeatTaken=selectedSeats.some(seat=>occupiedSeats[seat]);
//     return !isAnySeatTaken;

// } catch (error) {
//     console.log(error);
//     return false;
// }
// }
// export const createBooking=async(req,res)=>{
//     try {
//        const {userId}=req.auth();
//        const {showId,selectedSeats}=req.body;
//        const {origin}=req.headers;
//        //check if the seat is availablity for selected show
// const isAvailable=await checkSeatsAvailability(showId,selectedSeats);
// if(!isAvailable){
//     return res.json({success:false,message:"Selected Seats are not available."})
// }
// //get show details
// const showData=await Show.findById(showId).populate('movie');
// //create  a new booking 
// const booking=await Booking.create({
//     user:userId,
//     show:showId,
//     amount:showData.showPrice*selectedSeats.length,
//      bookingSeats:selectedSeats
// })
// selectedSeats.map((seat)=>
// {
//     showData.occupiedSeats[seat]=userId;
// })
// showData.markModified('occupiedSeats');
// await showData.save();
// //Stripe gateway Initilize
// const stripeInstance=new stripe(process.env.STRIPE_SECRET_KEY);
// // Creating line item to for Stripe
// const line_items=[{
//     price_data:{
//         currency:'usd',
//         product_data:{
//             name:showData.movie.title
//         },
//         unit_amount:Math.floor(booking.amount)*100
//     },
//     quantity:1
// }]
// const session=await stripeInstance.checkout.sessions.create({
//     success_url:`${origin}/loading/my-bookings`,
//     cancel_url:`${origin}/my-bookings`,
//     line_items:line_items,
//     mode:"payment",
//     metadata:{
//         bookingId:booking._id.toString()
//     },
//     expires_at:Math.floor(Date.now()/1000)+30*60, //Expire in 30 minutes
// })
// booking.paymentLink=session.url
// await booking.save()

// //run inngest schedular to check paymentstatus after 10 minutes
// await inngest.send({
//     name:'app/checkpayment',
//     data:{
//         bookingId:booking._id.toString()
//     }
// })
// res.json({success:true, url:session.url})
//     } catch (error) {
// console.log(error.message) ;
// res.json({success:false,message:error.message})      
//     }
// }
// export const getOccupiedSeats=async(req,res)=>{
//     try {
//         const {showId}=req.params;
//         const showData=await Show.findById(showId);
//         const occupiedSeats=Object.keys(showData.occupiedSeats);
//         res.json({success:true,occupiedSeats}) 
//     } catch (error) {
// console.log(error.message) ;
// res.json({success:false,message:error.message})      
//     }
// }
import { inngest } from "../inngest/index.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Razorpay from 'razorpay'; // ✅ NEW: Razorpay SDK

// ✅ Function to check seat availability
const checkSeatsAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);
    if (!showData) return false;
    const occupiedSeats = showData.occupiedSeats;
    const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);
    return !isAnySeatTaken;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// ✅ Booking + Razorpay Payment Integration
export const createBooking = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    // Check seat availability
    const isAvailable = await checkSeatsAvailability(showId, selectedSeats);
    if (!isAvailable) {
      return res.json({ success: false, message: "Selected Seats are not available." });
    }

    // Fetch show details
    const showData = await Show.findById(showId).populate('movie');

    // Create booking in DB
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookingSeats: selectedSeats,
    });

    // Mark selected seats as occupied
    selectedSeats.forEach(seat => {
      showData.occupiedSeats[seat] = userId;
    });
    showData.markModified('occupiedSeats');
    await showData.save();

    // ✅ Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    // ✅ Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: Math.floor(booking.amount) * 100, // in paise
      currency: 'INR',
      receipt: booking._id.toString(),
      notes: {
        bookingId: booking._id.toString(),
        showId: showId,
        userId: userId
      }
    });

    // Save payment link (order ID)
    booking.paymentLink = order.id;
    await booking.save();

    // ✅ Trigger Inngest background job
    await inngest.send({
      name: 'app/checkpayment',
      data: {
        bookingId: booking._id.toString()
      }
    });

    // ✅ Return order ID to frontend to call Razorpay checkout
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Get occupied seats for a show
export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const showData = await Show.findById(showId);
    const occupiedSeats = Object.keys(showData.occupiedSeats);
    res.json({ success: true, occupiedSeats });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

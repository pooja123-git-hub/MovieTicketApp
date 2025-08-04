import Booking from "../models/Booking.js"
import Show from "../models/Show.js";
import User from '../models/User.js'

//API to Check if User is Admin
export const isAdmin=async(req,res)=>{
    res.json({success:true,isAdmin:true})
}
 //API to get dashboard data
 export const getdashboardData=async(req,res)=>{
    try {
        const booking =await Booking.find({isPaid:true});
        const activeShows=await Show.find({showDateTime:{$gte:new Date()}}).populate('movie');
        const totalUser=await User.countDocuments();
        const dashboardData={
            totalBookings:booking.length,
            totalRevenue:booking.reduce((acc,booking)=>acc+booking.amount,0),
            activeShows,
            totalUser
        }
        res.json({success:true,dashboardData})
    } catch (error) {
        console.log(error);
          res.json({success:false,message:error.message})
    }
 }
 //Api to get all shows
  export const getAllShows=async(req,res)=>{
try {
    const shows=await Show.find({showDateTime:{$gte:new Date()}}).populate('movie').sort({showDateTime:1})

     res.json({success:true,shows})
} catch (error) {
        console.log(error);
          res.json({success:false,message:error.message})
    }
  }
//Api to get all bookings
 export const getAllBookings=async(req,res)=>{
    try {
        const booking=await Booking.find({}).populate('user').populate({
            path:"show",
            populate:{path:'movie'}

        }).sort({createdAt:-1})
        res.json({success:true,booking})
    } catch (error) {
        console.log(error);
          res.json({success:false,message:error.message})
    }
 }
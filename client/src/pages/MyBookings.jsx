// import React, { useEffect, useState } from "react";

// import Loading from "../components/Loading";
// import BlurCircle from "../components/BlurCircle";
// import timeFormat from "../lib/TimeFormat";
// import { dateFormat } from "../lib/DateFormat";
// import { useAppContext } from "../context/AppContext";
// import { Link } from "react-router-dom";

// const MyBookings = () => {
//   const currency = import.meta.env.VITE_CURRENCY;
//   const [bookings, setBookings] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const { axios, user, getToken, image_base_url } = useAppContext();
//   const getMyBooking = async () => {
//   try {
//     const {data}=await axios.get('/api/user/bookings',
//       {headers:{Authorization:`Bearer ${ await getToken()}`}
//     })
    
    
//    console.log("Fetched booking data:", data); 
//     if(data.success){
//             console.log("Bookings data:", data.bookings); // ✅ Correct log

//       setBookings(data.bookings);
      
//     }

//   } catch (error) {
//     console.log(error);
//   }
//   setIsLoading(false);
//   };
//   useEffect(() => {
//     if(user){
//     getMyBooking();
// }}, [user]);
//   return !isLoading ? (
//     <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
//       <BlurCircle top="100px" left="100px" />

//       <div>
//         <BlurCircle bottom="0px" left="600px" />
//       </div>
//       <h1 className="text-lg font-semibold mb-4">My Bookings</h1>
//       {bookings.map((item, index) => (
        
//         <div
//           key={index}
//           className="flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl"
//         >
//           <div className="flex flex-col md:flex-row">
//             <img
//               src={image_base_url+item.show.movie.poster_path}
//               alt=""
//               className="
//             md:max-w-45 aspect-video h-auto object-cover object-bottom rounded"
//             />
//             <div className="flex flex-col p-4">
//               <p className="text-lg font-semibold">{item.show.movie.title}</p>
//               <p className="text-gray-400 text-sm ">
//                 {timeFormat(item.show.movie.runtime)}
//               </p>
//               <p className="text-gray-400 text-sm mt-auto">
//                 {dateFormat(item.show.showDateTime)}
//               </p>
//             </div>
//           </div>
//           <div className="flex flex-col md:items-end md:text-right justify-between p-4">
//             <div className="flex items-center gap-4">
//               <p className="text-2xl font-semibold mb-3">
//                 {currency}
//                 {item.amount}
//               </p>
//               {!item.isPaid && 
//                 <Link to={item.paymentLink} className="bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer">
//                   Pay Now
//                 </Link>
//               }
//             </div>
//             <div className="text-sm">
//               <p>
//                 <span className="text-gray-400">Total Tickets</span>
//                 {item.bookingSeats.length}
//               </p>
//               <p>
//                 <span className="text-gray-400">Seat Number</span>
//                 {item.bookingSeats.join(",")}
//               </p>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   ) : (
//     <Loading />
//   );
// };

// export default MyBookings;
import React, { useEffect, useState } from "react";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";
import timeFormat from "../lib/TimeFormat";
import { dateFormat } from "../lib/DateFormat";
import { useAppContext } from "../context/AppContext";

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { axios, user, getToken, image_base_url } = useAppContext();

  const getMyBooking = async () => {
    try {
      const { data } = await axios.get("/api/user/bookings", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      getMyBooking();
    }
  }, [user]);

  // 🧠 Razorpay script loader
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 🧾 Razorpay payment handler
  const handleRazorpayPayment = async (bookingId) => {
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      const { data } = await axios.post(
        `/api/booking/create-razorpay-order`,
        { bookingId },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Movie Booking",
        description: "Ticket Payment",
        order_id: data.id,
        handler: function (response) {
          alert("Payment successful!");
          getMyBooking(); // 🔁 Refresh booking status
        },
        prefill: {
          name: user.fullName || "",
          email: user.emailAddresses?.[0]?.emailAddress || "",
        },
        notes: {
          bookingId: bookingId,
        },
        theme: {
          color: "#6366f1",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Error initiating payment", err);
      alert("Something went wrong during payment.");
    }
  };

  return !isLoading ? (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <BlurCircle top="100px" left="100px" />
      <div><BlurCircle bottom="0px" left="600px" /></div>

      <h1 className="text-lg font-semibold mb-4">My Bookings</h1>

      {bookings.map((item, index) => (
        <div
          key={index}
          className="flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl"
        >
          <div className="flex flex-col md:flex-row">
            <img
              src={image_base_url + item.show.movie.poster_path}
              alt=""
              className="md:max-w-45 aspect-video h-auto object-cover object-bottom rounded"
            />
            <div className="flex flex-col p-4">
              <p className="text-lg font-semibold">{item.show.movie.title}</p>
              <p className="text-gray-400 text-sm">
                {timeFormat(item.show.movie.runtime)}
              </p>
              <p className="text-gray-400 text-sm mt-auto">
                {dateFormat(item.show.showDateTime)}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:items-end md:text-right justify-between p-4">
            <div className="flex items-center gap-4">
              <p className="text-2xl font-semibold mb-3">
                {currency}
                {item.amount}
              </p>

              {!item.isPaid && (
                <button
                  onClick={() => handleRazorpayPayment(item._id)}
                  className="bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer"
                >
                  Pay Now
                </button>
              )}
            </div>

            <div className="text-sm">
              <p>
                <span className="text-gray-400">Total Tickets </span>
                {item.bookingSeats.length}
              </p>
              <p>
                <span className="text-gray-400">Seat Number </span>
                {item.bookingSeats.join(",")}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <Loading />
  );
};

export default MyBookings;

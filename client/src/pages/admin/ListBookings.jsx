import React, { useEffect, useState } from "react";
import { dummyBookingData } from "../../assets/assets";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../lib/DateFormat";
import { useAppContext } from "../../context/AppContext";

const ListBookings = () => {
  const { axios, getToken, user } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllBookings = async () => {
    try {
      const { data } = await axios.get("/api/admin/all-bookings", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      setBookings(data.bookings);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      getAllBookings();
    }
  }, [user]);

  return !loading ? (
    <>
      <Title text1="List" text2="Bookings" />
      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-primary/20 text text-white">
              <th className="p-2 font medium pl-5">User Name</th>
              <th className="p-2 font medium pl-5">Movie Name</th>
              <th className="p-2 font medium pl-5">Show Time</th>
              <th className="p-2 font medium pl-5">Seats</th>
              <th className="p-2 font medium pl-5">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm font-light">
            {Array.isArray(bookings) && bookings.length > 0 ? (
              bookings.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-primary/20 bg-primary/5 even:bg-primary/10"
                >
                  <td className="p-2 min-w-45 pl-5">
                    {item?.user?.name || "—"}
                  </td>
                  <td className="p-2">
                    {item?.show?.movie?.title || "—"}
                  </td>
                  <td className="p-2">
                    {item?.show?.showDateTime
                      ? dateFormat(item.show.showDateTime)
                      : "—"}
                  </td>
                  <td className="p-2">
                    {item?.bookedSeats && typeof item.bookedSeats === "object"
                      ? Object.values(item.bookedSeats).join(", ")
                      : "No Seats"}
                  </td>
                  <td className="p-2">
                    {currency} {item?.amount || "0"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  ) : (
    <Loading />
  );
};

export default ListBookings;

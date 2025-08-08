import { Inngest } from "inngest";
import User from "../models/User.js";
import connectDb from "../configs/db.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodeMailer.js";

// Create Inngest client
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// ======= SYNC USER CREATION =======
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      await connectDb();
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      console.log("📥 Incoming user:", event.data);

      const userData = {
        _id: id,
        email: email_addresses?.[0]?.email_address || "unknown@example.com",
        name: `${first_name} ${last_name}`,
        image: image_url,
      };

      const newUser = await User.create(userData);
      console.log("✅ User saved to DB:", newUser);
    } catch (error) {
      console.error("❌ User creation failed:", error.message);
    }
  }
);

// ======= SYNC USER DELETION =======
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      await connectDb();
      const { id } = event.data;

      const deletedUser = await User.findByIdAndDelete(id);
      console.log("🗑️ User deleted:", deletedUser);
    } catch (error) {
      console.error("❌ User deletion failed:", error.message);
    }
  }
);

// ======= SYNC USER UPDATE =======
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      await connectDb();
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      const updatedData = {
        email: email_addresses?.[0]?.email_address || "unknown@example.com",
        name: `${first_name} ${last_name}`,
        image: image_url,
      };

      const updatedUser = await User.findByIdAndUpdate(id, updatedData, { new: true });
      console.log("🔁 User updated:", updatedUser);
    } catch (error) {
      console.error("❌ User update failed:", error.message);
    }
  }
);

// ======= CANCEL BOOKING & RELEASE SEATS AFTER 10 MIN =======
const releaseSeatsAndDeleteBooking = inngest.createFunction(
  { id: 'release-seats-delete-booking' },
  { event: 'app/checkpayment' },
  async ({ event, step }) => {
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil('wait-for-10-minutes', tenMinutesLater);

    await step.run('check-payment-status', async () => {
      const bookingId = event.data.bookingId;
      const booking = await Booking.findById(bookingId);

      if (!booking.isPaid) {
        const show = await Show.findById(booking.show);
        booking.bookingSeats.forEach((seat) => {
          delete show.occupiedSeats[seat];
        });
        show.markModified('occupiedSeats');
        await show.save();
        await Booking.findByIdAndDelete(booking._id);
      }
    });
  }
);

// ======= SEND BOOKING CONFIRMATION EMAIL =======
const sendBookingConfirmationEmail = inngest.createFunction(
  { id: "send-booking-confirmation-email" },
  { event: "app/show.booked" },
  async ({ event, step }) => {
    const { bookingId } = event.data;
    const booking = await Booking.findById(bookingId).populate({
      path: 'show',
      populate: { path: "movie", model: "Movie" }
    }).populate('user');

    await sendEmail({
      to: booking.user.email,
      subject: `Payment confirmation: "${booking.show.movie.title}" booked!`,
      body: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Hi ${booking.user.name},</h2>
          <p>Your booking for <strong style="color: #E84565;">${booking.show.movie.title}</strong> is confirmed 🎉</p>
          <p><strong>Date:</strong> ${new Date(booking.show.showDate).toLocaleDateString('en-US', { timeZone: "Asia/Kolkata" })}</p>
          <p><strong>Time:</strong> ${new Date(booking.show.showTime).toLocaleTimeString('en-US', { timeZone: "Asia/Kolkata" })}</p>
          <p>Enjoy the show 🍿</p>
          <p>Thanks for booking with us!<br/>QuickShow Team</p>
        </div>
      `
    });
  }
);

// ======= UPDATED: SEND SHOW REMINDER EMAIL =======
const sendShowRemainder = inngest.createFunction(
  { id: 'send-show-remainder' },
 { cron: "0 */8 * * *" }, // Every 8 hours
  async ({ step }) => {
    const now = new Date();
    const is8hours = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const windowStart = new Date(is8hours.getTime() - 10 * 60 * 1000);

    const remainderTasks = await step.run("prepare-remainder-tasks", async () => {
      const shows = await Show.find({
        showTime: { $gte: windowStart, $lte: is8hours },
      }).populate('movie');

      const tasks = [];

      for (const show of shows) {
        if (!show.movie || !show.occupiedSeats) continue;

        const userIds = [...new Set(Object.values(show.occupiedSeats))];
        if (userIds.length === 0) continue;

        const users = await User.find({ _id: { $in: userIds } }).select("name email");

        for (const user of users) {
          tasks.push({
            userEmail: user.email,
            userName: user.name,
            movieTitle: show.movie.title,
            showDate: show.showDate,
            showTime: show.showTime
          });
        }
      }

      return tasks;
    });

    if (remainderTasks.length === 0) {
      return { sent: 0, message: "No reminders to send." };
    }

    const results = await step.run('send-all-reminders', async () => {
      return await Promise.allSettled(
        remainderTasks.map(task => sendEmail({
          to: task.userEmail,
          subject: `Reminder: Your movie "${task.movieTitle}" starts soon!`,
          body: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5;">
              <h2>Hi ${task.userName},</h2>
              <p>This is a friendly reminder that your movie <strong style="color: #E84565;">${task.movieTitle}</strong> is starting soon.</p>
              <p><strong>Date:</strong> ${new Date(task.showDate).toLocaleDateString('en-US', { timeZone: "Asia/Kolkata" })}</p>
              <p><strong>Time:</strong> ${new Date(task.showTime).toLocaleTimeString('en-US', { timeZone: "Asia/Kolkata" })}</p>
              <p>Enjoy the show 🍿</p>
              <p>Thanks for booking with us!<br/>QuickShow Team</p>
            </div>
          `
        }))
      );
    });

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.length - sent;

    return {
      sent,
      failed,
      message: `Sent ${sent} reminder(s), ${failed} failed.`
    };
  }
);

// ======= UPDATED: SEND NEW SHOW NOTIFICATION TO ALL USERS =======
const sendNewShowNotification = inngest.createFunction(
  { id: 'send-new-show-notification' },
  { event: 'app/show.added' },
  async ({ event }) => {
    const { movieTitle } = event.data;
    const users = await User.find({});

    for (const user of users) {
      const userEmail = user.email;
      const userName = user.name;
      const subject = `New Show Added: ${movieTitle}`;
      const body = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Hi ${userName},</h2>
          <p>We just added a new show for <strong style="color: #E84565;">${movieTitle}</strong>!</p>
          <p>Book your seats now before they're gone 🎟️</p>
          <p><a href="${process.env.FRONTEND_URL}/movies" style="color: #007BFF;">View Showtimes</a></p>
          <p>Thanks for choosing QuickShow!<br/>The QuickShow Team</p>
        </div>
      `;

      await sendEmail({
        to: userEmail,
        subject,
        body
      });
    }

    return { message: "Notifications sent for new show." };
  }
);

// ======= EXPORT ALL FUNCTIONS =======
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  releaseSeatsAndDeleteBooking,
  sendBookingConfirmationEmail,
  sendShowRemainder,
  sendNewShowNotification
];

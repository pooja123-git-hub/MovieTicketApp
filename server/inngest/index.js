import { Inngest } from "inngest";
import User from "../models/User.js";
import connectDb from "../configs/db.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// ========== SYNC USER CREATION ==========
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      await connectDb();

      const { id, first_name, last_name, email_address, image_url } = event.data;

      const userData = {
        _id: id,
        email: email_address[0].email_address,
        name: first_name + " " + last_name,
        image: image_url,
      };

      await User.create(userData);
    } catch (error) {
      console.error("User creation failed:", error.message);
    }
  }
);

// ========== SYNC USER DELETION ==========
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      await connectDb();
      const { id } = event.data;
      await User.findByIdAndDelete(id);
    } catch (error) {
      console.error("User deletion failed:", error.message);
    }
  }
);

// ========== SYNC USER UPDATE ==========
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      await connectDb();

      const { id, first_name, last_name, email_address, image_url } = event.data;

      const userData = {
        email: email_address[0].email_address,
        name: first_name + " " + last_name,
        image: image_url,
      };

      await User.findByIdAndUpdate(id, userData);
    } catch (error) {
      console.error("User update failed:", error.message);
    }
  }
);

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];

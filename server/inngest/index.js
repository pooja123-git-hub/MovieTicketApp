import { Inngest } from "inngest";
import User from "../models/User.js";

// Create a client
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// ✅ Create Function
const syncUserCreation = inngest.createFunction(
  { id: 'sync-user-from-clerk' },
  { event: 'clerk/user.created' },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_address, image_url } = event.data;
      const userData = {
        _id: id,
        email: email_address[0].email_address,
        name: `${first_name} ${last_name}`,
        image: image_url,
      };
      await User.create(userData);
      console.log("User created:", id);
    } catch (err) {
      console.error("Error in user creation:", err);
      throw err;
    }
  }
);

// ✅ Delete Function
const syncUserDeletion = inngest.createFunction(
  { id: 'delete-user-from-clerk' },
  { event: 'clerk/user.deleted' },
  async ({ event }) => {
    try {
      const { id } = event.data;
      await User.findByIdAndDelete(id);
      console.log("User deleted:", id);
    } catch (err) {
      console.error("Error in user deletion:", err);
      throw err;
    }
  }
);

// ✅ Update Function
const syncUserUpdation = inngest.createFunction(
  { id: 'update-user-from-clerk' },
  { event: 'clerk/user.updated' },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_address, image_url } = event.data;
      const userData = {
        _id: id,
        email: email_address[0].email_address,
        name: `${first_name} ${last_name}`,
        image: image_url,
      };
      await User.findByIdAndUpdate(id, userData);
      console.log("User updated:", id);
    } catch (err) {
      console.error("Error in user update:", err);
      throw err;
    }
  }
);

// ✅ Export all functions
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
];

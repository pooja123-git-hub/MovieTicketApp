import { Inngest } from "inngest";
import User from "../models/User.js";
import connectDb from "../configs/db.js";

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

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
];

import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    ownerName: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const Hostel = mongoose.model("Hostel", hostelSchema);

export default Hostel;

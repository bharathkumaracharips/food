import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    roomNo: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },
    breakfast: { type: Boolean, default: false },
    lunch: { type: Boolean, default: false },
    dinner: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  });
const Student = mongoose.model("Student", studentSchema);

export default Student;

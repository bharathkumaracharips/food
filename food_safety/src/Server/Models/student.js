import mongoose from "mongoose";

const mealHistorySchema = new mongoose.Schema({
    date: { type: Date, required: true },
    meals: [{
        type: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner'], required: true },
        status: { type: Boolean, default: false }
    }],
    isSubmitted: { type: Boolean, default: false }
});

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
    mealHistory: [mealHistorySchema],
    createdAt: { type: Date, default: Date.now },
});

const Student = mongoose.model("Student", studentSchema);

export default Student;

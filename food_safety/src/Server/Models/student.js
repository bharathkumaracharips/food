import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Breakfast', 'Lunch', 'Dinner'],
        required: true
    },
    status: {
        type: Boolean,
        default: true
    }
});

const mealHistorySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    meals: [mealSchema],
    isSubmitted: {
        type: Boolean,
        default: false
    }
});

const mealPreferencesSchema = new mongoose.Schema({
    breakfast: { type: Boolean, default: true },
    lunch: { type: Boolean, default: true },
    dinner: { type: Boolean, default: true }
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
    mealPreferences: { type: mealPreferencesSchema, default: () => ({}) },
    createdAt: { type: Date, default: Date.now },
});

const Student = mongoose.model("Student", studentSchema);

export default Student;

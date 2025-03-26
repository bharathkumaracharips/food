import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
    hostelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel',
        required: true
    },
    menu: {
        Monday: {
            breakfast: { type: String, required: true },
            lunch: { type: String, required: true },
            dinner: { type: String, required: true }
        },
        Tuesday: {
            breakfast: { type: String, required: true },
            lunch: { type: String, required: true },
            dinner: { type: String, required: true }
        },
        Wednesday: {
            breakfast: { type: String, required: true },
            lunch: { type: String, required: true },
            dinner: { type: String, required: true }
        },
        Thursday: {
            breakfast: { type: String, required: true },
            lunch: { type: String, required: true },
            dinner: { type: String, required: true }
        },
        Friday: {
            breakfast: { type: String, required: true },
            lunch: { type: String, required: true },
            dinner: { type: String, required: true }
        },
        Saturday: {
            breakfast: { type: String, required: true },
            lunch: { type: String, required: true },
            dinner: { type: String, required: true }
        },
        Sunday: {
            breakfast: { type: String, required: true },
            lunch: { type: String, required: true },
            dinner: { type: String, required: true }
        }
    }
}, {
    timestamps: true
});

const Menu = mongoose.model('Menu', menuSchema);
export default Menu; 
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const port = 5001;

const mongoURL = process.env.MONGODB_URI;

// Define the Hostel Schema
const hostelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ownerName: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Hostel = mongoose.model('Hostel', hostelSchema);

app.use(cors());
app.use(express.json());

let isConnected = false;

// MongoDB Connection Function
const connectToMongoDB = async () => {
    try {
        if (!mongoURL) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }
        await mongoose.connect(mongoURL);
        console.log("Connected to MongoDB");
        isConnected = true;
    } catch (error) {
        console.error("MongoDB connection error:", error);
        setTimeout(connectToMongoDB, 5000); // Retry connection after 5 seconds
    }
};

connectToMongoDB();

// Middleware to check DB connection
const checkDBConnection = (req, res, next) => {
    if (!isConnected) {
        return res.status(503).json({ error: "Database connection not available" });
    }
    next();
};

// Register Hostel Route with Secure Password Hashing
app.post("/register", checkDBConnection, async (req, res) => {
    try {
        const { name, ownerName, address, contact, email, website, username, password, confirmPassword } = req.body;

        // Validate password match
        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        // Check for existing hostel with same email or username
        const existingHostel = await Hostel.findOne({ $or: [{ email }, { username }] });
        if (existingHostel) {
            return res.status(400).json({ error: "Username or email already exists" });
        }

        // Hash password before storing
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new hostel document
        const hostel = new Hostel({
            name,
            ownerName,
            address,
            contact,
            email,
            website,
            username,
            password: hashedPassword
        });

        // Save to MongoDB
        const result = await hostel.save();
        
        if (result) {
            res.status(201).json({ message: "Hostel registered successfully", hostelId: result._id });
        } else {
            res.status(500).json({ error: "Failed to register hostel" });
        }
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Route to Get All Hostels
app.get("/hostels", checkDBConnection, async (req, res) => {
    try {
        const hostels = await Hostel.find({});
        res.json(hostels);
    } catch (error) {
        console.error("Error fetching hostels:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get Single Hostel by Name
app.get("/hostels/:name", checkDBConnection, async (req, res) => {
    try {
        const hostel = await Hostel.findOne({ name: req.params.name });
        if (hostel) {
            res.json(hostel);
        } else {
            res.status(404).json({ error: "Hostel not found" });
        }
    } catch (error) {
        console.error("Error fetching hostel:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 404 Route
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something broke!" });
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 
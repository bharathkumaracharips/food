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

// Define the Student Schema
const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    roomNo: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
    breakfast: { type: Boolean, default: false },
    lunch: { type: Boolean, default: false },
    dinner: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Hostel = mongoose.model('Hostel', hostelSchema);
const Student = mongoose.model('Student', studentSchema);

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

// Login Route
app.post("/login", checkDBConnection, async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find hostel by username
        const hostel = await Hostel.findOne({ username });
        if (!hostel) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // Compare password
        const isValidPassword = await bcrypt.compare(password, hostel.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        // Create a response object without sensitive information
        const hostelData = {
            id: hostel._id,
            name: hostel.name,
            ownerName: hostel.ownerName,
            email: hostel.email
        };

        res.json({ 
            message: "Login successful",
            hostel: hostelData
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Student Registration Route
app.post("/api/students/register", checkDBConnection, async (req, res) => {
    try {
        const { name, email, phone, roomNo, username, password, hostelId } = req.body;

        // Check if student with same email or username exists
        const existingStudent = await Student.findOne({ 
            $or: [
                { email },
                { username },
                { roomNo, hostelId } // Check if room is already occupied in this hostel
            ]
        });

        if (existingStudent) {
            if (existingStudent.email === email) {
                return res.status(400).json({ error: "Email already registered" });
            }
            if (existingStudent.username === username) {
                return res.status(400).json({ error: "Username already taken" });
            }
            if (existingStudent.roomNo === roomNo) {
                return res.status(400).json({ error: "Room already occupied" });
            }
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new student
        const student = new Student({
            name,
            email,
            phone,
            roomNo,
            username,
            password: hashedPassword,
            hostelId
        });

        const result = await student.save();
        
        res.status(201).json({
            message: "Student registered successfully",
            studentId: result._id
        });
    } catch (error) {
        console.error("Student registration error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get Students by Hostel ID
app.get("/api/students/:hostelId", checkDBConnection, async (req, res) => {
    try {
        const students = await Student.find({ hostelId: req.params.hostelId })
            .select('-password') // Exclude password from response
            .sort({ createdAt: -1 }); // Sort by newest first
        res.json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Remove Student
app.delete("/api/students/:studentId", checkDBConnection, async (req, res) => {
    try {
        const result = await Student.findByIdAndDelete(req.params.studentId);
        if (!result) {
            return res.status(404).json({ error: "Student not found" });
        }
        res.json({ message: "Student removed successfully" });
    } catch (error) {
        console.error("Error removing student:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Update Student Food Status
app.patch("/students/:studentId/food", checkDBConnection, async (req, res) => {
    try {
        const { breakfast, lunch, dinner } = req.body;
        const result = await Student.findByIdAndUpdate(
            req.params.studentId,
            { breakfast, lunch, dinner },
            { new: true }
        );
        
        if (!result) {
            return res.status(404).json({ error: "Student not found" });
        }
        
        res.json(result);
    } catch (error) {
        console.error("Error updating food status:", error);
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
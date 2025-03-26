import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const port = 5001;
const mongoURL =
// Define the Hostel Schema



app.use(cors());
app.use(express.json());

let isConnected = false;

// MongoDB Connection Function


// Middleware to check DB connection
const checkDBConnection = (req, res, next) => {
  if (!isConnected) {
    return res.status(503).json({ error: "Database connection not available" });
  }
  next();
};

// Register Hostel Route with Secure Password Hashing


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

// Student Registration Route

// Get Students by Hostel ID
app.get("/api/students/:hostelId", checkDBConnection, async (req, res) => {
  try {
    const students = await Student.find({ hostelId: req.params.hostelId })
      .select("-password") // Exclude password from response
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

// Get Hostel Names for Student Login
app.get("/api/hostels", checkDBConnection, async (req, res) => {
  try {
    const hostels = await Hostel.find({});
    console.log(hostels);
    res.json(hostels);
    
  } catch (error) {
    console.error("Error fetching hostels:", error);
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

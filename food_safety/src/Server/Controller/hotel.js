import Hostel from "../Models/hotel.js";
import Student from "../Models/student.js";
import { hashedPassword, comparePassword } from "../encrypt.js";
export const registerHostel = async (req, res) => {
  try {
    const {
      name,
      ownerName,
      address,
      contact,
      email,
      website,
      username,
      password,
      confirmPassword,
    } = req.body;
    // Check for existing hostel with same email or username
    const existingHostel = await Hostel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingHostel) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }

    // Create new hostel document
    const hostel = new Hostel({
      name,
      ownerName,
      address,
      contact,
      email,
      website,
      username,
      password: await hashedPassword(password),
    });

    // Save to MongoDB
    const result = await hostel.save();

    if (result) {
      res.status(201).json({
        message: "Hostel registered successfully",
        hostelId: result._id,
      });
    } else {
      res.status(500).json({ error: "Failed to register hostel" });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const loginHostel = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find hostel by username
    const hostel = await Hostel.findOne({ username });
    if (!hostel) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Compare password
    const isValidPassword = await comparePassword(password, hostel.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Create a response object without sensitive information
    const hostelData = {
      id: hostel._id,
      name: hostel.name,
      ownerName: hostel.ownerName,
      email: hostel.email,
    };

    res.json({
      message: "Login successful",
      hostel: hostelData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllStudents = async (req, res) => {
  const { hostelId } = req.params;
  try {
    const students = await Student.find({ hostelId });
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find({}, { password: 0 }); // Exclude password field
    res.json(hostels);
  } catch (error) {
    console.error("Error fetching hostels:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const searchHostelByName = async (req, res) => {
  try {
    const { hostelName } = req.params;
    const hostel = await Hostel.findOne(
      { name: { $regex: new RegExp(hostelName, 'i') } },
      { password: 0 } // Exclude password field
    );
    
    if (!hostel) {
      return res.status(404).json({ error: "Hostel not found" });
    }
    
    res.json(hostel);
  } catch (error) {
    console.error("Error searching hostel:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

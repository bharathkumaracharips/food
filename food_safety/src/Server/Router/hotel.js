import {
  registerHostel,
  loginHostel,
  getAllStudents,
  getAllHostels,
  searchHostelByName,
} from "../Controller/hotel.js";
import express from "express";

const hotelRouter = express.Router();

// Specific routes first
hotelRouter.get("/", (req, res) => {
  res.send("Register Hostel");
});

// Register Hostel is from admin
hotelRouter.post("/register", registerHostel);

// Get all students for a hostel
hotelRouter.get("/get-all-students/:hostelId", getAllStudents);

// Login Hostel is from hostel
hotelRouter.post("/login", loginHostel);

// Get all hostels
hotelRouter.get("/all", getAllHostels);

// Search hostel by name - this should be last
hotelRouter.get("/search/:hostelName", searchHostelByName);

export default hotelRouter;

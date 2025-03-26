import {
  registerHostel,
  loginHostel,
  getAllStudents,
  getAllHostels,
} from "../Controller/hotel.js";
import express from "express";

const hotelRouter = express.Router();

hotelRouter.get("/", (req, res) => {
  res.send("Register Hostel");
});

// Register Hostel is from admin
hotelRouter.post("/register", registerHostel);

hotelRouter.get("/get-all-students/:hostelId", getAllStudents);

// Login Hostel is from hostel
hotelRouter.post("/login", loginHostel);

// Get all hostels
hotelRouter.get("/all", getAllHostels);

export default hotelRouter;

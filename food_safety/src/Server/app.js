import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import connectToMongoDB from "./DBConfig.js";
import hotelRouter from "./Router/hotel.js";
import studentRouter from "./Router/student.js";
import menuRouter from "./Router/menu.js";

const port = 5001;
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/hostel", hotelRouter);
app.use("/api/student", studentRouter);
app.use("/api/menu", menuRouter);

connectToMongoDB(
  "mongodb+srv://bharathkumaracharips:root@cluster0.8lkn7.mongodb.net/food_safety_db?retryWrites=true&w=majority&appName=Cluster0"
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

import express from "express";
import { registerStudent } from "../Controller/student.js";
const studentRouter = express.Router();

studentRouter.get("/", (req, res) => {
  res.send("Register Student");
});

studentRouter.post("/register", registerStudent);
studentRouter.post("/login", (req, res) => {
  res.send("Login Student");
});

export default studentRouter;

import express from "express";
import { 
    registerStudent, 
    resetPassword, 
    deleteStudent, 
    loginStudent,
    getMealStatus,
    updateMealStatus,
    getMealHistory 
} from "../Controller/student.js";

const studentRouter = express.Router();

// Base route
studentRouter.get("/", (req, res) => {
  res.send("Student API");
});

// Auth routes
studentRouter.post("/register", registerStudent);
studentRouter.post("/login", loginStudent);
studentRouter.post("/reset-password", resetPassword);
studentRouter.delete("/:id", deleteStudent);

// Meal status routes
studentRouter.get("/meal-status/:id", getMealStatus);
studentRouter.put("/meal-status/:id", updateMealStatus);
studentRouter.get("/meal-history/:id", getMealHistory);

export default studentRouter;

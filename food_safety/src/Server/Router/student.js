import express from "express";
import { 
    registerStudent, 
    resetPassword, 
    deleteStudent, 
    loginStudent,
    getMealStatus,
    updateMealStatus,
    getMealHistory,
    submitMeals,
    getMealPreferences,
    updateMealPreferences
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

// Meal preferences routes
studentRouter.get("/meal-preferences/:id", getMealPreferences);
studentRouter.put("/meal-preferences/:id", updateMealPreferences);

// Meal status routes
studentRouter.get("/meal-status/:id", getMealStatus);
studentRouter.put("/meal-status/:id", updateMealStatus);
studentRouter.get("/meal-history/:id", getMealHistory);
studentRouter.post("/submit-meals/:id", submitMeals);

// Delete route (keep this last)
studentRouter.delete("/:id", deleteStudent);

export default studentRouter;

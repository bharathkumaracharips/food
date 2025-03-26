import express from "express";
import {
    registerStudent,
    loginStudent,
    updateMealStatus,
    getMealHistory,
    submitMeals,
    resetPassword,
    deleteStudent,
    getMealStatus
} from "../Controller/student.js";

const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.put("/meal-status/:id", updateMealStatus);
router.get("/meal-history/:id", getMealHistory);
router.post("/submit-meals/:id", submitMeals);
router.post("/reset-password", resetPassword);
router.delete("/:id", deleteStudent);
router.get("/meal-status/:id", getMealStatus);

export default router; 
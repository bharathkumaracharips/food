import Student from "../Models/student.js";
import { hashedPassword, comparePassword } from "../encrypt.js";

export const registerStudent = async (req, res) => {
  try {
    const { name, email, phone, roomNo, username, password, hostelId } =
      req.body;

    // Check if student with same email or username exists
    const existingStudent = await Student.findOne({
      $or: [
        { email },
        { username },
        { roomNo, hostelId }, // Check if room is already occupied in this hostel
      ],
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
    const hashedPass = await hashedPassword(password);

    // Create new student
    const student = new Student({
      name,
      email,
      phone,
      roomNo,
      username,
      password: hashedPass,
      hostelId,
    });

    const result = await student.save();

    res.status(201).json({
      message: "Student registered successfully",
      studentId: result._id,
    });
  } catch (error) {
    console.error("Student registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { studentId, newPassword } = req.body;

    if (!studentId || !newPassword) {
      return res.status(400).json({ error: "Student ID and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Find student by ID
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Hash the new password
    const hashedNewPassword = await hashedPassword(newPassword);
    
    // Update the password
    student.password = hashedNewPassword;
    await student.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Student.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Delete student error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const loginStudent = async (req, res) => {
  try {
    const { hostelId, roomNo, username, password } = req.body;

    // Find student by hostelId, roomNo, and username
    const student = await Student.findOne({ hostelId, roomNo, username });
    if (!student) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare password
    const isValidPassword = await comparePassword(password, student.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create a response object without sensitive information
    const studentData = {
      _id: student._id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      roomNo: student.roomNo,
      username: student.username,
      hostelId: student.hostelId
    };

    res.json({
      message: "Login successful",
      student: studentData
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMealStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({
      breakfast: student.breakfast,
      lunch: student.lunch,
      dinner: student.dinner
    });
  } catch (error) {
    console.error("Error fetching meal status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateMealStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { meal, status, date } = req.body;

    if (!meal || typeof status !== 'boolean' || !date) {
      return res.status(400).json({ error: "Meal type, status, and date are required" });
    }

    if (!['breakfast', 'lunch', 'dinner'].includes(meal)) {
      return res.status(400).json({ error: "Invalid meal type" });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Convert date string to Date object and set to start of day
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Check if the date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (targetDate < today) {
      return res.status(400).json({ error: "Cannot modify meal preferences for past dates" });
    }

    // Find history entry for the target date or create new one
    let dayHistory = student.mealHistory.find(h => {
      const historyDate = new Date(h.date);
      return historyDate.getTime() === targetDate.getTime();
    });

    if (!dayHistory) {
      dayHistory = {
        date: targetDate,
        breakfast: false,
        lunch: false,
        dinner: false
      };
      student.mealHistory.push(dayHistory);
    }

    // Update the meal status for the specific date
    dayHistory[meal] = status;

    // If the date is today, also update the current meal status
    if (targetDate.getTime() === today.getTime()) {
      student[meal] = status;
    }

    // Save the student document
    await student.save();

    res.json({
      message: `${meal} status updated successfully for ${date}`,
      [meal]: status
    });
  } catch (error) {
    console.error("Error updating meal status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMealHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Get the last 30 days of meal history
    const history = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Find history entry for this date
      const dayHistory = student.mealHistory.find(h => {
        const historyDate = new Date(h.date);
        return historyDate.getTime() === date.getTime();
      });

      // If no history for this date, use default values
      const entry = dayHistory || {
        breakfast: false,
        lunch: false,
        dinner: false
      };

      history.push({
        date: date.toISOString().split('T')[0],
        meals: [
          {
            type: 'Breakfast',
            status: entry.breakfast
          },
          {
            type: 'Lunch',
            status: entry.lunch
          },
          {
            type: 'Dinner',
            status: entry.dinner
          }
        ]
      });
    }

    res.json(history);
  } catch (error) {
    console.error("Error fetching meal history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

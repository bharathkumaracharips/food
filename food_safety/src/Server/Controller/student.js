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

    if (!['breakfast', 'lunch', 'dinner'].includes(meal.toLowerCase())) {
      return res.status(400).json({ error: "Invalid meal type" });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Convert date string to Date object in UTC
    const [year, month, day] = date.split('-').map(Number);
    const targetDate = new Date(Date.UTC(year, month - 1, day));

    // Get today's date in UTC
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    if (targetDate < today) {
      return res.status(400).json({ error: "Cannot modify meal preferences for past dates" });
    }

    // Find history entry for the target date or create new one
    let dayHistory = student.mealHistory.find(h => {
      const historyDate = new Date(h.date);
      return historyDate.toISOString().split('T')[0] === targetDate.toISOString().split('T')[0];
    });

    if (!dayHistory) {
      dayHistory = {
        date: targetDate,
        meals: [
          { type: 'Breakfast', status: meal.toLowerCase() === 'breakfast' ? status : false },
          { type: 'Lunch', status: meal.toLowerCase() === 'lunch' ? status : false },
          { type: 'Dinner', status: meal.toLowerCase() === 'dinner' ? status : false }
        ],
        isSubmitted: false
      };
      student.mealHistory.push(dayHistory);
    } else {
      // Update existing meal status
      const mealIndex = dayHistory.meals.findIndex(m => 
        m.type.toLowerCase() === meal.toLowerCase()
      );
      
      if (mealIndex !== -1) {
        dayHistory.meals[mealIndex].status = status;
      } else {
        dayHistory.meals.push({
          type: meal.charAt(0).toUpperCase() + meal.slice(1),
          status: status
        });
      }
    }

    // If the date is today, also update the current meal status
    if (targetDate.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
      student[meal.toLowerCase()] = status;
    }

    // Save the student document
    await student.save();

    res.json({
      message: `${meal} status updated successfully for ${date}`,
      meals: dayHistory.meals
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
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() - i);
      
      // Find history entry for this date
      const dayHistory = student.mealHistory.find(h => {
        const historyDate = new Date(h.date);
        return historyDate.toISOString().split('T')[0] === date.toISOString().split('T')[0];
      });

      // If no history for this date, use default values
      const entry = {
        date: date.toISOString().split('T')[0],
        meals: dayHistory ? dayHistory.meals : [
          { type: 'Breakfast', status: false },
          { type: 'Lunch', status: false },
          { type: 'Dinner', status: false }
        ],
        isSubmitted: dayHistory ? dayHistory.isSubmitted : false
      };

      history.push(entry);
    }

    res.json(history);
  } catch (error) {
    console.error("Error fetching meal history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const submitMeals = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, meals } = req.body;

        if (!date || !meals) {
            return res.status(400).json({ error: "Date and meals are required" });
        }

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Convert date string to Date object in UTC
        const [year, month, day] = date.split('-').map(Number);
        const targetDate = new Date(Date.UTC(year, month - 1, day));

        // Get today's date in UTC
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        // Compare dates using ISO strings to avoid timezone issues
        if (targetDate.toISOString().split('T')[0] < today.toISOString().split('T')[0]) {
            return res.status(400).json({ error: "Cannot submit meal preferences for past dates" });
        }

        // Check if preferences are already submitted for today
        const existingHistory = student.mealHistory.find(h => {
            const historyDate = new Date(h.date);
            return historyDate.toISOString().split('T')[0] === targetDate.toISOString().split('T')[0];
        });

        if (existingHistory && existingHistory.isSubmitted) {
            return res.status(400).json({ error: "Meal preferences already submitted for today" });
        }

        // Find or create history entry for the target date
        let dayHistory = existingHistory;

        if (!dayHistory) {
            dayHistory = {
                date: targetDate,
                meals: [
                    { type: 'Breakfast', status: meals.breakfast },
                    { type: 'Lunch', status: meals.lunch },
                    { type: 'Dinner', status: meals.dinner }
                ],
                isSubmitted: true
            };
            student.mealHistory.push(dayHistory);
        } else {
            // Update existing history
            dayHistory.meals = [
                { type: 'Breakfast', status: meals.breakfast },
                { type: 'Lunch', status: meals.lunch },
                { type: 'Dinner', status: meals.dinner }
            ];
            dayHistory.isSubmitted = true;
        }

        // If the date is today, also update the current meal status
        if (targetDate.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
            student.breakfast = meals.breakfast;
            student.lunch = meals.lunch;
            student.dinner = meals.dinner;
        }

        // Save the student document
        await student.save();

        res.json({
            message: "Meal preferences submitted successfully",
            date,
            meals: dayHistory.meals,
            isSubmitted: true
        });
    } catch (error) {
        console.error("Error submitting meal preferences:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMealPreferences = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting meal preferences for student:', id); // Debug log

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Get today's meal preferences from meal history
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let todayHistory = student.mealHistory.find(h => {
      const historyDate = new Date(h.date);
      historyDate.setHours(0, 0, 0, 0);
      return historyDate.getTime() === today.getTime();
    });

    // If no history exists for today, create default preferences
    const preferences = {
      breakfast: todayHistory?.meals?.find(m => m.type === 'Breakfast')?.status ?? true,
      lunch: todayHistory?.meals?.find(m => m.type === 'Lunch')?.status ?? true,
      dinner: todayHistory?.meals?.find(m => m.type === 'Dinner')?.status ?? true
    };

    console.log('Returning meal preferences:', preferences); // Debug log
    res.json(preferences);
  } catch (error) {
    console.error("Error getting meal preferences:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateMealPreferences = async (req, res) => {
  try {
    const { id } = req.params;
    const { breakfast, lunch, dinner } = req.body;
    console.log('Updating meal preferences for student:', id, { breakfast, lunch, dinner }); // Debug log

    if (typeof breakfast !== 'boolean' || typeof lunch !== 'boolean' || typeof dinner !== 'boolean') {
      return res.status(400).json({ error: "Invalid meal preferences format" });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Get today's date in UTC
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create today's meal history
    let todayHistory = student.mealHistory.find(h => {
      const historyDate = new Date(h.date);
      historyDate.setHours(0, 0, 0, 0);
      return historyDate.getTime() === today.getTime();
    });

    if (!todayHistory) {
      todayHistory = {
        date: today,
        meals: [
          { type: 'Breakfast', status: breakfast },
          { type: 'Lunch', status: lunch },
          { type: 'Dinner', status: dinner }
        ],
        isSubmitted: true
      };
      student.mealHistory.push(todayHistory);
    } else {
      // Update existing meal preferences
      todayHistory.meals = todayHistory.meals.map(meal => {
        switch (meal.type) {
          case 'Breakfast':
            return { ...meal, status: breakfast };
          case 'Lunch':
            return { ...meal, status: lunch };
          case 'Dinner':
            return { ...meal, status: dinner };
          default:
            return meal;
        }
      });
    }

    await student.save();
    console.log('Updated meal preferences saved:', todayHistory); // Debug log

    res.json({
      breakfast,
      lunch,
      dinner
    });
  } catch (error) {
    console.error("Error updating meal preferences:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

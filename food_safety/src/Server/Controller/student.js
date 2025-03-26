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

    const hashedpassword = await hashedPassword(password);

    // Create new student
    const student = new Student({
      name,
      email,
      phone,
      roomNo,
      username,
      password: hashedPassword,
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

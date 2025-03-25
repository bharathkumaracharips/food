import React, { useState, useEffect } from "react";

function StudentFoodTable() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/students");
        const data = await response.json();
        if (response.ok) {
          setStudents(data);
        } else {
          console.error("Failed to fetch students");
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, []);

  const handleCheckboxChange = (id, meal) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student._id === id ? { ...student, [meal]: !student[meal] } : student
      )
    );
  };

  const getTotalCount = (meal) => {
    return students.filter((student) => student[meal]).length;
  };

  return (
    <div>
      <h2>Student Food Table</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Room</th>
            <th>Breakfast</th>
            <th>Lunch</th>
            <th>Dinner</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student._id}>
              <td>{student.name}</td>
              <td>{student.roomNo}</td>
              <td>
                <input
                  type="checkbox"
                  checked={student.breakfast || false}
                  onChange={() => handleCheckboxChange(student._id, "breakfast")}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={student.lunch || false}
                  onChange={() => handleCheckboxChange(student._id, "lunch")}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={student.dinner || false}
                  onChange={() => handleCheckboxChange(student._id, "dinner")}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <p>Total Breakfast Accepted: {getTotalCount("breakfast")}</p>
        <p>Total Lunch Accepted: {getTotalCount("lunch")}</p>
        <p>Total Dinner Accepted: {getTotalCount("dinner")}</p>
      </div>
    </div>
  );
}

export default StudentFoodTable;
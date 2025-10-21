import { useEffect, useState } from "react";
import { FaEdit, FaEye, FaTrashAlt } from "react-icons/fa";
import "../../assets/styles/workout.css";

const Workout = () => {
  const [workouts, setWorkouts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Load workout data
  useEffect(() => {
    const mockData = Array.from({ length: 150 }, (_, i) => ({
      id: i + 1,
      date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
      name: `Workout ${i + 1}`,
      duration: `${30 + (i % 60)} mins`,
      calories: 200 + i * 5,
      type: i % 2 === 0 ? "Cardio" : "Strength",
    }));

    // Sort by most recent first ✅
    const sortedData = mockData.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    setWorkouts(sortedData);
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(workouts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = workouts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleView = (id) => console.log("View details:", id);
  const handleEdit = (id) => console.log("Edit workout:", id);
  const handleDelete = (id) => console.log("Delete workout:", id);

  return (
    <div className="workout-container">
      <div className="workout-header">
        <h2 className="workout-title">Latest Workouts</h2>
        <button className="add-workout-button">Add Workout</button>
      </div>

      <table className="workout-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Workout Name</th>
            <th>Type</th>
            <th>Duration</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((workout, index) => (
            <tr key={workout.id}>
              <td>{startIndex + index + 1}</td>
              <td>{workout.date}</td>
              <td>{workout.name}</td>
              <td>{workout.type}</td>
              <td>{workout.duration}</td>
              <td>
                <button
                  className="icon-button view"
                  title="View Details"
                  onClick={() => handleView(workout.id)}
                >
                  <FaEye />
                </button>
                <button
                  className="icon-button edit"
                  title="Edit Workout"
                  onClick={() => handleEdit(workout.id)}
                >
                  <FaEdit />
                </button>
                <button
                  className="icon-button delete"
                  title="Delete Workout"
                  onClick={() => handleDelete(workout.id)}
                >
                  <FaTrashAlt />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ← Prev
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Workout;

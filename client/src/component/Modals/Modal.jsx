import { useState } from "react";
import "../../assets/styles/modal.css";

const Modal = ({ isOpen, onClose, onSubmit }) => {
  const [type, setType] = useState("Strength");
  const [exercises, setExercises] = useState([
    { exercise_name: "", sets: "", reps: "", weight_kg: "", duration_min: "" },
  ]);

  if (!isOpen) return null;

  const handleExerciseChange = (index, field, value) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);
  };

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        exercise_name: "",
        sets: "",
        reps: "",
        weight_kg: "",
        duration_min: "",
      },
    ]);
  };

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const workoutData = {
      name: formData.get("name"),
      type,
      date: formData.get("date"),
      duration_min: formData.get("duration_min"),
      notes: formData.get("notes"),
      exercises,
    };

    console.log("📤 Submitting workout:", workoutData);

    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/workouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...workoutData,
        user_id: JSON.parse(localStorage.getItem("user")).id,
      }),
    });

    const data = await res.json();
    console.log("✅ Workout saved:", data);

    if (res.ok) {
      alert("Workout added successfully!");
      onSubmit(data.workout); // notify parent
      onClose();
    } else {
      alert(`Failed to save workout: ${data.error || "Unknown error"}`);
    }
  };

  const renderExerciseFields = () => {
    switch (type) {
      case "Strength":
        return exercises.map((ex, i) => (
          <div key={i} className="exercise-row">
            <input
              type="text"
              placeholder="Exercise Name"
              value={ex.exercise_name}
              onChange={(e) =>
                handleExerciseChange(i, "exercise_name", e.target.value)
              }
              required
            />
            <input
              type="number"
              placeholder="Sets"
              value={ex.sets}
              onChange={(e) => handleExerciseChange(i, "sets", e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Reps"
              value={ex.reps}
              onChange={(e) => handleExerciseChange(i, "reps", e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Weight (kg)"
              value={ex.weight_kg}
              onChange={(e) =>
                handleExerciseChange(i, "weight_kg", e.target.value)
              }
            />
            {i > 0 && (
              <button
                type="button"
                className="remove-ex-btn"
                onClick={() => removeExercise(i)}
              >
                ✕
              </button>
            )}
          </div>
        ));

      case "Cardio":
      case "Flexibility":
      case "Yoga":
        return exercises.map((ex, i) => (
          <div key={i} className="exercise-row">
            <input
              type="text"
              placeholder="Exercise Name"
              value={ex.exercise_name}
              onChange={(e) =>
                handleExerciseChange(i, "exercise_name", e.target.value)
              }
              required
            />
            <input
              type="number"
              placeholder="Duration (min)"
              value={ex.duration_min}
              onChange={(e) =>
                handleExerciseChange(i, "duration_min", e.target.value)
              }
              required
            />
            {i > 0 && (
              <button
                type="button"
                className="remove-ex-btn"
                onClick={() => removeExercise(i)}
              >
                ✕
              </button>
            )}
          </div>
        ));

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Add New Workout</h2>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Workout Name
            <input
              type="text"
              name="name"
              placeholder="e.g. Leg Day"
              required
            />
          </label>

          <label>
            Type
            <select
              name="type"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setExercises([
                  {
                    exercise_name: "",
                    sets: "",
                    reps: "",
                    weight_kg: "",
                    duration_min: "",
                  },
                ]);
              }}
              required
            >
              <option value="Strength">Strength</option>
              <option value="Cardio">Cardio</option>
              <option value="Yoga">Yoga</option>
              <option value="Flexibility">Flexibility</option>
            </select>
          </label>

          <label>
            Date
            <input type="date" name="date" required />
          </label>

          <label>
            Duration (optional)
            <input type="number" name="duration_min" placeholder="e.g. 45" />
          </label>

          <label>
            Notes
            <textarea name="notes" placeholder="Optional notes..." rows="3" />
          </label>

          <div className="exercise-section">
            <h4>Exercises</h4>
            {renderExerciseFields()}
            <button type="button" className="add-ex-btn" onClick={addExercise}>
              + Add Exercise
            </button>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn save">
              Save Workout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;

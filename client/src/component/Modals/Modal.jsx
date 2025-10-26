import "../../assets/styles/modal.css";

const Modal = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null; // Don't render when closed

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const workout = {
      name: formData.get("name"),
      type: formData.get("type"),
      duration: formData.get("duration"),
      date: formData.get("date"),
    };
    onSubmit(workout);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Add New Workout</h2>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Workout Name
            <input type="text" name="name" placeholder="e.g. Morning Run" required />
          </label>

          <label>
            Type
            <select name="type" required>
              <option value="Cardio">Cardio</option>
              <option value="Strength">Strength</option>
              <option value="Yoga">Yoga</option>
              <option value="Stretching">Stretching</option>
            </select>
          </label>

          <label>
            Duration (minutes)
            <input type="number" name="duration" placeholder="e.g. 45" min="5" required />
          </label>

          <label>
            Date
            <input type="date" name="date" required />
          </label>

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

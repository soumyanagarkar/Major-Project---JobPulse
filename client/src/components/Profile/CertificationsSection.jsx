import { FaAward, FaTrash, FaPlus } from "react-icons/fa";
import "./CertificationsSection.css";

function CertificationsSection({ certifications = [], achievements = [], setProfile }) {
  const updateItem = (field, index, value) => {
    setProfile((prev) => {
      const items = [...(prev[field] || [])];
      items[index] = value;
      return { ...prev, [field]: items };
    });
  };

  const addItem = (field) => {
    setProfile((prev) => ({ ...prev, [field]: [...(prev[field] || []), ""] }));
  };

  const deleteItem = (field, index) => {
    setProfile((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const renderList = (title, field, items, placeholder) => (
    <section className="certification-group">
      <div className="certifications-header">
        <div>
          <h2><FaAward /> {title}</h2>
          <p>Add, edit, or remove {title.toLowerCase()} before saving.</p>
        </div>
        <button className="add-certification-btn" type="button" onClick={() => addItem(field)}>
          <FaPlus /> Add {title.slice(0, -1)}
        </button>
      </div>

      <div className="certifications-list">
        {items.length === 0 ? (
          <div className="empty-certifications">
            <FaAward />
            <h3>No {title} Added</h3>
            <p>Nothing was found in your resume. You can add an item here.</p>
            <button className="empty-add-certification-btn" type="button" onClick={() => addItem(field)}>
              <FaPlus /> Add {title.slice(0, -1)}
            </button>
          </div>
        ) : items.map((item, index) => (
          <div className="certification-card" key={`${field}-${index}`}>
            <div className="certification-number">{index + 1}</div>
            <textarea
              value={item}
              onChange={(event) => updateItem(field, index, event.target.value)}
              placeholder={placeholder}
            />
            <button
              className="delete-certification-btn"
              type="button"
              aria-label={`Delete ${title.slice(0, -1)}`}
              onClick={() => deleteItem(field, index)}
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="certifications-section">
      {renderList("Certifications", "certifications", certifications, "Enter certificate name and issuing organization...")}
      {renderList("Achievements", "achievements", achievements, "Enter an award, accomplishment, or achievement...")}
    </div>
  );
}

export default CertificationsSection;

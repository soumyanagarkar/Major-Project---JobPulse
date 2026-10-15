import { useEffect, useState } from "react";

import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

import "./Notification.css";

function Notification({
  message,
  type = "success",
  onClose,
}) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!message) return;

    setClosing(false);

    const timer = setTimeout(() => {
      setClosing(true);

      setTimeout(() => {
        onClose();
      }, 350);

    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [message, onClose]);

  if (!message) return null;

  const icons = {
    success: <FaCheckCircle />,
    error: <FaTimesCircle />,
    warning: <FaExclamationTriangle />,
    info: <FaInfoCircle />,
  };

  const handleClose = () => {
    setClosing(true);

    setTimeout(() => {
      onClose();
    }, 350);
  };

  return (
    <div
      className={`notification notification-${type} ${
        closing ? "notification-closing" : ""
      }`}
    >

      <div className="notification-icon">
        {icons[type]}
      </div>

      <div className="notification-content">
        <div className="notification-message">
          {message}
        </div>
      </div>

      <button
        className="notification-close"
        onClick={handleClose}
        aria-label="Close notification"
      >
        ×
      </button>

      <div className="notification-progress">
        <div className="notification-progress-bar" />
      </div>

    </div>
  );
}

export default Notification;
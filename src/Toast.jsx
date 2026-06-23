import { useEffect, useState } from "react";

export default function Toast({ message, type }) {
  const [visible, setVisible] = useState(false);

  const colors = {
    success: "#4caf50",
    error: "#f44336",
  };

  useEffect(() => {
    // Fade-in
    setVisible(true);

    // Fade-out po 1.5s
    const timer = setTimeout(() => setVisible(false), 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "14px 20px",
        background: colors[type] || "#333",
        color: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        zIndex: 9999,

        // ANIMACIJA
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-10px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",

        fontSize: "15px",
        fontWeight: "500",
      }}
    >
      {message}
    </div>
  );
}

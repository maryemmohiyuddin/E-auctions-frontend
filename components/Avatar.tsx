import React from "react";

export const Avatar = ({ isBordered, as, className, color, name, size }) => {
  const firstLetter = name?.charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`avatar ${className} ${isBordered ? "bordered" : ""}`}
      style={{
        width: size === "sm" ? "40px" : "60px",
        height: size === "sm" ? "40px" : "60px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: color === "secondary" ? "#f0f0f0" : "#e0e0e0",
        borderRadius: "50%",
        fontSize: "16px",
        fontWeight: "bold",
      }}
      as={as}
    >
      {firstLetter}
    </div>
  );
};

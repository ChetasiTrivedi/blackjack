import React from "react";
import "./Card.css";

export default function Card({ value, suit }) {
  const isRed = suit === "♥" || suit === "♦";

  return (
    <div className={`card ${isRed ? "red" : "black"}`}>
      <div className="card-corner top-left">
        {value}
        <span>{suit}</span>
      </div>

      <div className="card-suit">{suit}</div>

      <div className="card-corner bottom-right">
        {value}
        <span>{suit}</span>
      </div>
    </div>
  );
}

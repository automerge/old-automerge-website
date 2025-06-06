import React from "react";

interface ExerciseProps {
  children: React.ReactNode;
}

export default function Exercise({ children }: ExerciseProps) {
  return (
    <div className="exercise">
      <div className="exercise-header">
        <h3>Exercise</h3>
      </div>
      <div className="exercise-content">{children}</div>
    </div>
  );
}

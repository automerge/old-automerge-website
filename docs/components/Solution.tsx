import React from "react";

interface SolutionProps {
  children: React.ReactNode;
}

export default function Solution({ children }: SolutionProps) {
  return (
    <div className="solution">
      <div className="solution-header">
        <h4>Solution</h4>
      </div>
      <div className="solution-content">{children}</div>
    </div>
  );
}

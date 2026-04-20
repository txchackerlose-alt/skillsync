import React from "react";

export default function Spinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="spinner-container">
      <div className="dual-orbit-loader">
        {/* Outer Ring */}
        <div className="orbit-outer"></div>
        {/* Inner Ring */}
        <div 
          className="orbit-inner" 
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        ></div>
      </div>
      {text && <div className="spinner-text">{text}</div>}
    </div>
  );
}

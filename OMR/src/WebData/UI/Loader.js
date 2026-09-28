import React from "react";

const Loader = () => {
  const loaderStyle = {
    border: "4px solid rgba(0, 0, 0, 0.1)",
    borderLeftColor: "transparent",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    animation: "spin89345 1s linear infinite",
  };

  const keyframes = `
    @keyframes spin89345 {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <div>
      {/* Inject keyframes dynamically */}
      <style>{keyframes}</style>

      {/* Loader element */}
      <div style={loaderStyle}></div>
    </div>
  );
};

export default Loader;

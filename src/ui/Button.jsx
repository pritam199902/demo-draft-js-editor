import React from "react";

function Button({ children, onClick, disabled, style, ...rest }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;

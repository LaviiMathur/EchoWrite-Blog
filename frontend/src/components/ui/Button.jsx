import React from "react";

function Button({
  children,
  type = "button",
  bgColor = "white",
  textColor = "black",
  width = "200px",
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={`rounded-md active:scale-90 focus:outline-0 transition transform md:font-bold cursor-pointer ${className} ${
        width === "full" ? "w-full" : ""
      }`}
      style={
        width !== "full"
          ? { backgroundColor: bgColor, color: textColor, width }
          : { backgroundColor: bgColor, color: textColor }
      }
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;

import React, { useId } from "react";

function Select(
  { options, label, labelClassName, className, selectClassName, ...props },
ref
) {
  const id = useId();
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label htmlFor={id} className={` ${labelClassName}`}>
          {label}
        </label>
      )}
      <select
        id={id}
        className={`border ${selectClassName}  outline-none p-2 rounded`}
        {...props}
      >
        {options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default React.forwardRef(Select);

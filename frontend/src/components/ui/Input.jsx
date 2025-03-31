import React, { useId, forwardRef } from "react";

export default forwardRef(function Input(
  { label, type = "text", className = "", ...props },
  ref
) {
  const id = useId();
  return (
    <div className="w-full">
      {label && (
        <label className="inline-block mb-1 pl-1" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        type={type}
        name={label}
        id={id}
        ref={ref}
        className={`${className} h-10 md:text-lg  rounded-md border border-[#6855E0] w-full outline-none focus:bg-white py-3 px-4`}
        {...props}
        
        
        
      />
    </div>
  );
});

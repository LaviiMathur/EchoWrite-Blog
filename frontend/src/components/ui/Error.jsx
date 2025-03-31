import React from "react";
import { Header } from "../index.components";
import { TbUserX } from "react-icons/tb";
import { LuFileX } from "react-icons/lu";

function Error({ errorMessage, profile }) {
  return (
    <div className="bg-[#F0F0FA] min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl flex-grow">
        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
          {profile ? (
            <TbUserX className="w-16 h-16 pb-4" strokeWidth={1.5} />
          ) : (
            <LuFileX className="w-16 h-16 pb-4" strokeWidth={1.5} />
          )}
          <p className="text-lg font-semibold">{errorMessage}</p>
         
        </div>
      </div>
    </div>
  );
}

export default Error;

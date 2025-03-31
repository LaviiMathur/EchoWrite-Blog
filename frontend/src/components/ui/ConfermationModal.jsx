import React from "react";
import Button from "./Button";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-300/60">
      <div className="bg-white p-5 rounded-lg shadow-lg w-80">
        <p className="text-gray-700 text-lg">{message}</p>
        <div className="mt-4 flex justify-end space-x-3">
          <Button
            onClick={onClose}
            textColor="black"
            bgColor="#f0f0f0"
            className=" text-lg p-2 "
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="text-lg   p-2"
            textColor="white"
            bgColor="#6855E0"
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

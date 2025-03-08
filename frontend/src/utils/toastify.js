import { toast } from "react-toastify";
import { Slide } from "react-toastify";

export const showToast = (type, message) => {

  const defaultOptions = {
    position: "top-right",
    autoClose: 1500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Slide,
   
  };

  toast.dismiss();

  switch (type) {
    case "success":
      return toast.success(message, defaultOptions);
    case "error":
      return toast.error(message, defaultOptions);
    case "info":
      return toast.info(message, defaultOptions);
    case "warning":
      return toast.warning(message, defaultOptions);
    default:
      return toast(message, {
        ...defaultOptions,
        type: type || "default"
      });
  }
};

// Utility for quick, consistent toasts
 const  toastPresets = {
  success: (message) => showToast("success", message),
  error: (message) => showToast("error", message),
  info: (message) => showToast("info", message),
  warning: (message) => showToast("warning", message),
};
export default toastPresets
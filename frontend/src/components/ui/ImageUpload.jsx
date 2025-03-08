import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import toastPresets from "../../utils/toastify";
import appwriteService from "../../config/appwrite";

const ImageUpload = ({
  onImageUpload,
  onImageRemove,
  initialImageUrl = "",

  label = "Upload Image",
  className = "",
  isProfile = false,
}) => {
  const [imagePreview, setImagePreview] = useState("");
  const [fileId, setFileId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isAppwriteImage, setIsAppwriteImage] = useState(false);

  // Set initial image preview if available and determine if it's from Appwrite
  useEffect(() => {
    if (initialImageUrl) {
      setImagePreview(initialImageUrl);

      // Extract file ID from Appwrite URL
      const match = initialImageUrl?.match(/\/files\/([^\/]+)\/view/);
      const fileId = match && match[1] ? match[1] : null;
      setFileId(fileId);

      setIsAppwriteImage(fileId ? true : false);

      setIsAppwriteImage(
        fileId !== null ||
          initialImageUrl.includes("appwrite") ||
          initialImageUrl.includes("/v1/storage/")
      );
    }
  }, [initialImageUrl]);

  // Handle file upload
  const handleUpload = useCallback(
    async (file) => {
      if (!file) return;
      try {
        setUploading(true);

        // Delete existing image if it's from Appwrite
        if (isAppwriteImage && fileId) {
          try {
            await appwriteService.deleteFile(fileId);
          } catch (error) {
            console.error("Error deleting previous file:", error);
          }
        }

        // Upload new file
        const response = await appwriteService.uploadFile(file);

        if (response && response.$id) {
          // Get file URL and set preview
          const fileUrl = appwriteService.getFileUrl(response.$id);
          setImagePreview(fileUrl);
          setFileId(response.$id);
          setIsAppwriteImage(true);

          // Pass the URL back to the parent component
          onImageUpload({
            avatar: fileUrl,
            fileId: response.$id,
          });

          toastPresets.success("Image uploaded successfully");
        }
      } catch (error) {
        console.error("Upload error:", error);
        toastPresets.error("Failed to upload image");
      } finally {
        setUploading(false);
      }
    },
    [fileId, onImageUpload, isAppwriteImage]
  );

  // Handle file removal
  const handleRemoveImage = async (e) => {
    if (e) {
      e.stopPropagation();
    }

    // check if image on appwrite
    if (isAppwriteImage && fileId) {
      try {
        setUploading(true);

        await appwriteService.deleteFile(fileId);
        toastPresets.success("Image removed");
      } catch (error) {
        console.error("Error deleting file:", error);
        toastPresets.error("Error removing image");
      } finally {
        setUploading(false);
      }
    }

    // Clear image preview and notify parent
    setImagePreview("");
    setFileId(null);
    setIsAppwriteImage(false);
    onImageRemove && onImageRemove();
  };

  // Setup dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    disabled: uploading,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        // Create temporary preview
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload file
        await handleUpload(file);
      }
    },
  });

  return (
    <div className={className}>
      <label className="text-lg font-medium">{label}</label>
      <div
        {...getRootProps()}
        className={`relative cursor-pointer flex flex-col items-center justify-center border-2 border-dashed p-4 rounded-lg transition-colors ${
          uploading ? "opacity-70 cursor-not-allowed" : ""
        } ${isDragActive ? "border-[#6855E0] bg-gray-100" : "border-gray-300"}`}
      >
        <input {...getInputProps()} disabled={uploading} />

        {imagePreview ? (
          <div className="w-full text-center">
            <img
              src={imagePreview}
              alt="Preview"
              className={`max-h-60 mx-auto object-cover ${
                isProfile ? "rounded-full w-32 h-32" : "rounded-lg"
              }`}
            />
            <div className="mt-2 flex justify-center items-center gap-4">
              {!uploading ? (
                <>
                  <p className="text-blue-500 flex items-center gap-2">
                    <MdOutlineDriveFolderUpload size={20} />
                    Click or Drag & Drop to change image
                  </p>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-red-500 hover:text-red-700 px-2 py-1 rounded"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <p className="text-gray-500">Uploading...</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            {uploading ? (
              <p className="mt-2">Uploading image...</p>
            ) : (
              <>
                <MdOutlineDriveFolderUpload size={32} />
                <p className="mt-2">Drop an image OR Click to upload</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;

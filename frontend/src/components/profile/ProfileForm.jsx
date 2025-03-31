import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Loading,
  ImageUpload,
  Select,
  ConfirmationModal,
} from "../index.components";

import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

import toastPresets from "../../utils/toastify";
import { updateUserProfile } from "../../store/authSlice";

function ProfileForm() {
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const [changePass, setChangePass] = useState("No");
  const location = useLocation();
  const { profile } = location.state || {};

  // Redirect if user is not logged in
  useEffect(() => {
    if (!status) {
      toastPresets.info("Not Authorized");
      navigate("/");
    }
  }, [navigate, status]);

  const handleImageUpload = (data) => setValue("avatar", data.avatar);
  const handleImageRemove = () =>
    setValue(
      "avatar",
      "https://cloud.appwrite.io/v1/storage/buckets/67c5d88a001fafdc813d/files/67c72085000fee052488/view?project=67c5d4a400153ab3eeef&mode=admin"
    );

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      data.avatar = data.avatar || profile.avatar;

      const API_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.patch(
        `${API_URL}/profile/${profile.username}/update-profile`,
        data,
        {
          headers: {
            Authorization: `Bearer ${profile.token}`,
          },
          params: { user_id: profile.id },
        }
      );
      dispatch(updateUserProfile(response.data.user));
      toastPresets.success("Profile updated successfully!");
      navigate(`/profile/${data.username}`);
    } catch (error) {
      console.error(error);
      toastPresets.error(
        error.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");
  const passwordsMatch = newPassword === confirmPassword;

  if (!profile) return null;

  return loading ? (
    <Loading />
  ) : (
    <div className="flex items-center justify-center min-h-screen max-h-screen px-6 py-10 m-auto ">
      <div className="w-full max-w-2xl bg-gray-200 shadow-xl rounded-xl p-6 md:p-10 shadow-[#6855E0]/30 mx-auto">
        <h2 className="text-center text-2xl font-bold leading-tight mb-6">
          Update Your Profile
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Upload Section */}
          <ImageUpload
            label="Profile Picture"
            initialImageUrl={profile.avatar}
            defaultValue={profile.fileId}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
            className="mb-6"
            isProfile={true}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              {...register("name", { required: true })}
              className="border-[#6855E0]"
              label="Full Name"
              defaultValue={profile.name}
            />

            <Input
              {...register("username", { required: true })}
              className="border-[#6855E0]"
              label="Username"
              defaultValue={profile.username}
            />

            <div className="md:col-span-2">
              <label className="block mb-1 text-gray-600">Bio</label>
              <textarea
                {...register("bio")}
                className="w-full min-h-full border-1 border-[#6855E0] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#6855E0]/50"
                defaultValue={profile.bio}
                rows={4}
              />
            </div>
          </div>

          <Select
            label="Do you want to change your password?"
            options={["No", "Yes"]}
            value={changePass}
            labelClassName="text-lg font-medium p-2"
            selectClassName="border-1 border-[#6855E0] rounded-lg"
            onChange={(e) => setChangePass(e.target.value)}
          />

          {changePass === "Yes" && (
            <div className="grid grid-cols-2 grid-rows-2 gap-2">
              {/* Current Password - Full Width */}
              <div className="col-span-1">
                <Input
                  {...register("currentPassword", {
                    required: "Current password is required",
                  })}
                  className="border-[#6855E0]"
                  label="Current Password"
                  placeholder="Enter your current password"
                  type="password"
                />
                {errors.currentPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="row-start-2">
                <Input
                  {...register("newPassword", {
                    required: "New password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  className="border-[#6855E0]"
                  label="New Password"
                  placeholder="Enter your new password"
                  type="password"
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="row-start-2">
                <Input
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                  })}
                  className="border-[#6855E0]"
                  label="Confirm Password"
                  placeholder="Confirm your new password"
                  type="password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Password Match Validation */}
              {!passwordsMatch && confirmPassword && (
                <p className="text-red-500 text-sm col-span-2">
                  Passwords do not match
                </p>
              )}
            </div>
          )}

          <div className="flex justify-center gap-4 mt-8">
            <Button
              type="button"
              bgColor="transparent"
              textColor="#6855E0"
              className="py-2 px-6 border-2 border-[#6855E0]"
              onClick={() => navigate(`/profile/${profile.username}`)}
            >
              Cancel
            </Button>

            <Button
              // type="submit"
              bgColor="#6855E0"
              textColor="white"
              className="py-2 px-8"
              onClick={()=>{setIsModalOpen(true)}}
              disabled={changePass === "Yes" && !passwordsMatch}
            >
              Save Changes
            </Button>
            <ConfirmationModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onConfirm={handleSubmit(onSubmit)} 
              message="Are you sure you want to save these changes?"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileForm;

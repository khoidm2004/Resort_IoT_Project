import { useState } from "react";
import useAuthStore from "../../store/authStore";
import { firestore } from "../../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";

/**
 * A custom hook to edit Admin information and avatar
 * This hook check the user is authenicated or not then updates the user information in Firestore
 * and global state
 *
 * @returns {Object} An object contains edit profile function and update state
 * @returns {Function} Function to update user information & avatar and global state
 * @returns {Boolean} Updating state decide whether the editing process is working or not
 */
const useAdminEditProfile = () => {
  const imageStoreAPI = import.meta.env.VITE_UPLOAD_IMAGE_GGCLOUD_API;

  const [isUpdating, setIsUpdating] = useState(false);

  const authUser = useAuthStore((state) => state.user);
  const setAuthUser = useAuthStore((state) => state.setUser);

  /**
   * Funtion to upload image to Google Cloud
   * @param {string | null} selectedFile - The Base64-encoded image or null if no file is selected.
   * @param {string} uid - The admin user ID
   * @returns {string | { Title: string, Message: string, Status: string }} imageURL or response object - The URL of the uploaded image or an error message if upload fails.
   */

  // Upload Image to Google Cloud
  const uploadImageToGoogleCloud = async (selectedFile, uid) => {
    if (!selectedFile) {
      return {
        Title: "Error",
        Message: "No file selected",
        Status: "error",
      };
    } else {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("uid", uid);

      try {
        const response = await fetch(imageStoreAPI, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.text();
          var imageURL = result.replace("File uploaded successfully: ", "");
          return imageURL;
        }
      } catch (error) {
        return { Title: "Error", Message: error.message, Status: "error" };
      }
    }
  };

  /**
   * Funtion to update data in the Firestore
   * @param {Object} inputs - A object contains user updated information
   * @param {string} inputs.fullName - User's full name
   * @param {string} inputs.phoneNum - User's phone number
   * @param {string | null} selectedFile - The Base64-encoded image or null if no file is selected.
   * @returns {Object} An response object indicates the result of editing profile process
   * @property {string} return.Title - Result title (e.g. Success, Error)
   * @property {string} return.Message - Message describing the result of editing process
   * @property {string} return.Title - Result status (e.g. success, error)
   *
   */

  // Update user information in database & upload image
  const editProfile = async (inputs, selectedFile) => {
    setIsUpdating(true);
    const userDocRef = doc(firestore, "users", authUser.uid);

    try {
      let imageURL = authUser.profileImageURL;

      if (selectedFile) {
        const uploadResult = await uploadImageToGoogleCloud(
          selectedFile,
          authUser.uid
        );
        if (typeof uploadResult === "string") {
          imageURL = uploadResult;
        } else {
          throw new Error(uploadResult.Message || "Upload image failed");
        }
      }

      const updatedUser = {
        ...authUser,
        fullName: inputs.fullName || authUser.fullName,
        phoneNum: inputs.phoneNum || authUser.phoneNum,
        profileImage: imageURL || authUser.profileImage,
      };

      await updateDoc(userDocRef, updatedUser);
      setAuthUser(updatedUser);
      localStorage.setItem("user-info", JSON.stringify(updatedUser));
      setIsUpdating(false);

      return {
        Title: "Success",
        Message: "Edit profile successfully",
        Status: "success",
      };
    } catch (error) {
      return {
        Title: "Error",
        Message: error.message,
        Status: "error",
      };
    }
  };

  return { editProfile, isUpdating };
};

export default useAdminEditProfile;

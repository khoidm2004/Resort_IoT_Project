import { useState } from "react";
import { firestore } from "../../firebase/firebase";
import useAuthStore from "../../store/authStore";
import { doc, updateDoc } from "firebase/firestore";

/**
 * A custom hook to edit Client information (fullName % phone number only).
 * This hook check the user is authenicated or not then updates the user information in Firestore
 * and global state
 *
 * @returns {Object} An object contains edit profile function and update state
 * @returns {Function} Function to update user information in database and global state
 * @returns {Boolean} Updating state decide whether the editing process is working or not
 */

const useClientEditProfile = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const authUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  /**
   * Function to edit client profile. It checks if user is authenicated or not
   * then updates the user information and state globally
   *
   * @param {Object} inputs A object contains user updated information
   * @param {string} fullName User's full name
   * @param {string} phoneNum User's phone number
   * @returns {Object} An response object indicates the result of editing profile process
   * @property {string} return.Title - Result title (e.g. Success, Error)
   * @property {string} return.Message - Message describing the result of editing process
   * @property {string} return.Title - Result status (e.g. success, error)
   *
   */

  const editProfile = async (inputs) => {
    if (!authUser) {
      return {
        Title: "Error",
        Message: "User is not authenicated",
        Status: "error",
      };
    }

    setIsUpdating(true);

    const userDocRef = doc(firestore, "users", authUser.uid);

    try {
      const updatedUser = {
        ...authUser,
        fullName: inputs.fullName || authUser.fullName,
        phoneNum: inputs.phoneNum || authUser.phoneNum,
      };

      await updateDoc(userDocRef, updatedUser);
      setUser(updatedUser);
      return {
        Title: "Success",
        Message: "User profile updated successfully",
        Status: "success",
      };
    } catch (error) {
      return { Title: "Error", Message: error.message, Status: "error" };
    }
  };
  return { editProfile, isUpdating };
};

export default useClientEditProfile;

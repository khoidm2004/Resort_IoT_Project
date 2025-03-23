import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "../../firebase/firebase";

/**
 * A custom hook for handling user change password using email and current password.
 * This hook use builtin updatePassword function to update users password
 *  
 * @param {string} newPassword - User's new password
 * @param {string} email - User's email address
 * @param {string} currentPassword - User's current password that user wants to update
 * @returns {Object} A response object indicating the result of the change password attempt
 * @property {string} return.Title - The title of the response (e.g., "Success" or "Error")
 * @property {string} return.Message - A message describing the result of the change password attempt
 * @property {string} return.Status - The status of the change password attempt (e.g., "success" or "error")
 *
 */

const useChangePassword = async (newPassword, email, currentPassword) => {
  const user = auth.currentUser;
  if (!user) {
    return { Title: "Error", Message: "User needs to log in", Status: "error" };
  }

  try {
    const cred = EmailAuthProvider.credential(email, currentPassword);
    await reauthenticateWithCredential(user, cred);

    await updatePassword(user, newPassword);
    return {
      Title: "Success",
      Message: "Change password successfully",
      Status: "success",
    };
  } catch (error) {
    return { Title: "Error", Message: error.message, Status: "error" };
  }
};

export default useChangePassword;

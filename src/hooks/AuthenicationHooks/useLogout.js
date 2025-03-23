import useAuthStore from "../../store/authStore";
import { useSignOut } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/firebase";

/**
 * A custom hook for handling user logout.
 * This hook useSignOut to logout user and update the application's authentication state
 *
 * @returns {Object} An object containing the logout function, loading state, and error state
 * @property {Function} login - A function to logout a user
 * @property {boolean} loading - A boolean indicating whether the logout process is in progress
 * @property {Error} error - An error object if the logout process fails
 *
 */

const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);
  const [signOut, loading, error] = useSignOut(auth);

  /**
   * Logs out a user
   *
   * @returns {Object} A response object indicating the result of the logout attempt
   * @property {string} return.Title - The title of the response (e.g., "Success" or "Error")
   * @property {string} return.Message - A message describing the result of the logout attempt
   * @property {string} return.Status - The status of the logout attempt (e.g., "success" or "error")
   *
   */

  const handleLogout = async () => {
    try {
      await signOut();
      logout();
      return {
        Title: "Success",
        Message: "Logout successfully",
        Status: "success",
      };
    } catch (error) {
      return { Title: "Error", Message: error.message, Status: "error" };
    }
  };
  return { handleLogout, loading, error };
};

export default useLogout;

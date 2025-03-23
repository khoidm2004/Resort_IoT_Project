import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { doc, getDoc } from "@firebase/firestore";
import useAuthStore from "../../store/authStore";
import { auth, firestore } from "../../firebase/firebase";

/**
 * A custom hook for handling user login with email and password.
 * This hook integrates with Firebase Authentication and Firestore to authenticate users
 * and update the application's authentication state
 *
 * @returns {Object} An object containing the login function, loading state, and error state
 * @property {Function} login - A function to login a user with email and password
 * @property {boolean} loading - A boolean indicating whether the login process is in progress
 * @property {Error} error - An error object if the login process fails
 *
 */

const useLogin = () => {
  const [signInWithEmailAndPassword, loading, error] =
    useSignInWithEmailAndPassword(auth);
  const loginUser = useAuthStore((state) => state.login);

  /**
   * Logs in a user with the provided email and password from the input
   *
   * @param {Object} inputs - An object containing the user's login credentials
   * @param {string} inputs.email - The user's email address
   * @param {string} inputs.password - The user's password
   * @returns {Object} A response object indicating the result of the login attempt
   * @property {string} return.Title - The title of the response (e.g., "Success" or "Error")
   * @property {string} return.Message - A message describing the result of the login attempt
   * @property {string} return.Status - The status of the login attempt (e.g., "success" or "error")
   *
   */

  const login = async (inputs) => {
    try {
      const userCred = await signInWithEmailAndPassword(
        inputs.email,
        inputs.password
      );

      //Check if user exists in database by user ID
      if (userCred) {
        const docRef = doc(firestore, "users", userCred.user.uid);
        const docSnap = await getDoc(docRef);

        // Update user state
        loginUser(docSnap.data());
        return {
          Title: "Success",
          Message: "Login successfully",
          Status: "success",
        };
      } else {
        return { Title: "Error", Message: "User not found", Status: "error" };
      }
    } catch (error) {
      return { Title: "Error", Message: error.message, Status: "error" };
    }
  };
  return { login, loading, error };
};

export default useLogin;

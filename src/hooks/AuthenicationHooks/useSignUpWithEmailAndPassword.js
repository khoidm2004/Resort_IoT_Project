import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../firebase/firebase.js";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "@firebase/firestore";
import useAuthStore from "../../store/authStore.js";

/**
 * A custom hook for handling user signup with provided information.
 * This hook integrates with useCreateUserWithEmailAndPassword to create new user
 * and write user data into Firestore
 * and update the application's authentication state
 *
 * @returns {Object} An object containing the signup function, user object, loading state, and error state
 * @property {Function} signUp - A function to signup a user with email and password
 * @property {Object|null} user - The Firebase User object after a successful signup. Null if signup fails or hasn't occurred
 * @property {boolean} loading - A boolean indicating whether the signup process is in progress
 * @property {Error} error - An error object if the signup process fails
 *
 */

const useSignUpWithEmailAndPassword = () => {
  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);

  const loginUser = useAuthStore((state) => state.login);

  /**
   * Sign up a user with the provided information and check if the email is already registered or not
   *
   * @param {Object} inputs - An object containing the user's credentials
   * @param {string} inputs.email - The user's email address
   * @param {string} inputs.password - The user's password
   * @param {string} inputs.fullName - The user's fullname
   * @param {string} inputs.phoneNum - The user's phone number
   * @returns {Object} A response object indicating the result of the signup attempt
   * @property {string} return.Title - The title of the response (e.g., "Success" or "Error")
   * @property {string} return.Message - A message describing the result of the signup attempt
   * @property {string} return.Status - The status of the signup attempt (e.g., "success" or "error")
   *
   */

  const signUp = async (inputs) => {
    const userRef = collection(firestore, "users");

    // Check if the email is already registered
    const q = query(userRef, where("email", "==", inputs.email));
    const querySnapShot = await getDocs(q);

    if (!querySnapShot.empty) {
      return {
        Title: "Error",
        Message: "Email has been registered",
        Status: "error",
      };
    }

    try {
      // Create a new user with email and password
      const newUser = await createUserWithEmailAndPassword(
        inputs.email,
        inputs.password
      );

      // Handle errors if user creation fails
      if (!newUser) {
        return {
          Title: "Error",
          Message: error.message,
          Status: "error",
        };
      }

      // Ensure newUser.user.uid is defined
      if (!newUser.user.uid) {
        throw new Error("User UID is undefined");
      }

      // Create a user document in Firestore
      const userDoc = {
        uid: newUser.user.uid,
        email: inputs.email,
        fullName: inputs.fullName,
        phoneNum: inputs.phoneNum,
        isAdmin: false,
        createdAt: new Date().toISOString(),
      };

      // Save the user document to Firestore
      await setDoc(doc(firestore, "users", newUser.user.uid), userDoc);

      // Update the auth store with the new user
      loginUser(userDoc);

      return {
        Title: "Success",
        Message: "User created successfully",
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

  return { signUp, user, loading, error };
};

export default useSignUpWithEmailAndPassword;

import { auth, firestore } from "../../firebase/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

/**
 * A custom hook for reclaiming user password throgh email.
 * This hook integrates with Firebase Authentication and Firestore to check the
 * user exists or not then send email to user to create new password
 * @param {string} email User's email address
 * @returns {Object} A response object indicating the result of the reclaiming password attempt
 * @property {string} return.Title - The title of the response (e.g., "Success" or "Error")
 * @property {string} return.Message - A message describing the result
 * @property {string} return.Status - The status of the attempt (e.g., "success" or "error")
 *
 */

const useReclaimPassword = async (email) => {
  try {
    const emailRef = collection(firestore, "users");
    const qEmail = query(emailRef, where("email", "==", email));
    const eQuerySnapshot = await getDocs(qEmail);

    if (eQuerySnapshot.empty) {
      return { Title: "Error", Message: "User not found", Status: "error" };
    }

    await sendPasswordResetEmail(auth, email);

    return {
      Title: "Success",
      Message: "Password reset email has been sent",
      Status: "success",
    };
  } catch (error) {
    const eCode = error.code;
    const eMessage = error.message;
    return {
      Title: "Error",
      Message: `Error Code: ${eCode} ${eMessage}`,
      Status: "error",
    };
  }
};

export default useReclaimPassword;

import { create } from "zustand";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useFeedbackStore = create((set) => ({
  // Map data from array
  feedbacks: [],

  /* Data example 
        var feedback = {
            client{
                fullName: string
                uid: string
            }

            complaint {
                complaintContent: string
                complaintTitle: string
            }

            createdAt: timestamp
            feedbackId: string
        }
    */

  addFeedback: async (newFeedback) => {
    try {
      const feedbackRef = collection(firestore, "feedbacks");
      const docRef = doc(feedbackRef);

      const feedbackData = { ...newFeedback, feedbackId: docRef.id };

      await setDoc(docRef, feedbackData);

      set((state) => ({
        feedbacks: [...state.feedbacks, feedbackData],
      }));

      return {
        Title: "Success",
        Message: "Feedback added successfully",
        Status: "success",
      };
    } catch (error) {
      return {
        Title: "Error",
        Message: error.message,
        Status: "error",
      };
    }
  },

  fetchFeedbacks: async () => {
    try {
      const feedbackCollection = collection(firestore, "feedbacks");
      const feedbackSnapshot = await getDocs(feedbackCollection);
      const feedbackList = feedbackSnapshot.docs.map((doc) => ({
        feedbackId: doc.id,
        ...doc.data(),
      }));

      set({ feedbacks: feedbackList });

      return {
        Title: "Success",
        Message: "Feedback fetched successfully",
        Status: "success",
      };
    } catch (error) {
      return { Title: "Error", Message: error.message, Status: "error" };
    }
  },
}));

export default useFeedbackStore;

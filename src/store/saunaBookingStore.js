import { create } from "zustand";
import { firestore } from "../firebase/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

const useSaunaBookingStore = create((set) => ({
  // Map data from array
  saunaBookings: [],

  /* Data example 
        var saunaBooking = {
            saunaBookingId: string

            bookingPeriod {
                endAt: timestamp
                startFrom: timestamp
            }

            client {
                fullName: string
                uid: string
            }
        }
    */

  addSaunaBooking: async (newSaunaBooking) => {
    try {
      const saunaBookingRef = collection(firestore, "saunaBooking");
      const docRef = doc(saunaBookingRef);

      const saunaBookingData = {
        ...newSaunaBooking,
        saunaBookingId: docRef.id,
      };

      await setDoc(docRef, saunaBookingData);

      set((state) => ({
        saunaBookings: [...state.saunaBookings, saunaBookingData],
      }));

      return {
        Title: "Success",
        Message: "Sauna booking added successfully",
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

  fetchSaunaBookings: async () => {
    try {
      const saunaBookingCollection = collection(firestore, "saunaBooking");
      const saunaBookingSnapshot = await getDocs(saunaBookingCollection);
      const saunaBookingList = saunaBookingSnapshot.docs.map((doc) => ({
        saunaBookingId: doc.id,
        ...doc.data(),
      }));

      set({ saunaBookings: saunaBookingList });

      return {
        Title: "Success",
        Message: "Sauna booking fetched successfully",
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

  deleteSaunaBooking: async (saunaBookingId, userId) => {
    try {
      const saunaBookingRef = collection(firestore, "saunaBooking");
      const saunaQuery = query(
        saunaBookingRef,
        where("saunaBookingId", "==", saunaBookingId)
      );
      const saunaBookingSnapshot = await getDocs(saunaQuery);

      if (saunaBookingSnapshot.empty) {
        return {
          Title: "Error",
          Message: "Booking not found",
          Status: "error",
        };
      }

      const bookingData = saunaBookingSnapshot.docs[0].data();

      // Validate ownership
      if (bookingData.client.uid !== userId) {
        return {
          Title: " Error",
          Message: "You can only modify your own booking",
          Status: "error",
        };
      }

      // Validate time (past bookings cannot be modified)
      if (bookingData.bookingPeriod.startFrom.toMillis() < Date.now()) {
        return {
          Title: "Error",
          Message: "Past booking cannot be modified",
          Status: "error",
        };
      }

      const docRef = doc(firestore, "saunaBooking", saunaBookingId);
      await deleteDoc(docRef);

      set((state) => ({
        saunaBookings: state.saunaBookings.filter(
          (saunaBooking) => saunaBooking.saunaBookingId !== saunaBookingId
        ),
      }));

      return {
        Title: "Success",
        Message: "Delete sauna booking successfully",
        Status: "success",
      };
    } catch (error) {
      return { Title: "Error", Message: error.message, Status: "error" };
    }
  },
}));

export default useSaunaBookingStore;

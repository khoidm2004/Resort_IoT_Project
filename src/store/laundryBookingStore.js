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

const useLaundryBookingStore = create((set) => ({
  // Map data from array
  laundryBookings: [],

  /* Data example 
        var laundryBooking = {
            laundryBookingId: string

            bookingPeriod {
                endAt: timestamp
                startFrom: timestamp
            }

            client {
                fullName: string
                uid: string
            }

            facilities {
                isDryer: boolean
                isWashingMachine: boolean
            }
        }
    */

  addLaundryBooking: async (newLaundryBooking) => {
    try {
      const laundryBookingRef = collection(firestore, "laundryBooking");
      const docRef = doc(laundryBookingRef);

      const laundryBookingData = {
        ...newLaundryBooking,
        laundryBookingId: docRef.id,
      };

      await setDoc(docRef, laundryBookingData);

      set((state) => ({
        laundryBookings: [...state.laundryBookings, laundryBookingData],
      }));

      return {
        Title: "Success",
        Message: "Laundry booking added successfully",
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

  fetchLaundryBookings: async () => {
    try {
      const laundryBookingCollection = collection(firestore, "laundryBooking");
      const laundryBookingSnapshot = await getDocs(laundryBookingCollection);
      const laundryBookingList = laundryBookingSnapshot.docs.map((doc) => ({
        laundryBookingId: doc.id,
        ...doc.data(),
      }));

      set({ laundryBookings: laundryBookingList });

      return {
        Title: "Success",
        Message: "Laundry booking fetched successfully",
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

  deleteLaundryBooking: async (laundryBookingId, userId) => {
    try {
      const laundryBookingRef = collection(firestore, "laundryBooking");
      const laundryQuery = query(
        laundryBookingRef,
        where("laundryBookingId", "==", laundryBookingId)
      );
      const laundryBookingSnapshot = await getDocs(laundryQuery);

      if (laundryBookingSnapshot.empty) {
        return {
          Title: "Error",
          Message: "Booking not found",
          Status: "error",
        };
      }

      const bookingData = laundryBookingSnapshot.docs[0].data();

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

      const docRef = doc(firestore, "laundryBooking", laundryBookingId);
      await deleteDoc(docRef);

      set((state) => ({
        laundryBookings: state.laundryBookings.filter(
          (laundryBooking) =>
            laundryBooking.laundryBookingId !== laundryBookingId
        ),
      }));

      return {
        Title: "Success",
        Message: "Delete laundry booking successfully",
        Status: "success",
      };
    } catch (error) {
      return { Title: "Error", Message: error.message, Status: "error" };
    }
  },
}));

export default useLaundryBookingStore;

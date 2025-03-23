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

const useRoomBookingStore = create((set) => ({
  // Map data from array
  roomBookings: [],

  /* Data example 
        var roomBooking = {
            bookingId: string

            bookingPeriod {
                endAt: timestamp
                startFrom: timestamp
            }

            client {
                fullName: string
                uid: string
            }

            room: string
        }
    */

  addRoomBooking: async (newRoomBooking) => {
    try {
      const roomBookingRef = collection(firestore, "roomBooking");
      const docRef = doc(roomBookingRef);

      const roomBookingData = {
        ...newRoomBooking,
        bookingId: docRef.id,
      };

      await setDoc(docRef, roomBookingData);

      set((state) => ({
        roomBookings: [...state.roomBookings, roomBookingData],
      }));

      return {
        Title: "Success",
        Message: "Room booking added successfully",
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

  fetchRoomBookings: async () => {
    try {
      const roomBookingCollection = collection(firestore, "roomBooking");
      const roomBookingSnapshot = await getDocs(roomBookingCollection);
      const roomBookingList = roomBookingSnapshot.docs.map((doc) => ({
        bookingId: doc.id,
        ...doc.data(),
      }));

      set({ roomBookings: roomBookingList });

      return {
        Title: "Success",
        Message: "Room booking fetched successfully",
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

  deleteRoomBooking: async (roomBookingId, userId) => {
    try {
      const roomBookingRef = collection(firestore, "roomBooking");
      const roomQuery = query(
        roomBookingRef,
        where("bookingId", "==", roomBookingId)
      );
      const roomBookingSnapshot = await getDocs(roomQuery);

      if (roomBookingSnapshot.empty) {
        return {
          Title: "Error",
          Message: "Booking not found",
          Status: "error",
        };
      }

      const bookingData = roomBookingSnapshot.docs[0].data();

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

      const docRef = doc(firestore, "roomBooking", roomBookingId);
      await deleteDoc(docRef);

      set((state) => ({
        roomBookings: state.roomBookings.filter(
          (roomBooking) => roomBooking.bookingId !== roomBookingId
        ),
      }));

      return {
        Title: "Success",
        Message: "Delete Room booking successfully",
        Status: "success",
      };
    } catch (error) {
      return { Title: "Error", Message: error.message, Status: "error" };
    }
  },
}));

export default useRoomBookingStore;

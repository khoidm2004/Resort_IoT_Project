/**
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react-hooks";
import useClientEditProfile from "../../../hooks/EditProfileHooks/useClientEditProfile";
import { firestore } from "../../../firebase/firebase";
import { doc, updateDoc } from "firebase/firestore";
import useAuthStore from "../../../store/authStore";

// Mock Firebase Firestore
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(() => ({})),
  updateDoc: jest.fn(() => new Promise((resolve) => setTimeout(resolve, 10))),
}));

// Mock Firebase instance
jest.mock("../../../firebase/firebase", () => ({
  firestore: jest.fn(),
}));

// Mock Zustand store
jest.mock("../../../store/authStore", () => {
  const mockUser = {
    uid: "test-uid",
    fullName: "Joe Doe",
    phoneNum: "1234567890",
  };
  return jest.fn((selector) =>
    selector({ user: mockUser, setUser: jest.fn() })
  );
});

describe("useClientEditProfile hook", () => {
  let mockSetUser;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks;
    mockSetUser = jest.fn();
    useAuthStore.mockImplementation((selector) =>
      selector({
        user: { uid: "test-uid", fullName: "John Doe", phoneNum: "1234567890" },
        setUser: mockSetUser,
      })
    );
  });

  // Test 1: Hook returns expected properties
  it("1. Should return editProfile function and isUpdating state", () => {
    const { result } = renderHook(() => useClientEditProfile());
    expect(result.current).toHaveProperty("editProfile");
    expect(typeof result.current.editProfile).toBe("function");
    expect(result.current).toHaveProperty("isUpdating");
    expect(result.current.isUpdating).toBe(false);
  });

  // Test 2: Unauthenicated user returns error
  it("2. Should return error when user is not authenicated", async () => {
    useAuthStore.mockImplementation((selector) =>
      selector({ user: null, setUser: mockSetUser })
    );

    const { result } = renderHook(() => useClientEditProfile());

    await act(async () => {
      const response = await result.current.editProfile({
        fullName: "Jane Doe",
        phoneNum: "0987654321",
      });

      expect(response).toEqual({
        Title: "Error",
        Message: "User is not authenicated",
        Status: "error",
      });
    });

    expect(result.current.isUpdating).toBe(false);
  });

  // Test 3: Successful profile update
  it("3. Should update profile successfully and set global state", async () => {
    const { result } = renderHook(() => useClientEditProfile());

    await act(async () => {
      const response = await result.current.editProfile({
        fullName: "John Doe",
        phoneNum: "1234567890",
      });

      expect(doc).toHaveBeenCalledWith(expect.anything(), "users", "test-uid");
      expect(updateDoc).toHaveBeenCalledWith(
        {},
        { uid: "test-uid", fullName: "John Doe", phoneNum: "1234567890" }
      );
      expect(mockSetUser).toHaveBeenCalledWith({
        uid: "test-uid",
        fullName: "John Doe",
        phoneNum: "1234567890",
      });
      expect(response).toEqual({
        Title: "Success",
        Message: "User profile updated successfully",
        Status: "success",
      });
    });

    expect(result.current.isUpdating).toBe(false);
  });

  // Test 4: isUpdating state toggles correctly
  it("4. Should toggle isUpdating state during updating profile process", async () => {
    const { result } = renderHook(() => useClientEditProfile());

    expect(result.current.isUpdating).toBe(false);

    await act(async () => {
      const promise = result.current.editProfile({
        fullName: "John Doe",
      });
      await new Promise((resolve) => setTimeout(resolve, 0)); // Flush microtask queue
      expect(result.current.isUpdating).toBe(true);
      await promise;
    });

    expect(result.current.isUpdating).toBe(false);
  });
});

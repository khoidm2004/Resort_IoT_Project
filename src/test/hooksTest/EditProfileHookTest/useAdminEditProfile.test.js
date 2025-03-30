/**
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react-hooks";
import useAdminEditProfile from "../../../hooks/EditProfileHooks/useAdminEditProfile";
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
  const mockAdminUser = {
    uid: "test-admin-uid",
    fullName: "Admin User",
    phoneNum: "1234567890",
    profileImage: "admin-profile-image",
  };
  return jest.fn((selector) =>
    selector({
      user: mockAdminUser,
      setUser: jest.fn(),
    })
  );
});

// Mock fetch for GG Cloud image upload
global.fetch = jest.fn();

describe("useAdminEditProfile hook", () => {
  let mockSetAdminUser;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetAdminUser = jest.fn();
    useAuthStore.mockImplementation((selector) =>
      selector({
        user: {
          uid: "test-admin-uid",
          fullName: "Admin User",
          phoneNum: "1234567890",
          profileImage: "admin-profile-image",
        },
        setUser: mockSetAdminUser,
      })
    );

    const localStorageMock = {
      store: {},
      getItem: jest.fn(function (key) {
        return this.store[key] || null;
      }),
      setItem: jest.fn(function (key, value) {
        this.store[key] = value.toString();
      }),
      clear: jest.fn(function () {
        this.store = {};
      }),
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });

    // Mock env variables
    process.env.VITE_UPLOAD_IMAGE_GGCLOUD_API = "https://mock-upload-api.com";
    fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("File uploaded successfully: new-image-url"),
    });
  });

  // Test 1: Hook returns expected properties
  it("1. Should return editProfile function and isUpdating state", () => {
    const { result } = renderHook(() => useAdminEditProfile());
    expect(result.current).toHaveProperty("editProfile");
    expect(typeof result.current.editProfile).toBe("function");
    expect(result.current).toHaveProperty("isUpdating");
    expect(result.current.isUpdating).toBe(false);
  });

  // Test 2: Unauthenicated user returns error
  it("2. Should return error when user is not authenicated", async () => {
    useAuthStore.mockImplementation((selector) =>
      selector({ user: null, setUser: mockSetAdminUser })
    );

    const { result } = renderHook(() => useAdminEditProfile());

    await act(async () => {
      const response = await result.current.editProfile(
        { fullName: "Unauthenicated user" },
        "base64-image"
      );
      expect(response).toEqual({
        Title: "Error",
        Message: "User is not authenticated",
        Status: "error",
      });

      expect(result.current.isUpdating).toBe(false);
    });
  });

  // Test 3" Successful update without image upload
  it("3. Should update profile successfully without image upload", async () => {
    const { result } = renderHook(() => useAdminEditProfile());

    await act(async () => {
      const response = await result.current.editProfile(
        {
          fullName: "New Admin",
          phoneNum: "0987654321",
        },
        null
      );

      expect(doc).toHaveBeenCalledWith(
        expect.anything(),
        "users",
        "test-admin-uid"
      );

      expect(updateDoc).toHaveBeenCalledWith(
        {},
        {
          uid: "test-admin-uid",
          fullName: "New Admin",
          phoneNum: "0987654321",
          profileImage: "admin-profile-image",
        }
      );

      expect(mockSetAdminUser).toHaveBeenCalledWith({
        uid: "test-admin-uid",
        fullName: "New Admin",
        phoneNum: "0987654321",
        profileImage: "admin-profile-image",
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "user-info",
        JSON.stringify({
          uid: "test-admin-uid",
          fullName: "New Admin",
          phoneNum: "0987654321",
          profileImage: "admin-profile-image",
        })
      );

      expect(response).toEqual({
        Title: "Success",
        Message: "Edit profile successfully",
        Status: "success",
      });

      expect(result.current.isUpdating).toBe(false);
    });
  });
});

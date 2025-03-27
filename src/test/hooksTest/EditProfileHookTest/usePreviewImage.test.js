/**
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react-hooks";
import usePreviewImage from "../../../hooks/EditProfileHooks/usePreviewImage";

describe("usePreviewImage hoook", () => {
  // Helper function to create mock file
  const createMockFile = (name, size, type) => {
    const mockFile = new File(["mock content"], name, { type });
    Object.defineProperty(mockFile, "size", { value: size, writable: "false" });
    return mockFile;
  };

  // Test 1: Initial state
  it("1. Should initialize with null selectedFile and null error", () => {
    const { result } = renderHook(() => usePreviewImage());
    expect(result.current.selectedFile).toBeNull();
    expect(typeof result.current.handleImageChange).toBe("function");
  });

  // Test 2: Valid image file selection
  it("2. Should set selectedFile  when a valid image is selected", () => {
    const { result } = renderHook(() => usePreviewImage());
    const mockFile = createMockFile("valid.png", 1024 * 1024, "image/png"); // 1MB

    act(() => {
      result.current.handleImageChange({
        target: { files: [mockFile] },
      });
    });

    expect(result.current.selectedFile).toBe(mockFile);
    expect(result.current.error).toBeNull();
  });

  // Test 3: File size exceeds 2MB
  it("3. Should set error when file size exceeds 2MB", () => {
    const { result } = renderHook(() => usePreviewImage());
    const mockFile = createMockFile("large.png", 3 * 1024 * 1024, "image/png"); // 3MB

    act(() => {
      result.current.handleImageChange({
        target: { files: [mockFile] },
      });
    });

    expect(result.current.selectedFile).toBeNull();
    expect(result.current.error).toEqual({
      Title: "Error",
      Message: "File size has to be smaller than 2MB",
      Status: "error",
    });
  });

  // Test 4: Non-image file selection
  it("4. Should reset selectedFile and error when a non-image file is selected", () => {
    const { result } = renderHook(() => usePreviewImage());
    const mockFile = createMockFile("text.txt", 1024 * 1024, "text/plain");

    act(() => {
      result.current.handleImageChange({
        target: { files: [mockFile] },
      });
    });

    expect(result.current.selectedFile).toBeNull();
    expect(result.current.error).toBeNull();
  });

  // Test 5: No file selected
  it("5. Should not change state when no file is selected", () => {
    const { result } = renderHook(() => usePreviewImage());

    act(() => {
      result.current.handleImageChange({
        target: { files: [] },
      });
    });

    expect(result.current.selectedFile).toBeNull();
    expect(result.current.error).toBeNull();
  });

  // Test 6: Multiple files (only the first one should be processed)
  it("6. Should process only the first file when multiple files are selected", () => {
    const { result } = renderHook(() => usePreviewImage());
    const mockImage = createMockFile("test.jpeg", 1024 * 1024, "image/jpeg");
    const mockPdf = createMockFile("test.pdf", 1024 * 1024, "application/pdf");

    act(() => {
      result.current.handleImageChange({
        target: { files: [mockImage, mockPdf] },
      });
    });

    expect(result.current.selectedFile).toBe(mockImage);
    expect(result.current.error).toBeNull();
  });

  // Test 7: Egde case - exact 2MB file
  it("7. Should accept a file exactly 2MB", () => {
    const { result } = renderHook(() => usePreviewImage());
    const mockFile = createMockFile("test.jpg", 2 * 1024 * 1024, "image/jpg"); // 2MB

    act(() => {
      result.current.handleImageChange({
        target: { files: [mockFile] },
      });
    });

    expect(result.current.selectedFile).toBe(mockFile);
    expect(result.current.error).toBeNull();
  });
});

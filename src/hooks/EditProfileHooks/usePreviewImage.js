import { useState } from "react";

/**
 * Custom hook to handle image file selection and validation.
 *
 * This hook allows users to select an image file, validates its type and size (≤ 2MB),
 * and generates a preview in Base64 format. If the file is valid, it is stored in state;
 * otherwise, an error is set.
 *
 * @returns {Object} An object containing the selected file, error state, and handler functions.
 * @property {string | null} selectedFile - The Base64-encoded image preview or null if no file is selected.
 * @property {Object | null} error - An error object containing details if validation fails.
 * @property {string} error.Title - Error title (e.g., "Error").
 * @property {string} error.Message - Error message describing the issue.
 * @property {string} error.Status - Status indicator (e.g., "error").
 * @property {Function} handleImageChange - Function to handle file selection.
 */

const usePreviewImage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const maxFileSize = 2 * 1024 * 1024; // 2MB

  /**
   * Handles file input change event, validates the file, and generates a preview.
   *
   * @param {Event} e - The file input change event.
   */

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > maxFileSize) {
        setSelectedFile(null);
        setError({
          Title: "Error",
          Message: "File size has to be smaller than 2MB",
          Status: "error",
        });
        return;
      }

      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      setError(null);
    }
  };
  return { error, selectedFile, handleImageChange };
};

export default usePreviewImage;

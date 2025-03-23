import { timeStampToTime } from "../../utils/TimeUtils/timestampConverter";

describe("Should convert timestamp to date and time", () => {
  it("1. Should convert a valid timestamp to date and time", () => {
    const input = 1738002299000;
    const result = timeStampToTime(input);
    expect(result).toEqual({ date: "1/27/2025", time: "8:24:59 PM" });
  });

  it("2. Should return error when enter string timestamp", () => {
    const input = "1738002299000";
    const result = timeStampToTime(input);
    expect(result).toEqual({
      Title: "Error",
      Message: "Invalid timestamp",
      Status: "error",
    });
  });

  it("3. Should return error when enter timestamp with less 13 digits", () => {
    const input = 1738002299;
    const result = timeStampToTime(input);
    expect(result).toEqual({
      Title: "Error",
      Message: "Invalid timestamp",
      Status: "error",
    });
  });
});

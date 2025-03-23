import { timeConverter } from "../../utils/TimeUtils/timeConverter";

describe("Should convert date and time to timestamp", () => {
  it("1. Should convert valid date and time to timestamp", () => {
    const input = {
      date: "2025-01-28",
      time: "02:40:41",
    };

    const result = timeConverter(input);
    expect(result).toEqual(1738024841000);
  });

  it("2. Should return error when entered invalid date", () => {
    const input = {
      date: "2025-01-32",
      time: "02:40:41",
    };

    const result = timeConverter(input);
    expect(result).toEqual({
      Title: "Error",
      Message: "Invalid date or time values",
      Status: "error",
    });
  });

  it("3. Should return error when entered invalid date format", () => {
    const input = {
      date: "2025/01/32",
      time: "02:40:41",
    };

    const result = timeConverter(input);
    expect(result).toEqual({
      Title: "Error",
      Message: "Invalid date format",
      Status: "error",
    });
  });

  it("4. Should return error when entered invalid time", () => {
    const input = {
      date: "2025-01-32",
      time: "02:40:99",
    };

    const result = timeConverter(input);
    expect(result).toEqual({
      Title: "Error",
      Message: "Invalid date or time values",
      Status: "error",
    });
  });

  it("5. Should return error when entered invalid time format", () => {
    const input = {
      date: "2025-01-32",
      time: "02-40-41",
    };

    const result = timeConverter(input);
    expect(result).toEqual({
      Title: "Error",
      Message: "Invalid time format",
      Status: "error",
    });
  });
});

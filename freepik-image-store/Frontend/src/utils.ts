import moment from "moment";

export const setLocalStorage = (responseObj) => {
  try {
    if (!responseObj?.expiresIn) {
      throw new Error("Expiration time not provided in response");
    }
    console.log(responseObj.expiresIn);

    const expires = moment().add(parseInt(responseObj.expiresIn), "day");
    console.log(moment);
    console.log(expires);
    console.log(responseObj.user);

    localStorage.setItem("user", responseObj.user);
    localStorage.setItem("token", responseObj.token);
    localStorage.setItem("expires", JSON.stringify(expires.valueOf()));
  } catch (error) {
    console.error("Error setting localStorage:", error.message);
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("expires");
};

export const getExpiration = () => {
  const expiration = localStorage.getItem("expires");

  if (!expiration) {
    return null; // No expiration set
  }

  try {
    const expireAt = JSON.parse(expiration);
    if (typeof expireAt !== "number") {
      throw new Error("Invalid expiration format");
    }
    return moment(expireAt);
  } catch (error) {
    console.error("Error parsing expiration:", error.message);
    return null;
  }
};

export const isLoggedIn = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("No token means not logged in");
    return false;
  }

  const expiration = getExpiration();
  if (!expiration) {
    console.log("No valid expiration means not logged in");
    return false;
  }

  const expiration2 = expiration.utc(); // Ensure expiration is UTC
  const currentTime = moment().utc(); // Ensure current time is UTC
  //   console.log("Current Time (UTC): ", currentTime.format());
  //   console.log("Expiration Time (UTC): ", expiration2.format());

  return currentTime.isBefore(expiration2);
};

export const isHost = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("No token means not logged in");
    return false;
  }

  const expiration = getExpiration();
  if (!expiration) {
    console.log("No valid expiration means not logged in");
    return false;
  }

  const expiration2 = expiration.utc(); // Ensure expiration is UTC
  const currentTime = moment().utc(); // Ensure current time is UTC
  //   console.log("Current Time (UTC): ", currentTime.format());
  //   console.log("Expiration Time (UTC): ", expiration2.format());

  return currentTime.isBefore(expiration2);
};

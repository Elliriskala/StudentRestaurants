import { fetchData } from "./functions";
import { apiUrl } from "./variables";
import { Restaurant } from "./types/Restaurant";
import { User } from "./interfaces/User";

// function to fetch restaurant by ID
const fetchFavouriteRestaurantId = async (
  token: string
): Promise<string | null> => {
  try {
    const userData = await fetchData<User>(apiUrl + "/users/token", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });

    console.log("Fetched user data:", userData);

    // check if user data or favourite restaurant is not found

    if (!userData || !userData.favouriteRestaurant) {
        console.log("Favourite restaurant not found in user data.");
        return null; 
      }
      
      return userData.favouriteRestaurant;
  } catch (error) {
    console.error("Error fetching favourite restaurant ID:", error);
    return null;
  }
};

// function to fetch restaurant by ID
const fetchRestaurantId = async (
  restaurantId: string
): Promise<{ name: string; address: string } | null> => {
  try {
    const restaurantData = await fetchData<{ name: string, address: string}>(apiUrl + `/restaurants/${restaurantId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // returning the name and address of the restaurant
    const { name, address } = restaurantData;
    return { name, address };
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return null;
  }
};

// function to show favourite restaurant
const addFavouriteToDom = async (token: string) => {
  const favouriteRestaurant = document.querySelector(
    "#your-favourite"
  ) as HTMLParagraphElement;

  if (!favouriteRestaurant) {
    console.error("Could not find favourite-paragraph element.");
    return;
  }

  // fetching the favourite restaurant ID
  try {
    const favouriteRestaurantId = await fetchFavouriteRestaurantId(token);

    // if there is no favourite restaurant selected
    if (!favouriteRestaurantId) {
      favouriteRestaurant.textContent = "No favourite restaurant selected.";
      return;
    }

    // fetching the restaurant details
    const restaurantDetails = await fetchRestaurantId(favouriteRestaurantId);

    // if there is no restaurant details
    if (!restaurantDetails) {
      favouriteRestaurant.textContent = "No favourite restaurant selected.";
      return;
    }

    // getting the name and address of the restaurant
    const { name, address } = restaurantDetails;
    favouriteRestaurant.textContent = `${name} - ${address}`;
    console.log("Favourite restaurant:", name, address);

  } catch (error) {
    console.error("Error fetching favourite restaurant:", error);
  }
};

// select the favourite restaurant
const addFavourite = async (token: string, restaurantId: string) => {
  try {
    // setting the favourite restaurant
    const response = await fetchData(apiUrl + "/users", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        favouriteRestaurant: restaurantId,
      }),
    });

    console.log("Favourite restaurant set:", response);

    // adding the favourite restaurant to the DOM
    await addFavouriteToDom(token);
  } catch (error) {
    console.error("Error adding favourite restaurant:", error);
  }
};

// function to select a restaurant

const handleAddFavourite = async (restaurant: Restaurant) => {
  const token = localStorage.getItem("token");

  // if there is no token available, ask user to login
  if (!token) {
    const modal = document.querySelector(
      "#please-login-modal"
    ) as HTMLDialogElement;
    modal.showModal();
    setTimeout(() => {
      modal.close();
    }, 1500);
    return;
  }

  // add the restaurant to the favourites
  await addFavourite(token, restaurant._id);
  console.log("Added to favourites:", restaurant);

  // show the "added as favourite"-success message
  const modal = document.querySelector(
    "#favourite-success-modal"
  ) as HTMLDialogElement;
  const modalContent = document.querySelector(
    "#favourite-success-modal-content"
  ) as HTMLParagraphElement;

  modalContent.textContent = `Restaurant ${restaurant.name} added as favourite!`;
  modal.appendChild(modalContent);
  modal.showModal();
  // close the modal after 2 seconds
  setTimeout(() => {
    modal.close();
  }, 2000);
};

export { handleAddFavourite, addFavouriteToDom };

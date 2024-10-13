import { Restaurant } from "./types/Restaurant";
import mapboxgl from "mapbox-gl/dist/mapbox-gl.js";
import { apiUrl } from "./variables";
import { fetchData } from "./functions";
import { todayModal, weekModal, errorModal } from "./components";
import { handleAddFavourite } from "./favorites";
import { Day, WeeklyMenu } from "./types/Menu";

// map access token
mapboxgl.accessToken =
  "pk.eyJ1IjoiZWxsaW5vcm1ldHJvcG9saWEiLCJhIjoiY20xZjZzbm56MHFxajJtczlybTVmbHc0MyJ9.l94aCqR68sI1_1pJBfWyYg";

// function to initialize the map
const initializeMap = async () => {
  const map = new mapboxgl.Map({
    container: "map-container",
    style: "mapbox://styles/mapbox/outdoors-v11",
    center: [24.9, 60.2],
    zoom: 11.5,
    projection: "globe",
    bearing: -10,
    pitch: 65,
  });
  map.addControl(new mapboxgl.NavigationControl());

  // fetching the restaurants

  try {
    const restaurants = await fetchData<Restaurant[]>(apiUrl + "/restaurants");

    // filtering the restaurants
    const filteredMarkers: mapboxgl.Marker[] = [];
    let closestRestaurant: Restaurant | null = null;
    let closestDistance = Infinity;

    // getting the user's location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLatitude = position.coords.latitude;
        const userLongitude = position.coords.longitude;

        for (const restaurant of restaurants) {
          const [longitude, latitude] = restaurant.location.coordinates;

          if (isNaN(longitude) || isNaN(latitude)) {
            console.error(
              `Invalid coordinates for ${restaurant.name}: [${longitude}, ${latitude}]`
            );
            return;
          }

          // calculating the distance between the user and the restaurant to see the closest one
          const calculateDistance = Math.sqrt(
            (userLatitude - latitude) ** 2 + (userLongitude - longitude) ** 2
          );

          if (calculateDistance < closestDistance) {
            closestDistance = calculateDistance;
            closestRestaurant = restaurant;
          }

          // creating the markers for the restaurants
          if (closestRestaurant !== restaurant) {
            const markerElement = document.createElement("div");
            markerElement.className = "custom-marker";

            // creating the marker
            const marker = new mapboxgl.Marker({
              element: markerElement,
            }).setLngLat([longitude, latitude]);

            // creating the popup for the marker
            initializePopup(restaurant, marker);
            marker.addTo(map);
            filteredMarkers.push(marker);
          }
        }

        // adding the closest restaurant to the map
        if (closestRestaurant) {
          const [longitude, latitude] = closestRestaurant.location.coordinates;

          const closestMarkerElement = document.createElement(
            "div"
          ) as HTMLDivElement;
          closestMarkerElement.className = "custom-marker closest";

          const closestMarker = new mapboxgl.Marker({
            element: closestMarkerElement,
          }).setLngLat([longitude, latitude]);

          // displaying the closest restaurant
          initializePopup(closestRestaurant, closestMarker);
          closestMarker.addTo(map);

          map.flyTo({
            center: [longitude, latitude],
            zoom: 12,
            essential: true,
          });
        }

        // filtering the restaurants
        filterRestaurants(restaurants, map, filteredMarkers);
      },
      (error) => {
        console.error("Error getting location", error);
      }
    );
  } catch (error) {
    console.error("Failed to fetch restaurants", error);
  }

  return map;
};

// buttons for filtering
const filterRestaurants = (
  restaurants: Restaurant[],
  map: mapboxgl.Map,
  filteredMarkers: mapboxgl.Marker[]
) => {
  const sodexoBtn = document.querySelector("#sodexo");
  const compassBtn = document.querySelector("#compass");
  const resetBtn = document.querySelector("#reset");

  if (!sodexoBtn || !compassBtn || !resetBtn) {
    console.log("Button element was not found in HTML!");
    return;
  }

  // function to reset the markers
  const resetMarkers = (filteredRestaurants: Restaurant[]) => {
    filteredMarkers.forEach((marker, index) => {
      const restaurant = restaurants[index];

      // checking if the restaurant is in the filtered list
      if (filteredRestaurants.includes(restaurant)) {
        marker.addTo(map);
      } else {
        marker.remove();
      }
    });
  };

  // event listeners for the buttons tp filter the restaurants
  sodexoBtn.addEventListener("click", () => {
    const sodexoRestaurants = restaurants.filter(
      (restaurant) => restaurant.company === "Sodexo"
    );
    resetMarkers(sodexoRestaurants);
  });

  compassBtn.addEventListener("click", () => {
    const compassRestaurants = restaurants.filter(
      (restaurant) => restaurant.company === "Compass Group"
    );
    resetMarkers(compassRestaurants);
  });

  resetBtn.addEventListener("click", () => {
    resetMarkers(restaurants);
  });
};

// function to initialize the popup for the restaurants
const initializePopup = (restaurant: Restaurant, marker: mapboxgl.Marker) => {
  const popUpPlaceholder = document.createElement("div") as HTMLDivElement;
  popUpPlaceholder.classList.add("popup");

  const companyName = document.createElement("h2") as HTMLHeadingElement;
  companyName.innerText = `${restaurant.name} - ${restaurant.company}`;

  popUpPlaceholder.appendChild(companyName);

  const companyAddress = document.createElement("p") as HTMLParagraphElement;
  companyAddress.innerText = `${restaurant.address}, ${restaurant.postalCode} ${restaurant.city}`;

  popUpPlaceholder.appendChild(companyAddress);

  const companyPhone = document.createElement("p") as HTMLParagraphElement;
  companyPhone.innerText = `${
    restaurant.phone && restaurant.phone.trim() !== "-"
      ? restaurant.phone
      : "No phone number"
  }`;

  popUpPlaceholder.appendChild(companyPhone);

  const popUpbuttons = document.createElement("div") as HTMLDivElement;
  popUpbuttons.classList.add("popup-buttons");
  const buttonUL = document.createElement("ul") as HTMLUListElement;
  const todayButtonLI = document.createElement("li") as HTMLLIElement;
  const weekButtonLI = document.createElement("li") as HTMLLIElement;

  // setting the buttons for the today's and week's menu
  
  const todayButton = document.createElement("a") as HTMLAnchorElement;
  todayButton.href = `/restaurants/daily/${restaurant._id}/fi`;
  todayButton.innerText = "Today's menu";
  
  // event listener for the today's menu button
  todayButton.addEventListener("click", (event) => {
    event.preventDefault();
    showTodaymenu([restaurant]);
  });

  const weekButton = document.createElement("a") as HTMLAnchorElement;
  weekButton.href = `/restaurants/weekly/${restaurant._id}/fi`;
  weekButton.innerText = "Week's menu";

  // event listener for the week's menu button

  weekButton.addEventListener("click", (event) => {
    event.preventDefault();
    showWeekmenu([restaurant]);
  });

  // creating the favourite button
  const favouriteDiv = document.createElement("div") as HTMLDivElement;
  favouriteDiv.classList.add("favourite-restaurant");

  const favouriteButton = document.createElement("button") as HTMLButtonElement;

  favouriteButton.innerText = "Add as favourite";

  // event listener for the favourite button

  favouriteButton.addEventListener("click", async () => { 
    try {
      // calling the function to add the restaurant as favourite
      await handleAddFavourite(restaurant);
      console.log(restaurant);

    } catch (error) {
      console.error("Error adding favourite:", error);
    }
  });
  
  // adding classes to the buttons and appending them to the popup
  todayButton.classList.add("popup-button");
  weekButton.classList.add("popup-button");
  favouriteButton.classList.add("favourite-button");

  todayButtonLI.appendChild(todayButton);
  weekButtonLI.appendChild(weekButton);
  buttonUL.appendChild(todayButtonLI).after(weekButtonLI);
  favouriteDiv.appendChild(favouriteButton);
  popUpbuttons.appendChild(buttonUL);
  popUpbuttons.appendChild(favouriteDiv);
  popUpPlaceholder.appendChild(popUpbuttons);

  const popUp = new mapboxgl.Popup().setDOMContent(popUpPlaceholder);

  marker.setPopup(popUp);
};

// function to show the today's menu
const showTodaymenu = (restaurants: Restaurant[]) => {
  const modal = document.querySelector("#today-menu") as HTMLDialogElement;
  if (!modal) {
    throw new Error("Modal not found");
  }
  modal.addEventListener("click", () => {
    modal.close();
  });

  const table = document.createElement("table") as HTMLTableElement;

  modal.innerHTML = "";

  table.innerHTML = "";
  // iterating over the restaurants to get the menu
  restaurants.forEach(async (restaurant) => {
    try {
      const menu = await fetchData<Day>(
        apiUrl + `/restaurants/daily/${restaurant._id}/fi`
      );
      console.log(menu);

      // creating the modal for the today's menu
      const menuHtml = await todayModal(menu);
      modal.insertAdjacentHTML("beforeend", menuHtml);

      // displaying the modal
      modal.showModal();
    } catch (error) {
      modal.innerHTML = errorModal((error as Error).message);
      modal.showModal();
    }
  });
};

// function to show the week's menu
const showWeekmenu = (restaurants: Restaurant[]) => {
  const modal = document.querySelector("#week-menu") as HTMLDialogElement;
  if (!modal) {
    throw new Error("Modal not found");
  }
  modal.addEventListener("click", () => {
    modal.close();
  });

  // creating the table for the week's menu and displaying it
  const table = document.createElement("table") as HTMLTableElement;

  modal.innerHTML = "";

  table.innerHTML = "";
  restaurants.forEach(async (restaurant) => {
    try {
      const menu = await fetchData<WeeklyMenu>(
        apiUrl + `/restaurants/weekly/${restaurant._id}/fi`
      );
      console.log(menu);

      const menuHtml = await weekModal(menu);
      modal.insertAdjacentHTML("beforeend", menuHtml);

      modal.showModal();
    } catch (error) {
      modal.innerHTML = errorModal((error as Error).message);
      modal.showModal();
    }
  });
};

export { initializeMap };

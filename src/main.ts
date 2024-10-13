import { initializeMap } from "./map";
import { LoginUser, User } from "./interfaces/User";
import { apiUrl } from "./variables";
import { fetchData } from "./functions";
import { addFavouriteToDom } from "./favorites";


// function to display error message
const newError = (message: string): void => {
  alert(message);
  console.error(message);
};

const checkbox = document.getElementById("checkbox");

// function to toggle light mode
const toggleLight = () => {
  document.body.classList.toggle("light");
  document.documentElement.classList.toggle("light");
  
  const body = document.querySelector("body");
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");
  const main = document.querySelector("main");
  const dialog = document.querySelector(".menu-dialog");
  
  if (body && header && footer && main && dialog) {
    body.classList.toggle("light-mode");
    header.classList.toggle("light-mode");
    footer.classList.toggle("light-mode");
    main.classList.toggle("light-mode");
    dialog.classList.toggle("light-mode");
  }

  // saving the selected theme to local storage
  const selectedTheme = document.body.classList.contains("light-mode");
  localStorage.setItem("theme", selectedTheme ? "light" : "dark");
};

// checking the checkbox element and adding an event listener to it
if (checkbox) {
  checkbox.addEventListener("change", () => {
    toggleLight();
  });
}

// function to check the local storage for the selected theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.body.classList.add("light");
  document.documentElement.classList.add("light");
  if (checkbox) {
    (checkbox as HTMLInputElement).checked = true;
  }
} else {
  document.body.classList.remove("light");
  document.documentElement.classList.remove("light");
  if (checkbox) {
    (checkbox as HTMLInputElement).checked = false;
  }
}

// handling login form
const handleLogin = async (evt: Event): Promise<void> => {
  evt.preventDefault();
  
  const loginUsernameInput = document.querySelector(
    ".username-login"
  ) as HTMLInputElement | null;
  const loginPasswordInput = document.querySelector(
    ".password-login"
  ) as HTMLInputElement | null;
  
  if (!loginUsernameInput || !loginPasswordInput) {
    newError("Element not found");
    return;
  }
    
  const username = loginUsernameInput.value;
  const password = loginPasswordInput.value;

  // fetching the login data from the API
  try {
    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    };

    const result = await fetchData<LoginUser>(apiUrl + "/auth/login", options);
    console.log(result);

    // if the login is successful, save the token to local storage

    if (result.token) {
      localStorage.setItem("token", result.token);
      closeLoginDialog();
      showLoginSuccessDialog();
      await checkToken();
    }
  } catch {
    newError('Login failed, check your username and password');
  }
};

// handling register form
const handleRegister = async (evt: Event): Promise<void> => {
  evt.preventDefault();
  
  const registerUsernameInput = document.querySelector(
    "#username-register"
  ) as HTMLInputElement | null;
  const registerPasswordInput = document.querySelector(
    "#password-register"
  ) as HTMLInputElement | null;
  const registerEmailInput = document.querySelector("#email-register") as HTMLInputElement | null;
  
  if (!registerUsernameInput || !registerEmailInput ||!registerPasswordInput) {
    newError("Element not found");
    return;
  }
  
  const username = registerUsernameInput.value;
  const email = registerEmailInput.value;
  const password = registerPasswordInput.value;

  // fetching the register data from the API
  
  try {
    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    };
  
    const result = await fetchData<User>(apiUrl + "/users", options);
    console.log(result);

    const registerForm = document.querySelector("#register-form") as HTMLFormElement | null;
      if (registerForm) {
        registerForm.reset();
      }
    
    if (result) {
      closeLoginDialog();
      showRegistersuccessDialog();

      const loginOptions: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }), 
      };

      const loginResult = await fetchData<LoginUser>(apiUrl + "/auth/login", loginOptions);
      if (loginResult.token) {
        localStorage.setItem("token", loginResult.token);
        await checkToken(); 
      }
    }

  } catch (error) {
    newError((error as Error).message);
  }
};

// function to close the login dialog
const closeLoginDialog = (): void => {
  const loginDialog = document.querySelector(".login-dialog") as HTMLDialogElement | null;
  if (!loginDialog) {
    newError("Element not found");
    return;
  }
  loginDialog.close();
}

// function to show the login success dialog
const showLoginSuccessDialog = (): void => {
  const loginSuccess = document.querySelector(".login-success") as HTMLDialogElement | null;
  if (!loginSuccess) {
    newError("Element not found");
    return;
  }
  loginSuccess.showModal();
}

// function to show the register success dialog
const showRegistersuccessDialog = (): void => {
  const registerSuccess = document.querySelector(".register-success") as HTMLDialogElement | null;
  if (!registerSuccess) {
    newError("Element not found");
    return;
  }
  registerSuccess.showModal();

}

// event listeners for the login and register forms
const loginEventListeners = (): void => {
  const registerForm = document.querySelector("#register-form") as HTMLFormElement;
  const loginForm = document.querySelector(".login-form") as HTMLFormElement;
  const loginButton = document.querySelector("#login") as HTMLButtonElement;
  const loginCloseButton = document.querySelector("#close") as HTMLButtonElement;

  // event listener for the login button

  if (loginButton) {
    loginButton.addEventListener("click", ()  => {
      const loginDialog = document.querySelector(".login-dialog") as HTMLDialogElement;
      loginDialog.showModal();
    });
  }

  if (loginCloseButton) {
    loginCloseButton.addEventListener("click", closeLoginDialog);
  }
 
  // event listener for the login form
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // event listener for the register form
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }
};

// function to check local storage for token and if it exists fetch
// userdata with getUserData then update the DOM with addUserDataToDom

const checkToken = async (): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('No token found. Please login.');
    return;
  }

  const user = await getUserData(token);
  addUserDataToDom(user);
  addFavouriteToDom(token);
};

// display user info in the userpage
const addUserDataToDom = (user: User): void => {
  const usernameTarget = document.querySelector("#your-username") as HTMLSpanElement | null;

  const emailTarget = document.querySelector("#your-email") as HTMLSpanElement | null;

  if (!usernameTarget || !emailTarget) {
    newError('Failed to update profile elements');
    return;
  }

  // adding the userdata to the DOM

  emailTarget.innerText = user.email;
  usernameTarget.innerText = user.username;
};

// function to get userdata from API using token
const getUserData = async (token: string): Promise<User> => {
  const options: RequestInit = {
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  // fetching the userdata from the API
  return await fetchData<User>(apiUrl + '/users/token', options);
};

// logout button

const loggingOut = () => {
  const logoutButton = document.querySelector(
    '#logout'
  ) as HTMLButtonElement | null;

  // event listener for the logout button
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('token');

      const displayUserInfo = document.querySelector(".user-info") as HTMLDialogElement;

      displayUserInfo.close();

      // clearing the user data from the DOM
      const usernameTarget = document.querySelector("#your-username") as HTMLSpanElement | null;
      const emailTarget = document.querySelector("#your-email") as HTMLSpanElement | null;

      const favouriteRestaurant = document.querySelector(
        "#your-favourite"
      ) as HTMLParagraphElement;
      
      if (!emailTarget || !usernameTarget) {
        return;
      }

      emailTarget.innerText = '';
      usernameTarget.innerText = '';
      favouriteRestaurant.innerText = '';

      // clearing the login form

      const loginForm = document.querySelector(".login-form") as HTMLFormElement;
      if (loginForm) {
        loginForm.reset();
      }

      console.log('User logged out');
    });
  }
};

// function to display the success dialogs
const displaySuccessDialogs = () => {

  const loginSuccessClose = document.querySelector("#login-close") as HTMLButtonElement;
  const registerSuccessClose = document.querySelector("#register-close") as HTMLButtonElement;
  const loginSuccess = document.querySelector(".login-success") as HTMLDialogElement;
  const registerSuccess = document.querySelector(".register-success") as HTMLDialogElement;

  if (loginSuccessClose) {
    loginSuccessClose.addEventListener("click", () => {
      loginSuccess.close();
    });
  }
  
  if (registerSuccessClose) {
    registerSuccessClose.addEventListener("click", () => {
      registerSuccess.close();
    });
  }
};

// function to display the user page

const displayUserPage = () => {

  const userInfoButton = document.querySelector("#user-page") as HTMLButtonElement;
  const displayUserInfo = document.querySelector(".user-info") as HTMLDialogElement;
  const userPageCloseButton = document.querySelector("#close-user-info") as HTMLDivElement;

  // event listener for the user page button
  if (userInfoButton) {
    userInfoButton.addEventListener("click", async () => {
      displayUserInfo.showModal();
    });
  }

  if (userPageCloseButton) {
    userPageCloseButton.addEventListener("click", () => {
      displayUserInfo.close();
   });
  }
};

// function to check if the user is logged in
const checkLogin = () => {
  const token = localStorage.getItem('token');
  return !!token;
}

// running the app
const runApp = (): void => {
  displayUserPage();
  displaySuccessDialogs();
  loggingOut();
  loginEventListeners();
  checkToken();
  initializeMap();

  console.log("App started");
}

document.addEventListener("DOMContentLoaded", () => {
  runApp()
});

// event listener for the modal dialog
const modal = document.querySelector(".menu-dialog") as HTMLDialogElement | null;
if (!modal) {
  throw new Error("Modal not found");
}
modal.addEventListener("click", () => {
  modal.close();
});


export { checkLogin, getUserData, checkToken };
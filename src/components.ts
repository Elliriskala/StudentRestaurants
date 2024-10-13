import { WeeklyMenu, Day} from "./types/Menu";

// Function to create the modal for the today's menu
const todayModal = async (menu: Day) => {
  let html = `
    <table>
      <h2>Today's menu</h2>
      <tr>
        <th>Course</th>
        <th>Diet</th>
        <th>Price</th>
      </tr>
    `;

  // checking if there is courses in the menu
  if (menu.courses.length === 0) {
    return 'No menu available for today';
  }

  // Iterating over the courses to create the table
  menu.courses.forEach((course) => {
    const {name, diets, price} = course;
    html += `
          <tr>
            <td>${name}</td>
            <td>${diets ?? ' - '}</td>
            <td>${price ?? ' - '}</td>
          </tr>
          `;
  });
  html += '</table>';
  return html;
};

// function to create the modal for the weekly menu
const weekModal = async (menu: WeeklyMenu) => {

  let html = `
    <table>
      <h2>This week's menu</h2>
      `;
  
  // checking if there is courses to display in the menu
  if (menu.days.length === 0) {
    return 'No menu available for this week';
  }

  // Iterating over the days to create the table
  menu.days.forEach((day: Day) => {
    const {courses} = day;
    html += `
      <tr>
        <th <style class="date"</style>${day.date}</th>
      </tr>
      <tr>
        <th>Course</th>
        <th>Diet</th>
        <th>Price</th>
      </tr>
    `;

    courses.forEach((course) => {
      const {name, diets, price} = course;
      html += `
          <tr>
          <td>${name}</td>
          <td>${diets ?? ' - '}</td>
          <td>${price ?? ' - '}</td>
        </tr>
        `;
    });
  });
  html += '</table>'
  return html;
};

// function to create the modal for the error message
const errorModal = (message: string) => {
  const html = `
        <h3>Error</h3>
        <p>${message}</p>
        `;
  return html;
};

export {todayModal, weekModal, errorModal};
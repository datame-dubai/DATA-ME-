const API_URL = "https://script.google.com/macros/s/AKfycbz7xuH6DxJCcfjLYBpQmZcoMPDe7x7jhjtpXwX0vNOPdril15gI_wQ-lMZg7RNhOnnb/exec";

const mealSession = document.getElementById("mealSession");
const cuisineType = document.getElementById("cuisineType");
const teamMember = document.getElementById("teamMember");
const location = document.getElementById("location");
const mealDate = document.getElementById("mealDate");
const menuItemsContainer = document.getElementById("menuItemsContainer");
const paxCount = document.getElementById("paxCount");
const submitBtn = document.getElementById("submitBtn");

let fullMenu = [];

async function fetchData() {
  const res = await fetch(API_URL);
  const data = await res.json();

  // Meal sessions
  mealSession.innerHTML = [...new Set(data.menu.map(row => row[0]))]
    .map(s => `<option value="${s}">${s}</option>`).join("");

  // Cuisine types
  updateCuisine();

  // Team members
  teamMember.innerHTML = data.supervisors.map(name => `<option value="${name}">${name}</option>`).join("");

  // Locations
  location.innerHTML = data.locations.map(loc => `<option value="${loc}">${loc}</option>`).join("");

  fullMenu = data.menu;
}

function updateCuisine() {
  const selectedSession = mealSession.value;
  const cuisines = [...new Set(fullMenu.filter(row => row[0] === selectedSession).map(row => row[1]))];
  cuisineType.innerHTML = cuisines.map(c => `<option value="${c}">${c}</option>`).join("");
  updateMenuItems();
}

function updateMenuItems() {
  const session = mealSession.value;
  const cuisine = cuisineType.value;
  const filtered = fullMenu.filter(row => row[0] === session && row[1] === cuisine);

  menuItemsContainer.innerHTML = filtered.map(item => `
    <div class="menu-row">
      <label>${item[2]} (${item[3]}):</label>
      <input type="number" placeholder="Qty" data-item="${item[2]}" class="qty" />
      <input type="number" placeholder="cm" class="cm" />
    </div>
  `).join("");
}

submitBtn.addEventListener("click", async () => {
  const order = [];
  const qtyInputs = document.querySelectorAll(".qty");

  qtyInputs.forEach((qtyInput, i) => {
    const cmInput = document.querySelectorAll(".cm")[i];
    if (qtyInput.value || cmInput.value) {
      order.push({
        item: qtyInput.dataset.item,
        quantity: qtyInput.value,
        centimeters: cmInput.value
      });
    }
  });

  const payload = {
    name: teamMember.value,
    location: location.value,
    date: mealDate.value,
    session: mealSession.value,
    cuisine: cuisineType.value,
    pax: paxCount.value,
    order
  };

  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" }
  });

  alert("Order submitted!");
});

mealSession.addEventListener("change", updateCuisine);
cuisineType.addEventListener("change", updateMenuItems);

fetchData();

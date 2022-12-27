// the system we are using for storing the data
// localstorage or cookie
let storageSystem = "ls";

// add event listener for toggling between storage systems
document.querySelector(".toggle-btn").addEventListener("click", (e) => {
  e.preventDefault();
  if (storageSystem === "ls") {
    storageSystem = "ck";
  } else {
    storageSystem = "ls";
  }
  document.querySelector("#storage").textContent =
    storageSystem === "ls" ? "Local storage" : "cookie";
});

// The function for getting key value pairs and setting cookie on browser
// also stringify the object passed
function setCookie(name, value, days = 10) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie =
    name + "=" + (JSON.stringify(value) || "") + expires + "; path=/";
}

//get the cookie set on browser and parse the object before
function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0)
      return JSON.parse(c.substring(nameEQ.length, c.length));
  }
  return null;
}

//set an key value item on localstorage
const LSSet = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};
//get key value for key passed
const LSGet = (key) => {
  return JSON.parse(localStorage.getItem(key));
};

//add eventlistner for the click button form submit
document.querySelector(".form-element").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.querySelector(".input").value;

  //check if former data available
  const dataObj =
    storageSystem === "ls" ? LSGet(username) : getCookie(username);
  if (dataObj) {
    document.querySelector(".alert").classList.add("alert_hidden");
    const { avatar_url, name, location, email, bio: _bio } = dataObj;
    const bio = _bio || "";
    document.getElementById("bio").innerHTML =
      bio.replace(/(?:\r\n|\r|\n)/g, "<br>") || "-";
    document.getElementById("name").textContent = name || "-";
    document.getElementById("location").textContent = location || "-";
    document.getElementById("email").textContent = email || "-";
    document
      .querySelector(".img")
      .setAttribute("src", avatar_url || "./img/portrait.jpg");
  } else {
    //if not available we should fetch it
    fetch(`https://api.github.com/users/${username}`)
      .catch((e) => {
        // network error handling
        document.querySelector(".alert").classList.remove("alert_hidden");
        document.querySelector(".alert").textContent = "Network problem!";
      })
      .then((r) => (r.status !== 404 ? r.json() : "problem"))
      .then((response) => {
        //check if username not available
        if (response === "problem") {
          document.querySelector(".alert").classList.remove("alert_hidden");
          document.querySelector(".alert").textContent = "ID not found!";
        } else {
          //username available
          document.querySelector(".alert").classList.add("alert_hidden");
          const { avatar_url, name, location, email, bio: _bio } = response;
          // if bio is null pass "" (empty string) for .replace not error
          const bio = _bio || "";
          document.getElementById("bio").innerHTML =
            bio.replace(/(?:\r\n|\r|\n)/g, "<br>") || "-";
          document.getElementById("name").textContent = name || "-";
          document.getElementById("location").textContent = location || "-";
          document.getElementById("email").textContent = email || "-";
          document
            .querySelector(".img")
            .setAttribute("src", avatar_url || "./img/portrait.jpg");

          storageSystem === "ls"
            ? LSSet(username, response)
            : setCookie(username, response);
        }
      });
  }
});

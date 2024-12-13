// Recuperar datos del localStorage
const username = localStorage.getItem("username");
const userEmail = localStorage.getItem("email");
const userRole = localStorage.getItem("rol");
const userId = localStorage.getItem("user_id");
const userToken = localStorage.getItem("token");

// Mostrar los datos en la página
document.getElementById("username").textContent = username || "No disponible";
document.getElementById("userEmail").textContent = userEmail || "No disponible";
document.getElementById("userRole").textContent = userRole || "No disponible";
document.getElementById("userId").textContent = userId || "No disponible";
document.getElementById("userToken").textContent = userToken || "No disponible";

// Agregar funcionalidad de cierre de sesión
document.getElementById("logoutButton").addEventListener("click", function () {
  // Limpiar el localStorage
  localStorage.clear();
  // Redirigir a la página de inicio de sesión o donde quieras
  window.location.href = "./../login/index.html"; // Cambia esto a la URL de inicio de sesión
});

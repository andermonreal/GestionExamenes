window.onload = function () {
  rol = localStorage.getItem("rol");
  if (rol === "0") {
    // admin
    window.location.href = "./../admin/index.html";
  } else if (rol === "1") {
    // usuario
    window.location.href = "./../student/index.html";
  } else if (rol === "2") {
    // profesor
    window.location.href = "./../professor/index.html";
  }
};

document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    document.getElementById("message").textContent = " ";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const hashedPassword = CryptoJS.MD5(password).toString();

    const payload = {
      email: email,
      password: hashedPassword,
    };

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        document.getElementById("message").textContent = "Bienvenido";
        document.getElementById("message").classList.remove("errorMSG");

        // Guardar email en localStorage para usarlo en la verificación del pin
        localStorage.setItem("email", email);

        // Mostrar el pop-up de verificación de pin
        document.getElementById("pinPopup").style.display = "flex";
      } else {
        document.getElementById("message").textContent =
          "Usuario o contraseña incorrecto";
        document.getElementById("message").classList.add("errorMSG");
      }
    } catch (error) {
      document.getElementById("message").textContent =
        "[!] - Error en la conexión con el servidor";
      document.getElementById("message").classList.add("errorMSG");
    }
  });

// Evento para el botón de verificar pin
document
  .getElementById("verifyPinButton")
  .addEventListener("click", async function () {
    const pin = document.getElementById("pin").value;
    const email = localStorage.getItem("email");

    try {
      const response = await fetch("http://localhost:3000/api/auth/verifyPin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, pin }),
      });

      const result = await response.json();

      if (response.ok) {
        // Guardar la información del usuario y redirigir según el rol
        localStorage.setItem("username", result.user.nombre);
        localStorage.setItem("email", result.user.email);
        localStorage.setItem("rol", result.user.rol);
        localStorage.setItem("user_id", result.user.usuario_id);
        localStorage.setItem("token", result.user.token);

        if (result.user.rol === 0) {
          window.location.href = "./../admin/index.html";
        } else if (result.user.rol === 1) {
          window.location.href = "./../student/index.html";
        } else if (result.user.rol === 2) {
          window.location.href = "./../professor/index.html";
        }
      } else {
        document.getElementById("pinMessage").textContent =
          "Código de verificación incorrecto";
        document.getElementById("pinMessage").classList.add("errorMSG");
      }
    } catch (error) {
      document.getElementById("pinMessage").textContent =
        "[!] - Error en la conexión con el servidor";
      document.getElementById("pinMessage").classList.add("errorMSG");
    }
  });

window.onload = function () {
  rol = localStorage.getItem("rol");
  if (rol === "0") {
    // admin
    window.location.href = "./../admin/index.html";
  } else if (rol === "1") {
    // usuario
    window.location.href = "./../stundent/index.html";
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

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const repassword = document.getElementById("repassword").value.trim();

    // Hashear la contraseña con MD5 usando CryptoJS
    const hashedPassword = CryptoJS.MD5(password).toString();
    const rehashedPassword = CryptoJS.MD5(repassword).toString();

    // Verificar que las contraseñas sean las mismas
    if (hashedPassword != rehashedPassword) {
      document.getElementById("message").textContent =
        "Las contraseñas no coinciden";
    } else {
      // Crear el cuerpo de la petición
      const payload = {
        username: username,
        email: email,
        password: hashedPassword,
      };

      try {
        // Realizar la petición a la API
        const response = await fetch("http://localhost:3000/api/auth/signUp", {
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

          localStorage.setItem("username", result.user.nombre);
          localStorage.setItem("email", result.user.email);
          localStorage.setItem("rol", result.user.rol);
          localStorage.setItem("user_id", result.user.usuario_id);
          localStorage.setItem("token", result.user.token);

          if (result.user.rol === 0) {
            // admin
            window.location.href = "./../admin/index.html";
          } else if (result.user.rol === 1) {
            // usuario
            window.location.href = "./../student/index.html";
          } else if (result.user.rol === 2) {
            // profesor
            window.location.href = "./../professor/index.html";
          }
        } else {
          document.getElementById("message").textContent =
            "Error al crear el usuario";
          document.getElementById("message").classList.add("errorMSG");
        }
      } catch (error) {
        document.getElementById("message").textContent =
          "[!] - Error en la conexión con el servidor";
        document.getElementById("message").classList.add("errorMSG");
      }
    }
  });

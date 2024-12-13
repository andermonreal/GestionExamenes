<div align="center">
<h1>UPNA TESTER</h1></br>
<h3>Proyecto de 4º de carrera de Ingeniería Informnática de la UPNA para la asignatura de "Gestión de Proyectos Informáticos I"</h3></br></br>
  <table>
    <tr>
    <td>
        <img src="https://seeklogo.com/images/S/supabase-logo-DCC676FFE2-seeklogo.com.png" width="200"/>
      </td>
      <td>
        <img src="https://ocubom.page/es/post/escudo-informatica/seal-etsiinf.svg" width="200"/>
      </td>
      <td>
        <img src="https://static-00.iconduck.com/assets.00/node-js-icon-454x512-nztofx17.png" width="200"/>
      </td>
    </tr>      
  </table>

</br>
</br>
</br>
   <h1 margin=200px>MIEMBROS DEL EQUIPO</h1>
</br>
   <table>
    <tr>
      <td style="text-align: center;">
        <a href="https://github.com/amlndz">
          <img src="https://github.com/amlndz.png?size=100" alt="amlndz" width="100" height="100" style="border-radius: 50%;"/>
        </a>
        <br />
        <a href="https://github.com/amlndz">@amlndz</a>
        <p>Alejandro Meléndez</p>
      </td>
      <td style="text-align: center;">
        <a href="https://github.com/andermonreal ">
          <img src="https://github.com/andermonreal.png?size=100" alt="andermonreal" width="100" height="100" style="border-radius: 50%;"/>
        </a>
        <br />
        <a href="https://github.com/andermonreal">@andermonreal </a>
        <p>Ander Monreal</p>
      </td>
      <td style="text-align: center;">
        <a href="https://github.com/mellado149322">
          <img src="https://github.com/mellado149322.png?size=100" alt="mellado149322" width="100" height="100" style="border-radius: 50%;"/>
        </a>
        <br />
        <a href="https://github.com/mellado149322">@mellado149322</a>
        <p>Iñaki Mellado</p>
      </td>
      <td style="text-align: center;">
        <a href="https://github.com/WADEBER">
          <img src="https://github.com/WADEBER.png?size=100" alt="WADEBER" width="100" height="100" style="border-radius: 50%;"/>
        </a>
        <br />
        <a href="https://github.com/WADEBER">@WADEBER</a>
        <p>Diego Liébana</p>
      </td>
    </tr>
  </table>
  </br>
</br>
</div>

## FORMAS DE EJECUTAR

#### EJECUTAR COMO APLICACION LANZANDO DESDE TERMINAL

Desde el directorio principal lanzamos tanto la API como la vista con el siguiente comando:

> npm start

#### CREAR Y LANZAR APLICACION DE ESCRITORIO (SOLO WINDOWS)

Desde el directorio principal debemos ejecutar el comando:

> npm run build

Este comando nos generaráa una carpeta "dist" a la cual deberemos acceder.
En esta carpeta veremos un .exe el cual si presionamos dos veces generara la versión de escritorio de este proyecto.

#### EJECUTAR API EN LOCAL

Se puede ejecutar unicamente la API desde una terminal por si queremos probar los checkpoints en postman. Para ello ejecutamos:

> node app.js

##### EJECUTAR PAGINA EN LOCAL

Recomendable installar en el VScode la extension de liveServer y ejecutar desde ahi

---

---

---

---

# VISUALIZACION RAPIDA DE LA WEB

> VENTANA LOGIN
> ![foto login](./readme/login.png) ![foto login](./readme/login2.png)

---

---

> VENTANA SING UP
> ![foto signUp](./readme/singUp.png)

---

---

> PANEL ADMINISTRADOR
> ![foto admin](./readme/admin.png) ![foto admin busqueda](./readme/admin2.png) ![foto admin edicion](./readme/admin3.png)

---

---

---

# API

Lista de End Points:

---

---

### AUTH

> api/auth/login
> -----> +email, +password

> api/auth/singUp
> -----> +username, +email, +password

---

---

### ADMIN

> api/admin/listUsers
> -----> +token

> api/admin/checkAdmin
> -----> +token

> api/admin/getUser
> -----> +token, +identificador

> api/admin/modifyUser
> -----> +token, +usuario ({})

> api/admin/deleteUser
> -----> +token, +usuario_id

---

---

### PROFESOR

> api/professor/checkProfessor
> -----> +token

> api/professor/createExam
> -----> +token, +examen ({})

> api/professor/deleteExam
> -----> +token, +identificador

> api/professor/getListExams
> -----> +token

> api/professor/createQuestion
> -----> +token, +pregunta ({})

> api/professor/getListQuestions
> -----> +token

> api/professor/assignQuestToExam
> -----> +token, +pregunta_id, +examen_id

> api/professor/createNewGroup
> -----> +token, +nombre

> api/professor/addStudentsToGroup
> -----> +token, +grupo_id, +alumno_id ([{ "alumno_id" }])

## EJEMPLO DE BASE DE DATOS PARA PODER UTILIZAR ESTE CODIGO

> Base de Datos en SUPABASE
> ![foto bbdd](./readme/bbdd.png)

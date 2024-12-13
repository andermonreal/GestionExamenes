const { app, BrowserWindow, screen } = require("electron");
const { exec, execSync } = require("child_process");
const path = require("path");
const net = require("net");
const fs = require("fs");

let apiProcess;
const PORTS = [3000, 3001];

// Crear el archivo log en `app.getPath("userData")` antes de inicializar la API
function initializeLog() {
  const logPath = path.join(app.getPath("userData"), "error_log.txt");
  try {
    fs.writeFileSync(logPath, "App initializing...\n", { flag: "w" });
  } catch (error) {
    console.error("Error creating log file:", error.message);
  }
  return logPath;
}

app.on("ready", () => {
  const logPath = initializeLog();

  fs.appendFileSync(logPath, "App is ready. Setting up configurations...\n");
  console.log("App is ready. Log initialized at:", logPath);

  app.commandLine.appendSwitch("disable-gpu");
  app.commandLine.appendSwitch("disable-gpu-compositing");

  const cachePath = path.join(app.getPath("userData"), "Cache");
  app.commandLine.appendSwitch("disk-cache-dir", cachePath);

  checkPortAndStartAPI(logPath);
});

function createWindow(logPath) {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const win = new BrowserWindow({
    width: width,
    height: height,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false,
    },
  });

  const mainPagePath = path.join(__dirname, "TESTER", "index.html");
  fs.appendFileSync(logPath, `Loading main page from: ${mainPagePath}\n`);
  win.loadFile(mainPagePath);
  win.maximize();
}

function closePort(port) {
  try {
    const pid = execSync(`netstat -aon | findstr :${port}`)
      .toString()
      .trim()
      .split(/\s+/)[4];
    if (pid) {
      console.log(`Closing process on port ${port} (PID: ${pid})...`);
      execSync(`taskkill /PID ${pid} /F`);
      console.log(`Process on port ${port} closed.`);
    }
  } catch (error) {
    console.error(`Failed to close port ${port}: ${error.message}`);
  }
}

function startAPI(port, logPath) {
  const apiPath = path.join(
    app.isPackaged ? process.resourcesPath : __dirname,
    "API",
    "app.js"
  );
  const nodePath = process.platform === "win32" ? "node.exe" : "node";

  fs.appendFileSync(
    logPath,
    `Starting API with path: ${apiPath} on port ${port} using ${nodePath}\n`
  );
  console.log(`Starting API on port ${port} at path: ${apiPath}`);

  apiProcess = exec(
    `"${nodePath}" "${apiPath}" ${port}`,
    (error, stdout, stderr) => {
      if (error) {
        fs.appendFileSync(
          logPath,
          `Error al ejecutar la API: ${error.message}\n`
        );
        console.error("Error starting API:", error.message);
        return;
      }
      fs.appendFileSync(
        logPath,
        `API running on port ${port}. Output: ${stdout}\nErrors: ${stderr}\n`
      );
      console.log(`API running on port ${port}.`);
    }
  );
}

function checkPortAndStartAPI(logPath, portIndex = 0) {
  if (portIndex >= PORTS.length) {
    fs.appendFileSync(
      logPath,
      "No se pudo iniciar la API en ninguno de los puertos especificados.\n"
    );
    console.log("No se pudo iniciar la API en ninguno de los puertos.");
    createWindow(logPath);
    return;
  }

  const port = PORTS[portIndex];
  const server = net.createServer();

  server.once("error", (err) => {
    if (err.code === "EADDRINUSE") {
      fs.appendFileSync(
        logPath,
        `El puerto ${port} ya está en uso. Cerrando proceso y probando nuevamente...\n`
      );
      console.log(`El puerto ${port} ya está en uso. Cerrando proceso...`);
      closePort(port); // Cerrar el proceso en ese puerto
      checkPortAndStartAPI(logPath, portIndex); // Reintentar en el mismo puerto después de cerrarlo
    }
  });

  server.once("listening", () => {
    server.close();
    fs.appendFileSync(
      logPath,
      `El puerto ${port} está libre. Iniciando la API...\n`
    );
    console.log(`El puerto ${port} está libre. Iniciando la API...`);
    startAPI(port, logPath);
    createWindow(logPath);
  });

  server.listen(port);
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  const logPath = path.join(app.getPath("userData"), "error_log.txt");
  if (apiProcess) {
    fs.appendFileSync(logPath, "Deteniendo la API...\n");
    apiProcess.kill();
  }
});

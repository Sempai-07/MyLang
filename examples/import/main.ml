import "./start.ml" // The name of the variable will depend on the name of the file.

coreio.print(start); // { add: [function add] }
coreio.print(start.add(5, 10)); // 15

var importStart = import("./start.ml"); // The cache is working, to disable it add the flag --disable-cache when loading.

coreio.print(start); // { add: [function add] }
coreio.print(start.add(5, 10)); // 15

import(
  "coreio",
  "./start.ml",
  startImport: "./start.ml",
  startHTTP: "http://start.ml", // or https
  packageJSON: "./package.json",
);

coreio.print(start, startImport, startHTTP); // { add: [function add] }
coreio.print(start.add(5, 10)); // 15

coreio.print(import.base); // The main directory where the project is launched.
coreio.print(import.main); // Path to the main file where the project is launched.
coreio.print(import.cache); // Cache of all imports.
coreio.print(import.paths); // An array of all files that were used via import.
coreio.print(import.resolve("start.ml")); // Check for file existence (similar to path.resolve in node.js). Not http/https
coreio.print(import.as("start.css", "mylang")); // Loads 'start.css' and treats it as a 'mylang' source file
coreio.print(import.as("json.txt", "json"));  // Loads 'json.txt' and parses it as JSON, ignoring the .txt extension (all extension)
coreio.print(import.as("text.txt", "buffer")); // Loads 'text.txt' and reads it as a binary buffer (default: buffer)

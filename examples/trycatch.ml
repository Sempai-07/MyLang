import "coreio";

try {
  var lib = import("test");
} catch {
  coreio.print("Lib not found");
}

try {
  var lib = import("test");
} catch(err) {
  coreio.print("Lib not found:", err);
}

try {
  var lib = import("test");
} catch(err) {
  coreio.print("Lib not found:", err);
} finally {
  coreio.print("Finally lib");
}

try {
  var lib = import("test");
} finally {
  coreio.print("Finally lib");
}
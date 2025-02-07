import "fs";
import "coreio";

// Example 1: Read a file with automatic closing
func readFile(filename) {
  var file = fs.FileOperation();
  file.open(filename, "r");

  defer file.close();  // File will close automatically

  return file.read(1000).toString();
}

coreio.print(readFile("index.js"));

// Example 2: Write to a file and handle errors
func writeFile(filename, content) {
  var file = fs.FileOperation();
  file.open(filename, "w");

  defer file.close();  // Ensures the file is closed

  file.write(content);
}

writeFile("test.txt", "Hello, world!");
coreio.print("Writing complete");

// Example 3: Append to a file
func appendToFile(filename, content) {
  var file = fs.FileOperation();
  file.open(filename, "a");

  defer file.close();

  file.write("\n" + content);
}

appendToFile("log.txt", "New log entry");
coreio.print("Log updated");

// Example 4: Demonstrating defer execution order
func testDefer() {
  coreio.print("Start");

  defer coreio.print("Defer 1");
  defer coreio.print("Defer 2");

  coreio.print("End");
}

testDefer();
// Output:
// Start
// End
// Defer 2
// Defer 1

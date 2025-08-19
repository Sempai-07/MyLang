# 👻 MyLang2 Programming Language

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-green.svg)]()
[![Build](https://img.shields.io/badge/build-stable-success.svg)]()

---

## 🔓 Overview

**MyLang2** is a powerful, expressive programming language that harmoniously combines simplicity with advanced features. Designed for modern development needs, it offers a rich ecosystem of built-in libraries, flexible syntax patterns, and contemporary programming constructs that enable developers to build robust applications efficiently.

> ⚠️ The language is experimental, and there are many unfinished parts, so sorry. The most important unfinished part is the precedence of different operators, so be careful when developing or testing the language 😝

---

## Core Features

### **Rich Standard Library**

Comprehensive built-in modules covering common development tasks from I/O operations to network communications.

### **Flexible Variable System**

Advanced support for constants, readonly variables, and optional chaining with intelligent error prevention.

### **Advanced Control Flow**

Sophisticated pattern matching capabilities, iterator support, and comprehensive loop constructs for complex logic handling.

### **Modern Functions**

Contemporary function features including rest parameters, default arguments, and multiple return values for enhanced code expressiveness.

### **Object-Oriented Features**

Well-designed structs, enums with methods, and proper encapsulation mechanisms for clean architecture.

### **Module System**

Flexible import/export capabilities with intelligent caching and remote loading support for scalable applications.

### **Error Handling**

Comprehensive try-catch-finally blocks with detailed error information and graceful failure management.

### **Concurrency with spawn/wait**

Clean asynchronous function execution with intuitive syntax for concurrent operations.

### **Memory Management**

Defer statements for automatic cleanup operations and resource management.

---

## Built-in Libraries

MyLang2 provides an extensive standard library ecosystem designed to handle diverse development scenarios:

| **Library**      | **Purpose**                  | **Key Features**                               |
| ---------------- | ---------------------------- | ---------------------------------------------- |
| `coreio`         | Core input/output operations | Print, read, write operations                  |
| `syncbox`        | Synchronization primitives   | Channels, mutexes, wait groups                 |
| `strings`        | String manipulation          | Split, join, trim, search functions            |
| `arrays`         | Array processing             | Map, filter, reduce operations                 |
| `objects`        | Object processing            | Filter, find, groupBy operations               |
| `random`         | Random number generation     | Secure random, distributions                   |
| `path`           | File system path operations  | Join, resolve, normalize paths                 |
| `os`             | Operating system interface   | Environment, process management                |
| `os/system`      | Operating system interface   | Environment, processe system (nodejs, mylang2) |
| `uuid`           | UUID generation utilities    | V4, V1, custom UUID generation                 |
| `iter`           | Iterator patterns            | Custom iterators, lazy evaluation              |
| `collections`    | Data structures              | Set, Map, advanced collections                 |
| `net/http`       | HTTP functionality           | Client, server, middleware                     |
| `net/url`        | URL parsing                  | Parse, build, manipulate URLs                  |
| `utils/colors`   | Color utilities              | Terminal colors, formatting                    |
| `bytes`          | Binary data manipulation     | Buffer operations, encoding                    |
| `fs`             | File system operations       | Read, write, directory management              |
| `fs/stream`      | File streaming               | Efficient large file handling                  |
| `events`         | Event handling               | Event emitters, listeners                      |
| `runtime`        | Runtime introspection        | Reflection, system information                 |
| `time`           | Time and date operations     | Formatting, parsing, calculations              |
| `numbers`        | Numeric operations           | Math functions, conversions                    |
| `numbers/bigint` | Big integer arithmetic       | Large number calculations                      |

---

## Installation & Quick Start

### **Basic Usage**

Create your first MyLang2 program by saving the following code in a file with the `.ml` extension:

```mylang2
import "coreio";

coreio.print("Hello, MyLang2!");
```

This simple example demonstrates the clean import syntax and straightforward function calling convention that characterizes MyLang2.

---

## Language Syntax Guide

### **Variables and Constants**

MyLang2 provides sophisticated variable declaration and management capabilities:

```mylang2
import "coreio";

// Basic variable declarations with automatic type inference
var username;
var userAge = nil;

coreio.print(username, userAge); // Output: nil, nil

// Assignment operations with various operators
username = "Alice";
userAge = 25;

// Compound assignment operators for efficient updates
userAge -= 5;   // Now 20
userAge += 10;  // Now 30
userAge /= 10;  // Now 3
userAge *= 10;  // Now 30
userAge **= 2;  // Now 900
userAge %= 8;   // Now 4
userAge++;      // Now 5

// Bitwise operations for advanced manipulation
let a = 6;
a |= 3;      // Now 7

let b = 6;
b &= 3;      // Now 2

let c = 6;
c ^= 3;      // Now 5

// Bit shifting operations
let n = 3;
n <<= 2;      // Now 12

let m = -16;
m >>= 2;      // Now -4

let l = -16;
l >>>= 2;     // Now 1073741820

// Constant declarations for immutable values
var maxConnections = 100 as const;
// maxConnections = 200; // Error: Assignment to constant variable

// Readonly collections allow content modification but prevent reassignment
var shoppingCart = [] as const;
shoppingCart[0] = "laptop"; // Permitted - modifying contents
// shoppingCart = ["phone"]; // Error: Cannot reassign constant variable

var priceList = [99, 199, 299] as readonly;
// priceList[0] = 50; // Error: Cannot modify readonly array

// Multi-variable declarations for efficient initialization
var (
  firstName,
  lastName = "Doe",
  birthYear = 1990 as readonly,
  userId = firstName as const
);
```

### **Optional Chaining**

Optional chaining provides safe property access without runtime errors:

```mylang2
var userProfile = {
  name: "John",
  settings: {
    theme: "dark"
  }
};

// Safe property access prevents errors when properties don't exist
var profilePicture = userProfile?.avatar?.url; // Returns nil safely
var currentTheme = userProfile?.settings?.theme; // Returns "dark"
```

### **Data Types and Operations**

MyLang2 supports comprehensive data manipulation with intuitive operators:

```mylang2
import "coreio";

// Arithmetic and comparison operations
var price = 50;
var discount = 10;

coreio.print(
  "Calculator demonstration:",
  price + discount,     // 60 (addition)
  price - discount,     // 40 (subtraction)
  price * 2,           // 100 (multiplication)
  price / 2,           // 25 (division)
  price % 7,           // 1 (modulo)
  price == 50,         // true (equality)
  price != discount,   // true (inequality)
  { userId: 123 } == { userId: 123 }, // true (deep comparison)
  price > discount,    // true (greater than)
  price < 100,         // true (less than)
  price >= 50,         // true (greater than or equal)
  price <= 60,         // true (less than or equal)
  6 ^ 3,               // 5 (bitwise XOR)
  3 << 2,              // 12 (left bit shift)
  -16 >> 2,            // -4 (right bit shift)
  -16 >>> 2,           // 1073741820 (unsigned right shift)
  5 & 3,               // 1 (bitwise AND)
  true && "hello",     // "hello" (logical AND)
  5 | 3,               // 7 (bitwise OR)
  false || "default"   // "default" (logical OR)
);

// Unary operators for type conversion and negation
coreio.print(
  "Type conversion examples:",
  !true,        // false (logical NOT)
  !false,       // true (logical NOT)
  +"123",       // 123 (string to number conversion)
  -"456"        // -456 (string to negative number conversion)
);

// Reflector operator (typeof)
import "numbers";

enum TypeOfStatus {}

struct TypeOfAction {}

function typeOfFunc() {}

var typeOfErr = nil;

try {
  throw "Error";
} catch(err) {
  typeOfErr = err;
}

coreio.print(
  typeof TypeOfStatus, // enum
  typeof TypeOfAction, // struct,
  typeof struct Action {}, // struct
  typeof typeOfFunc, // func
  typeof func() {}, // func
  typeof true, // boolean
  typeof nil, // nil
  typeof {}, // object
  typeof [], // array
  typeof 124, // int
  typeof 123.0, // float
  typeof 123n, // bigint
  typeof typeOfErr, // error
  typeof "string", // string
  typeof numbers.Infinity, // infinity
  typeof numbers.NaN, // nan
  typeof vars, // nil (variable not exist, work only identifier)
);

// Reflector operator (in)
enum InTest {
  Open;
  Close;
}

struct InTesting {
  var closed;
  var opened = false;

  func isClosed() {
    return this.closed;
  }
}

coreio.print(
  "key" in {}, // false
  "key" in { key: true }, // true
  1 in InTest, // true
  2 in InTest, // false
  "closed" in InTesting(), // true
  "opened" in InTesting(), // true
  "isClosed" in InTesting(), // true
  "isOpened" in InTesting(), // false
  0 in [0], // true
  0 in [], // false
  0 in "string", // true
  0 in 0, // Error only error, struct, enum, object, array, string
  name in func() {}, // Cannot use "in" operator to search for "2" in function
);

// Ternary operator for conditional value assignment
var accountStatus = true;
var message = accountStatus ? "Welcome back!" : "Please log in";
coreio.print(message); // Output: "Welcome back!"

var itemCount = 0;
var cartDisplay = itemCount > 0 ? "Items: " + itemCount : "Cart is empty";
coreio.print(cartDisplay); // Output: "Cart is empty"
```

### **Objects and Arrays**

MyLang2 provides flexible object and array manipulation:

```mylang2
import "coreio";

var userProfile = {
  username: "john_doe",
  email: "john@example.com",
  preferences: {
    language: "English",
    notifications: ["email", "sms"],
    getLanguageCode: func() {
      return this.language == "English" ? "en" : "es";
    }
  },
  getDisplayName: func() {
    return "User: " + this.username;
  }
};

// Multiple property access methods
coreio.print(
  userProfile.username,                    // "john_doe"
  userProfile["email"],                    // "john@example.com"
  userProfile.preferences.language,        // "English"
  userProfile["preferences"]["notifications"], // ["email", "sms"]
  userProfile.preferences.getLanguageCode(), // "en"
  userProfile.getDisplayName()             // "User: john_doe"
);

// Array indexing and safe access
var todoList = ["Buy groceries", "Walk the dog", "Finish project"];
coreio.print(
  todoList[0],  // "Buy groceries"
  todoList[2],  // "Finish project"
  todoList[5]   // nil (safe access for non-existent index)
);

// Arrays with functions that utilize 'this' context
var shoppingCart = [
  func() { return "Items in cart: " + (length(this) - 1); },
  "laptop",
  "mouse"
];
coreio.print(shoppingCart[0]()); // "Items in cart: 2"
```

---

## Control Flow

### **While Loops**

While loops provide fundamental iteration capabilities:

```mylang2
import "coreio";

// Countdown timer implementation
var timeRemaining = 5;

while (timeRemaining > 0) {
  coreio.print("Time left:", timeRemaining, "seconds");
  timeRemaining--;

  if (timeRemaining == 2) {
    coreio.print("Almost done!");
    continue; // Skip to next iteration
  }

  if (timeRemaining == 1) {
    coreio.print("Time's up!");
    break; // Exit loop early
  }
}
```

### **For Loops**

For loops offer versatile iteration patterns:

```mylang2
import "coreio";

// Traditional for loop for batch processing
for (var fileIndex = 0; fileIndex < 10; fileIndex++) {
  if (fileIndex == 5) {
    coreio.print("Skipping corrupted file at index", fileIndex);
    continue;
  }
  coreio.print("Processing file:", fileIndex);
}

// Infinite loop with manual control
var pageNumber = 1;
for (;;) {
  coreio.print("Loading page:", pageNumber);
  pageNumber++;
  if (pageNumber > 3) break;
}

// For-in loops for collection iteration
var groceryList = ["apples", "bread", "milk", "eggs"];
for (var item in groceryList) {
  coreio.print("Need to buy:", item);
}

var bookRatings = {
  "1984": 5,
  "Dune": 4,
  "Foundation": 5
};
for (var bookTitle in bookRatings) {
  coreio.print(bookTitle, "- Rating:", bookRatings[bookTitle], "/5 stars");
}
```

### **Pattern Matching**

Pattern matching enables sophisticated conditional logic:

```mylang2
import "coreio";

func getSubscriptionLevel(planId) {
  match(planId) {
    case (1): return "Free Plan";
    case (2): {
      return "Premium Plan";
    }
    case (3):
    case (4):
    case (5): return "Enterprise Plan";
    default: return "Unknown Plan";
  }
}

// Object property pattern matching for authentication
var userSession = {
  isAuthenticated: true,
  hasAdminRights: false,
  checkPermissions: func() {
    return this.isAuthenticated && this.hasAdminRights;
  }
};

var accessLevel = match(userSession) {
  case (.isAuthenticated): return "User Access";
  case (.hasAdminRights): return "Admin Access";
  case (.checkPermissions()): return "Full Permissions";
  default: return "No Access";
};

coreio.print(
  getSubscriptionLevel(1),    // "Free Plan"
  getSubscriptionLevel(2),    // "Premium Plan"
  getSubscriptionLevel(3),    // "Enterprise Plan"
  getSubscriptionLevel(99),   // "Unknown Plan"
  accessLevel                 // "User Access"
);
```

---

## Functions

MyLang2 functions support modern programming patterns:

```mylang2
import "coreio";

// Multiple return values for complex data
func calculatePosition(x, y) {
  var distance = (x * x + y * y);
  return x + y, x, y, distance;
}
coreio.print("Position data:", calculatePosition(3, 4)); // [7, 3, 4, 25]

// Arguments object for dynamic parameter handling
func createUser(username, email) {
  var allArgs = arguments;
  return allArgs;
}
coreio.print("User creation args:", createUser("alice", "alice@example.com"));
// Output: ["alice", "alice@example.com"]

// Rest parameters for variable argument functions
func logMessage(level, ...messageData) {
  return level, messageData;
}
coreio.print(logMessage("ERROR", "Database", "Connection failed", 500));
// Output: ["ERROR", ["Database", "Connection failed", 500]]

// Default parameters for optional configuration
func connectToServer(host = "localhost", port = 8080, timeout = 30) {
  return "Connecting to " + host + ":" + port + " (timeout: " + timeout + "s)";
}

coreio.print(connectToServer());                    // Uses all defaults
coreio.print(connectToServer("api.example.com"));   // Custom host
coreio.print(connectToServer("db.server", 5432));   // Custom host and port

// Anonymous functions for event handling
var handleClick = func(event, target) {
  return "Clicked on " + target + " at " + event;
};

// Named function expressions with recursion support
var calculateFactorial = func factorial(number) {
  return number <= 1 ? 1 : number * factorial(number - 1);
};

coreio.print("5! =", calculateFactorial(5)); // 120
```

---

## Enums

Enums provide organized constant definitions with enhanced functionality:

```mylang2
import "coreio";

// Simple enumeration for user status tracking
enum UserStatus {
  Offline;
  Online;
  Away;
  Busy;
}

coreio.print(UserStatus.Offline); // 0
coreio.print(UserStatus.Online);  // 1
coreio.print(UserStatus.Away);    // 2

// Enums with custom values for HTTP response codes
enum HttpStatus {
  Ok = 200;
  NotFound = 404;
  ServerError = 500;
}

// Mixed data type enums for order status
enum OrderStatus {
  Pending = "processing";
  Shipped = true;
  Delivered = false;
}

// Enhanced enums with helper methods
enum Permission {
  Guest = 1;
  User = 2;
  Moderator = 4;
  Admin = 8;

  func hasPermission(userLevel, requiredLevel) {
    return userLevel >= requiredLevel;
  }

  func getPermissionName(level) {
    for (var permission in this) {
      if (this[permission[0]].value == level) {
        return permission[0];
      }
    }
    return "Unknown";
  }
}

coreio.print(Permission.hasPermission(4, 2)); // true (Moderator >= User)
coreio.print(Permission.getPermissionName(8)); // "Admin"
```

---

## Structs

Structs provide structured data types with methods:

```mylang2
import "coreio";

// Or expression struct: var GamePlayer = struct {}
struct GamePlayer {
  var playerName;
  var score = 0 as readonly;
  var level = 1;

  func getPlayerInfo() {
    return this.playerName + " - Level " + this.level + " (Score: " + this.score + ")";
  }
}

GamePlayer.calculateTotalProgress = func calculateTotalProgress() {
  return this.level * 100 + this.score;
}

var player = GamePlayer("Alice", 1500);
coreio.print(player.playerName);         // "Alice"
coreio.print(player.score);              // 1500 (readonly, set during creation)
coreio.print(player.getPlayerInfo());    // "Alice - Level 1 (Score: 1500)"
coreio.print(player.calculateTotalProgress()); // 1600

player.level = 5; // Permitted modification
// player.score = 2000; // Error: Cannot assign to readonly property
```

---

## Error Handling

Comprehensive error management with detailed information:

```mylang2
import "coreio";

// Basic error handling for file operations
try {
  var config = import("./config.json");
  coreio.print("Config loaded successfully");
} catch {
  coreio.print("Failed to load configuration file");
}

// Advanced error handling with detailed information
try {
  var database = import("./database");
  var connection = database.connect();
} catch(error) {
  coreio.print("Database connection failed:", error.message);
  coreio.print("Error code:", error.code);
  coreio.print("Affected files:", error.files);
}

// Complete error handling with cleanup
try {
  var userData = validateUserInput(userInput);
  var userId = createUserAccount(userData);
  sendWelcomeEmail(userData.email);
  coreio.print("User created successfully:", userId);
} catch(registrationError) {
  coreio.print("Registration failed:", registrationError.message);
  logError("USER_REGISTRATION", registrationError);
} finally {
  coreio.print("Cleaning up temporary files...");
  cleanupTempFiles();
}

// Function-level error propagation
func makeApiRequest(endpoint) {
  try {
    var response = httpClient.get(endpoint);
    return response.data;
  } catch(apiError) {
    throw "API request failed: " + apiError.message;
  }
}

// Custom error objects with structured information
func validateEmail(email) {
  if (!email || length(email) < 5) {
    throw "Invalid email address provided" as {
      name: "EmailValidate",
      code: "EMAIL_FAILED",
      cause: {
        email,
      }
    };
  }
  return true;
}
```

---

## Defer Statements

Automatic resource cleanup with defer statements:

```mylang2
import "coreio";

func processUserData() {
  coreio.print("Starting user data processing...");

  // Cleanup functions execute when function exits (LIFO order)
  defer coreio.print("вњ“ Database connection closed");
  defer coreio.print("вњ“ Temporary files cleaned up");
  defer {
    coreio.print("вњ“ Audit log written");
    coreio.print("вњ“ Processing completed");
  }

  coreio.print("Processing user records...");
  coreio.print("Validating data...");
}

processUserData();
// Output sequence:
// Starting user data processing...
// Processing user records...
// Validating data...
// Audit log written
// Processing completed
// Temporary files cleaned up
// Database connection closed

// Value capture at declaration time
func handlePayment(amount) {
  var transactionId = generateTransactionId();
  var timestamp = getCurrentTime();

  // Values are captured at defer declaration time
  defer logTransaction(transactionId, amount, timestamp);

  // Process payment operations
  amount = 0; // This change won't affect the deferred log

  return transactionId;
}
```

---

## Concurrency: spawn and wait

MyLang2 introduces powerful concurrency operators that enable asynchronous execution while maintaining clean, readable syntax.

### **Core Concepts**

- **`spawn func()`** Launches a function asynchronously and returns a Spawn object
- **`wait spawn func()`** Immediately waits for execution and returns the result
- **`wait someSpawn`** Unwraps a Spawn object into its final result

### **The Spawn Object**

When a function is launched via spawn, it returns a comprehensive Spawn object containing execution metadata:

```mylang2
{
  done,           // boolean - execution completion status
  result,         // return value if resolved
  error,          // error information if rejected
  status,         // "pending" | "fulfilled" | "rejected" | "cancelled"
  elapsed,        // execution time duration
  cancel(),       // method to cancel execution
  isCancelled(),  // check cancellation status
  isFinished(),   // check completion status
  output(),       // chainable result handler
}
```

After applying wait, the object is simplified to:

```mylang2
{
  done,
  result,
  error,
  status,
  elapsed,
}
```

### **Usage Examples**

**Simple spawn/wait execution:**

```mylang2
import "coreio";

func syncFunc() {
  return 42;
}

var result = wait spawn syncFunc();
coreio.print("Result:", result); // 42
```

**Chained result handling with .output():**

```mylang2
import "coreio";

func getValue() {
  return 100;
}

var task = spawn getValue();

var chain = task
  .output(func(res) {
    coreio.print("Step 1:", res);
    return res + 1;
  })
  .output(func(res) {
    coreio.print("Step 2:", res);
    return res * 2;
  });

coreio.print("Final result:", wait chain); // 202
```

**Integration with channels (syncbox):**

```mylang2
import (
  "coreio",
  "syncbox",
);

var chan = syncbox.chan(1);

func worker() {
  coreio.print("Worker start");
  chan.send("done");
  return "finished";
}

var result = wait spawn worker();

coreio.print("Worker result:", result);     // finished
coreio.print("Channel received:", chan.recv()); // done
```

This concurrency model allows you to write asynchronous code in a synchronous style, combining clarity with complete control over execution flow.

---

## Iterators

MyLang2 provides sophisticated iterator support for custom data traversal:

```mylang2
import "iter";
import "coreio";

// Built-in iterators for standard data processing
var userIds = [101, 102, 103, 104];
for (var userId in iter.Iterator(userIds)) {
  coreio.print("Processing user:", userId);
}

// Custom iterator for complex user management system
var userManager = {
  activeUsers: ["alice", "bob", "charlie"],
  inactiveUsers: ["david", "eve"],
  adminUsers: ["admin", "root"],

  [iter.symbol]: func(manager) {
    var currentCategory = 0;
    var currentIndex = 0;
    var categories = [this.activeUsers, this.inactiveUsers, this.adminUsers];
    var categoryNames = ["Active", "Inactive", "Admin"];

    return {
      next: func() {
        // Traverse through all user categories
        while (currentCategory < length(categories)) {
          var currentUsers = categories[currentCategory];

          if (currentIndex < length(currentUsers)) {
            var userData = {
              username: currentUsers[currentIndex],
              status: categoryNames[currentCategory]
            };
            currentIndex++;
            return { done: false, value: userData };
          }

          // Move to next category
          currentCategory++;
          currentIndex = 0;
        }

        return { done: true, value: nil };
      }
    };
  }
};

coreio.print("Iterating through all users:");
for (var userData in userManager) {
  coreio.print("User:", userData.username, "- Status:", userData.status);
}
// Expected output:
// User: alice - Status: Active
// User: bob - Status: Active
// User: charlie - Status: Active
// User: david - Status: Inactive
// User: eve - Status: Inactive
// User: admin - Status: Admin
// User: root - Status: Admin
```

---

## Module System

MyLang2 provides a flexible and powerful module system for code organization:

### **Importing Modules**

```mylang2
// Single module import
import "coreio";

// Multiple module imports
import (
  "coreio",
  "strings",
  "arrays"
);

// Import with custom alias
import "./utils.ml" as utils;

// Import with destructuring for specific functions
import "./math.ml" as { add, subtract };

// Dynamic import for runtime loading
var mathLib = import("./math.ml");

// Remote import from URL
import "https://example.com/library.ml";

// Import metadata and utilities
coreio.print(import.base);    // Main directory path
coreio.print(import.main);    // Main file path
coreio.print(import.cache);   // Import cache information
coreio.print(import.paths);   // All imported paths

// Import path resolution
coreio.print(import.resolve("./file.ml"));

// Import with type specification
coreio.print(import.as("data.txt", "json"));
coreio.print(import.as("binary.dat", "buffer"));
```

### **Exporting from Modules**

```mylang2
// math.ml - Example module with exports
func add(a, b) {
  return a + b;
}

func subtract(a, b) {
  return a - b;
}

var PI = 3.14159;

// Export specified functions and variables
export(add, subtract, PI);
```

### **Creating Custom Extensions**

MyLang2 allows extending the language with JavaScript for enhanced functionality:

```javascript
// index.js - JavaScript extension
import { FunctionBuilder } from "mylang2";

abstract class CoreIOMethodBuilder extends FunctionBuilder {
  constructor(args, astArgs, environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "custom",
      path: __dirname,
    };
  }

  call() {
    throw new Error("Call is not implemented");
  }
}

class Print extends CoreIOMethodBuilder {
  override call() {
    console.log(...this.args);
  }
}

module.exports = { print: Print };
```

```mylang2
// index.ml - Using the custom extension
import "./index.js";

index.print("Hello from custom function!");
```

---

## Security Features

MyLang2 incorporates multiple security mechanisms to protect applications:

- **Property Protection**: Properties prefixed with `__` are automatically protected from external access
- **Prototype Protection**: Direct access to `.prototype` on JavaScript functions is prevented
- **Safe Property Access**: Optional chaining prevents runtime errors when accessing null or undefined properties
- **Controlled Environment**: Sandboxed execution environment for untrusted code

---

## Advanced Features

### **Global Functions**

MyLang2 provides universal functions that work across all data types:

#### **length function**

```mylang2
import "coreio";

// Universal length function with intelligent type handling
coreio.print(length("Hello"));     // 5 (string character count)
coreio.print(length([1, 2, 3]));   // 3 (array element count)
coreio.print(length({a: 1, b: 2})); // 2 (object property count)
coreio.print(length(123.45));      // 5 (string representation length)
coreio.print(length(12345n));      // 5 (string representation length)
coreio.print(length(true));      // 1
coreio.print(length(false));      // 1
coreio.print(length(nil));      // 0
coreio.print(length(func test(args1, args2) {})); // 2 (param length)
coreio.print(length(struct Test{
  var fields;

  func setFields(fields = 0) {
    return this.fields = fields;
  }
})); // 2 (fields count + func count) also for enam
```

#### **process variable**

```mylang2
import "coreio";
import "os/system";

coreio.print(process.nodejs.version); // Current NodeJS version
coreio.print(process.version); // Current mylang2 version
coreio.print(process == system); // true
```

### **Memory Management**

Automatic resource management with defer statements:

```mylang2
func resourceManagement() {
  var resource = openResource();

  defer closeResource(resource); // Always executes on function exit

  // Resource utilization
  processResource(resource);

  if (someCondition) {
    return; // defer still executes before return
  }

  // Additional processing operations
}
```

---

## Practical Examples

### **Web Server Implementation**

```mylang2
import (
  "coreio",
  "net/http",
  "fs",
);

var server = http.Server();

// Configure CORS for cross-origin requests
server.cors({
  origin: "*",
  methods: ["GET"],
});

// Serve static HTML content
server.get("/", func(ctx) {
  return ctx.send(fs.readFile("./index.html"), 200, { "Content-Type": "text/html; charset=utf-8" });
});

// Dynamic route with parameters
server.get("/user/:id", func (ctx) {
  return ctx.send({ userId: ctx.params.id });
});

// JSON API endpoint
server.get("/api", func (ctx) {
   return ctx.send(
       { status: "ok", message: "JSON works!" },
       200,
       { "Content-Type": "application/json" }
    );
});

// Echo endpoint for POST requests
server.post("/echo", func (ctx) {
    return ctx.send(
       { you_sent: ctx.body },
       200,
       { "Content-Type": "application/json" }
    );
});

// Data processing endpoint
server.post("/data", func (ctx) {
  return ctx.send({ got: ctx.body });
});

// Rate limiting configuration
server.rateLimit({
  windowMs: 1000,
  max: 100
});

// Start server with callback
server.listen(3000, func() {
   coreio.print("Server running on http://localhost:3000");
});
```

### **Data Processing Pipeline**

```mylang2
import "fs";
import "strings";
import "arrays";

func processData(filename) {
  try {
    var content = fs.readFile(filename, "utf8").toString();
    var lines = strings.split(content, "\n");
    var processed = arrays.map(lines, func(line) {
      return strings.trim(line);
    });
    return processed;
  } catch(err) {
    coreio.print("Error processing file:", err);
    return [];
  } finally {
    coreio.print("Processing completed");
  }
}
```

### Custom Iterator

```mylang2
import "iter";

func Range(start, end) {
  return {
   [iter.symbol]: func() {
      var current = start;
      var end = end;

      return {
        next: func() {
          if (current >= end) {
            return { done: true, value: nil };
          }
          var value = current;
          current++;
          return { done: false, value: value };
        }
      };
    }
  }
}

var range = Range(0, 5);
for (var num in range) {
  coreio.print(num); // 0, 1, 2, 3, 4
}
```

## 🤝 Contributing

We welcome contributions to MyLang2! Please see our contributing guidelines for more information.

## 📄 License

MyLang2 is released under the MIT License. See LICENSE file for details.

## 🔗 Links

- [Documentation](https://mylang2.dev/docs)
- [Examples Repository](https://github.com/mylang2/examples)
- [Package Registry](https://mylang2.dev/packages)
- [Community Forum](https://community.mylang2.dev)

---

_MyLang2 - Expressive, Simple_

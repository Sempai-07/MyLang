# 👻 MyLang2 Programming Language

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.1.0-green.svg)]()
[![Build](https://img.shields.io/badge/build-stable-success.svg)]()

---

## 🔓 Overview

**MyLang2** is a powerful, expressive programming language that harmoniously combines simplicity with advanced features. Designed for modern development needs, it offers a rich ecosystem of built-in libraries, flexible syntax patterns, and contemporary programming constructs that enable developers to build robust applications efficiently.

> ✨ **New in v2.1.0**: Complete parser rewrite with industry-standard Pratt algorithm! All operator precedence issues have been fixed, ternary operators now work correctly, and mathematical expressions evaluate as expected.

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

Well-designed structs with constructors, enums with methods, and proper encapsulation mechanisms for clean architecture.

### **Module System**

Flexible import/export capabilities with intelligent caching and remote loading support for scalable applications.

### **Error Handling**

Comprehensive try-catch-finally blocks with detailed error information and graceful failure management.

### **Concurrency with spawn/wait**

Clean asynchronous function execution with intuitive syntax for concurrent operations.

### **Memory Management**

Defer statements for automatic cleanup operations and resource management.

### **Correct Operator Precedence**

Mathematical and logical expressions now evaluate correctly following standard precedence rules thanks to Pratt parsing algorithm.

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

### **Interpolated Strings (`$"..."`)**

Interpolated strings let you embed expressions directly inside strings using `${...}`.
Each expression is evaluated at runtime and replaced with its result.

```mylang2
import "coreio";

var name = "World";

var user = {
  greet: func greet(id) {
    coreio.print("User ID:", id);
    return "Guest";
  }
}

coreio.print($"Hello, {name}! Your status: {user.greet(42)}. Sum: {1 + 2}");
```

**Output:**

```
User ID: 42
Hello, World! Your status: Guest. Sum: 3
```


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
var a = 6;
a |= 3;      // Now 7

var b = 6;
b &= 3;      // Now 2

var c = 6;
c ^= 3;      // Now 5

// Bit shifting operations
var n = 3;
n <<= 2;      // Now 12

var m = -16;
m >>= 2;      // Now -4

var l = -16;
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

MyLang2 supports comprehensive data manipulation with intuitive operators and **correct precedence**:

```mylang2
import "coreio";

// Arithmetic operations with CORRECT precedence (v2.1.0+)
coreio.print(2 + 3 * 4);        // 14 (not 20!) - multiplication first
coreio.print(10 - 2 * 3);       // 4 (not 24!) - multiplication first
coreio.print(1 + 2 * 3 ** 2);   // 19 - exponentiation, then multiplication, then addition

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
  typeof "string", // string
  typeof typeOfErr // error
);
```

### **Operator Precedence Guide**

MyLang2 follows standard mathematical operator precedence (v2.1.0+):

```mylang2
// Precedence from highest to lowest:
// 1. Exponentiation (**)
// 2. Multiplication (*), Division (/), Modulo (%)
// 3. Addition (+), Subtraction (-)
// 4. Bitwise shifts (<<, >>, >>>)
// 5. Comparison (<, >, <=, >=)
// 6. Equality (==, !=)
// 7. Bitwise AND (&)
// 8. Bitwise XOR (^)
// 9. Bitwise OR (|)
// 10. Logical AND (&&)
// 11. Logical OR (||)
// 12. Ternary (?:)
// 13. Assignment (=, +=, -=, etc.)

// Examples:
var a = 2 + 3 * 4;           // 14 (multiplication first)
var b = 10 - 2 * 3;          // 4 (multiplication first)
var c = 2 ** 3 + 1;          // 9 (exponentiation first)
var d = (5 + 3) * 2 - 4 / 2; // 14 (parentheses override precedence)
```

### **Arrays and Objects**

Collections with intuitive syntax and powerful manipulation capabilities:

```mylang2
import "coreio";

// Arrays with proper expression parsing (v2.1.0+)
var numbers = [1 + 1, 2 * 2, 3 ** 2]; // [2, 4, 9] - expressions work correctly!
var mixed = ["text", 42, true, nil, [1, 2, 3]];

// Array access and modification
coreio.print(numbers[0]);    // 2
numbers[1] = 100;

// Array destructuring
var [first, second, ...rest] = numbers;

// Objects with method shorthand
var calculator = {
  value: 0,
  add: func(n) {
    this.value += n;
    return this;
  },
  multiply: func(n) {
    this.value *= n;
    return this;
  },
  // Property shorthand
  result() {
    return this.value;
  }
};

// Method chaining
calculator.add(5).multiply(2); // value = 10

// Object destructuring
var { value, add } = calculator;

// Computed property names
var key = "dynamicKey";
var obj = {
  [key]: "value",
  [1 + 2]: "computed"
};
```

### **Control Flow**

#### **Conditional Statements**

```mylang2
import "coreio";

var score = 85;

// If-else with proper expression parsing (v2.1.0+)
if (score >= 90 && score <= 100) {
  coreio.print("Grade: A");
} else if (score >= 80 && score < 90) {
  coreio.print("Grade: B");
} else if (score >= 70) {
  coreio.print("Grade: C");
} else {
  coreio.print("Grade: F");
}

// Ternary operator - NOW WORKS CORRECTLY! (v2.1.0+)
var grade = score >= 90 ? "A" : score >= 80 ? "B" : "C";

// Complex ternary expressions
var y = 5;
var x = 10;
var b = 3;
var result = y > 2 ? x * 2 : 4 + b; // 20 - full expressions work!

// Ternary in arrays
var arr = [1, 2, x > 5 ? 100 : 200]; // [1, 2, 100] - correct evaluation!
```

#### **Match Statement (Pattern Matching)**

```mylang2
import "coreio";

var value = 42;

match (value * 2) { // Expressions work correctly in match (v2.1.0+)
  case 42: {
    coreio.print("The answer");
  }
  case 84: {
    coreio.print("Double the answer");
  }
  default: {
    coreio.print("Something else");
  }
}

// Match with complex patterns
match (user.role) {
  case "admin": {
    grantFullAccess();
  }
  case "moderator": {
    grantModeratorAccess();
  }
  case "user": {
    grantUserAccess();
  }
  default: {
    denyAccess();
  }
}
```

#### **Loops**

```mylang2
import "coreio";

// For loop with break/continue - NOW WORKS! (v2.1.0+)
for (var i = 0; i < 10; i++) {
  if (i == 5) {
    break; // No longer causes infinite loop!
  }
  if (i % 2 == 0) {
    continue; // Works correctly!
  }
  coreio.print(i);
}

// While loop
var counter = 0;
while (counter < 5) {
  coreio.print(counter);
  counter++;
}

// For-in loop (iteration)
var items = [10, 20, 30];
for (var item in items) {
  coreio.print(item);
}

// For-in with objects
var person = { name: "Alice", age: 30 };
for (var key in person) {
  coreio.print(key, person[key]);
}
```

### **Functions**

MyLang2 offers flexible function definitions with modern features:

```mylang2
import "coreio";

// Basic function declaration
func greet(name) {
  return $"Hello, {name}!";
}

// Function with default parameters
func createUser(name, age = 18, role = "user") {
  return { name: name, age: age, role: role };
}

// Function with rest parameters
func sum(...numbers) {
  var total = 0;
  for (var num in numbers) {
    total += num;
  }
  return total;
}

coreio.print(sum(1, 2, 3, 4, 5)); // 15

// Multiple return values
func getUserInfo() {
  return ("Alice", 30, "admin");
}

var (username, age, role) = getUserInfo();

// Higher-order functions
func applyOperation(a, b, operation) {
  return operation(a, b);
}

var result = applyOperation(10, 5, func(x, y) {
  return x + y;
});

// Arrow-like anonymous functions
var multiply = func(a, b) {
  return a * b;
};

// Return with full expressions (v2.1.0+)
func calculate(x, y) {
  return x * 2 + y * 3; // Full expression returned correctly!
}
```

### **Structs (Classes)**

Structs provide object-oriented programming capabilities with optional constructors:

```mylang2
import "coreio";

// Struct with constructor
struct User {
  var name;
  var email;
  var age;

  // Constructor (optional but recommended)
  func init(name, email, age = 18) {
    this.name = name;
    this.email = email;
    this.age = age;
  }

  // Method
  func greet() {
    return $"Hello, I'm {this.name}!";
  }

  // Method with logic
  func isAdult() {
    return this.age >= 18;
  }
}

// Creating instance with constructor
var user1 = User("Alice", "alice@example.com", 25);
coreio.print(user1.greet()); // "Hello, I'm Alice!"
coreio.print(user1.isAdult()); // true

// Struct without constructor (direct field assignment)
struct Point {
  var x;
  var y;

  func distance() {
    return (this.x ** 2 + this.y ** 2) ** 0.5;
  }
}

var point = Point();
point.x = 3;
point.y = 4;
coreio.print(point.distance()); // 5

// Struct with complex initialization
struct BankAccount {
  var accountNumber;
  var balance;
  var owner;

  func init(owner, initialDeposit = 0) {
    this.accountNumber = generateAccountNumber();
    this.balance = initialDeposit;
    this.owner = owner;
  }

  func deposit(amount) {
    if (amount > 0) {
      this.balance += amount;
      return true;
    }
    return false;
  }

  func withdraw(amount) {
    if (amount > 0 && amount <= this.balance) {
      this.balance -= amount;
      return true;
    }
    return false;
  }

  func getBalance() {
    return this.balance;
  }
}

var account = BankAccount("John Doe", 1000);
account.deposit(500);
account.withdraw(200);
coreio.print(account.getBalance()); // 1300
```

### **Enums**

Enumerations with associated methods and values:

```mylang2
import "coreio";

// Basic enum
enum Status {
  Pending,
  Active,
  Completed,
  Failed
}

var currentStatus = Status.Active;

// Enum with custom values
enum HttpStatus {
  Ok = 200,
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  ServerError = 500
}

// Enum with methods
enum Color {
  Red,
  Green,
  Blue,

  func toHex() {
    match (this) {
      case Color.Red: return "#FF0000";
      case Color.Green: return "#00FF00";
      case Color.Blue: return "#0000FF";
    }
  }
}

var favoriteColor = Color.Blue;
coreio.print(favoriteColor.toHex()); // "#0000FF"

// Enum in match statement
match (currentStatus) {
  case Status.Pending: {
    coreio.print("Waiting...");
  }
  case Status.Active: {
    coreio.print("In progress");
  }
  case Status.Completed: {
    coreio.print("Done!");
  }
  case Status.Failed: {
    coreio.print("Error occurred");
  }
}
```

### **Error Handling**

Comprehensive try-catch-finally blocks with detailed error information:

```mylang2
import "coreio";
import "fs";

// Basic error handling
func readConfig(filename) {
  try {
    var content = fs.readFile(filename, "utf8");
    return content;
  } catch(error) {
    coreio.print("Error reading file:", error);
    return nil;
  } finally {
    coreio.print("File operation completed");
  }
}

// Throwing errors
func validateAge(age) {
  if (age < 0) {
    throw "Age cannot be negative";
  }
  if (age > 150) {
    throw "Age seems unrealistic";
  }
  return true;
}

// Nested error handling
func processData(data) {
  try {
    try {
      validateAge(data.age);
    } catch(validationError) {
      coreio.print("Validation failed:", validationError);
      throw "Data processing aborted";
    }
  } catch(error) {
    coreio.print("Processing error:", error);
    return nil;
  }
}

// Error with full expressions (v2.1.0+)
try {
  var result = riskyOperation();
  throw "Failed with value: " + result * 2; // Full expression works!
} catch(err) {
  coreio.print(err);
}
```

### **Concurrency**

Asynchronous programming with spawn and wait:

```mylang2
import "coreio";
import "time";

// Spawn asynchronous task
func fetchData(url) {
  return spawn {
    time.sleep(1000); // Simulate delay
    return $"Data from {url}";
  };
}

// Wait for result
var promise = fetchData("https://api.example.com");
var data = wait promise;
coreio.print(data);

// Multiple concurrent operations
func parallelFetch() {
  var promise1 = spawn { return "Task 1 completed"; };
  var promise2 = spawn { return "Task 2 completed"; };
  var promise3 = spawn { return "Task 3 completed"; };

  var result1 = wait promise1;
  var result2 = wait promise2;
  var result3 = wait promise3;

  coreio.print(result1, result2, result3);
}

// Async function pattern
func asyncCalculation() {
  return spawn {
    var result = 0;
    for (var i = 0; i < 1000; i++) {
      result += i;
    }
    return result;
  };
}

var calculationPromise = asyncCalculation();
coreio.print("Calculating...");
var finalResult = wait calculationPromise;
coreio.print("Result:", finalResult);
```

### **Module System**

#### **Importing Modules**

```mylang2
import "coreio";

// Single import
import "fs";

// Multiple imports
import (
  "strings",
  "arrays",
  "objects"
);

// Named imports with aliases
import {
  Server as HttpServer,
  Client as HttpClient
} from "net/http";

// Relative imports
import "./utils/helpers.ml";
import "../config.ml";

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
})); // 2 (fields count + func count) also for enum
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

### **Custom Iterator**

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

### **Complete Example: Todo List Manager**

```mylang2
import "coreio";

struct Todo {
  var id;
  var title;
  var completed;

  func init(id, title) {
    this.id = id;
    this.title = title;
    this.completed = false;
  }

  func toggle() {
    this.completed = !this.completed;
  }

  func display() {
    var status = this.completed ? "✓" : "○";
    return $"{status} {this.title}";
  }
}

struct TodoList {
  var todos;
  var nextId;

  func init() {
    this.todos = [];
    this.nextId = 1;
  }

  func add(title) {
    var todo = Todo(this.nextId, title);
    this.todos[length(this.todos)] = todo;
    this.nextId++;
    return todo;
  }

  func remove(id) {
    var newTodos = [];
    for (var todo in this.todos) {
      if (todo.id != id) {
        newTodos[length(newTodos)] = todo;
      }
    }
    this.todos = newTodos;
  }

  func toggle(id) {
    for (var todo in this.todos) {
      if (todo.id == id) {
        todo.toggle();
        return true;
      }
    }
    return false;
  }

  func display() {
    coreio.print("\n=== Todo List ===");
    if (length(this.todos) == 0) {
      coreio.print("No todos yet!");
      return;
    }
    for (var todo in this.todos) {
      coreio.print($"{todo.id}. {todo.display()}");
    }
  }
}

// Usage
var list = TodoList();
list.add("Buy groceries");
list.add("Write code");
list.add("Exercise");
list.display();

list.toggle(2);
list.display();

list.remove(1);
list.display();
```

---

## What's New in v2.1.0

### **Complete Parser Rewrite with Pratt Algorithm**

MyLang2 v2.1.0 features a complete parser rewrite using the industry-standard Pratt parsing algorithm, fixing over 130 bugs and significantly improving code quality.

#### **Fixed: Operator Precedence**

Mathematical expressions now evaluate correctly according to standard precedence rules:

```mylang2
// Before v2.1.0 (WRONG)
var x = 2 + 3 * 4;  // Evaluated as: (2 + 3) * 4 = 20 ❌

// v2.1.0+ (CORRECT)
var x = 2 + 3 * 4;  // Evaluated as: 2 + (3 * 4) = 14 ✅

// More examples:
10 - 2 * 3           // Now: 4 ✅ (was: 24)
1 + 2 * 3 ** 2       // Now: 19 ✅ (was: 27)
(5 + 3) * 2 - 4 / 2  // Now: 14 ✅ (parentheses work correctly)
```

#### **Fixed: Ternary Operator**

The ternary operator now works correctly in all contexts:

```mylang2
// Before v2.1.0 (BROKEN)
var result = y > 2 ? x * 2 : 4 + b;
// Parsed incorrectly, often returned true/false

// v2.1.0+ (CORRECT)
var result = y > 2 ? x * 2 : 4 + b;  // ✅ Works perfectly!

// Complex ternary expressions
var grade = score >= 90 ? "A" : score >= 80 ? "B" : "C";  // ✅ Nested ternary works!
var arr = [1, 2, x > 5 ? 100 : 200];  // ✅ Ternary in arrays works!
```

#### **Fixed: Break and Continue**

Break and continue statements no longer cause infinite loops:

```mylang2
// Before v2.1.0 (INFINITE LOOP)
for (var i = 0; i < 10; i++) {
  if (i == 5) {
    break;  // 🔥 Parser got stuck!
  }
}

// v2.1.0+ (WORKS CORRECTLY)
for (var i = 0; i < 10; i++) {
  if (i == 5) {
    break;  // ✅ Works as expected!
  }
}
```

#### **Performance Improvements**

- **O(1) operator lookups**: Set-based operator checks (previously O(n))
- **75% less code**: Eliminated duplicate precedence checks
- **155 lines removed**: Dead code and redundancies cleaned up

---

## Migration from v2.0 to v2.1

### **Breaking Changes**

**None!** All fixes are backward compatible.

### **Code That Now Works**

If you wrote workarounds for bugs in v2.0, you can now simplify your code:

```mylang2
// OLD WORKAROUND (v2.0)
var x = (2 + 3) * 4;  // Had to use parentheses for wrong reason

// NEW (v2.1.0)
var x = 2 + 3 * 4;  // Now naturally gives 14, no workarounds needed

// OLD: Avoided break/continue
var shouldBreak = false;
for (var i = 0; i < 10; i++) {
  if (i == 5) {
    shouldBreak = true;
  }
  if (shouldBreak) {
    // ...
  }
}

// NEW: Use break/continue normally
for (var i = 0; i < 10; i++) {
  if (i == 5) {
    break;  // Works now!
  }
}
```

---

## 🤝 Contributing

We welcome contributions to MyLang2! Please see our contributing guidelines for more information.

## 📄 License

MyLang2 is released under the MIT License. See LICENSE file for details.

## 🔗 Links

- [Documentation](https://mylang2.dev/docs)
- [Examples Repository](https://github.com/mylang2/examples)
- [Package Registry](https://mylang2.dev/packages)
- [Community Forum](https://community.mylang2.dev)
- [Changelog](PARSER_CHANGELOG.md)

---

_MyLang2 v2.1.0 - Expressive, Reliable, Correct_
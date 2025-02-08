# MyLang

Welcome to **MyLang**, a modern programming language designed for flexibility, simplicity, and power. This documentation provides an extensive set of examples and explanations for all key features of MyLang to help you master its capabilities.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Core Features](#core-features)
   - [Functions](#functions)
   - [Variables](#variables)
   - [Objects](#objects)
   - [Control Structures](#control-structures)
   - [Error Handling](#error-handling)
4. [Import System](#import-system)
5. [Operators](#operators)
6. [Examples](#examples)
7. [CLI Commands](#cli-commands)

---

## Introduction

**MyLang** is a dynamically typed, versatile programming language built to be developer-friendly and performant. It supports advanced constructs like pipeline operations, modular imports, flexible functions, and much more.

---

## Getting Started

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Sempai-07/mylang.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Link the CLI tool:
   ```bash
   npm link
   ```

### Running a File

Execute a MyLang file using the CLI:

```bash
mylang <your-file.ml>
```

---

## Core Features

### Functions

#### Basic Function

```mylang
func add(a, b) {
  return a + b;
}

coreio.print("Sum:", add(5, 10)); // Sum: 15
```

#### Function with Default Parameters

```mylang
func greet(name = "Guest") {
  return "Hello, " + name;
}

coreio.print(greet());           // Hello, Guest
coreio.print(greet("Alice"));    // Hello, Alice
```

#### Using `arguments`

```mylang
import "arrays";

func concatStrings() {
  return arraya.join(arguments, " ");
}

coreio.print(concatStrings("My", "Lang", "is", "awesome")); // My Lang is awesome
```

---

### Variables

#### Declaring Variables

```mylang
var x = 10;
var y;

coreio.print(x, y); // 10, nil
```

#### Modifying Variables

```mylang
var counter = 0;

counter += 1;
counter--;

coreio.print(counter); // 0
```

---

#### Constant Variables (`as const`)

Using `as const`, you can declare variables or objects that cannot be reassigned. This ensures immutability for the variable itself but allows modification of its inner elements if it's an array or object.

```mylang
var constant = 10 as const;

// constant = 5; // Error: Cannot reassign a constant variable

var arr = [] as const; // Declaring an immutable array
arr[0] = 100; // Allowed: Modifying elements of the array

// arr = {}; // Error: Cannot reassign the array
```

#### Readonly Variables (`as readonly`)

Using `as readonly`, you can declare variables where neither the variable itself nor its elements can be modified.

```mylang
var arr1 = [1, 2, 3] as readonly; // Declaring a fully immutable array

// arr1 = {};      // Error: Cannot reassign a readonly variable
// arr1[0] = 0;    // Error: Cannot modify elements of a readonly array
```

This behavior also works for objects:

```mylang
var obj = { a: 1, b: 2 } as readonly;

// obj.a = 10;  // Error: Cannot modify properties of a readonly object
// obj = {};    // Error: Cannot reassign a readonly object
```

#### Using `as const` and `as readonly`

```mylang
var config = {
  appName: "MyLang",
  version: "1.0.0"
} as const;

config.appName = "NewName"; // Allowed: Modifying propertie of the object

var data = [10, 20, 30] as readonly;

// data[0] = 100; // Error: Cannot modify elements of a readonly array
```

---

### Objects

#### Object Declaration

```mylang
var person = {
  name: "John",
  age: 30,
  greet: func() {
    return "Hi, I'm " + this.name;
  }
};

coreio.print(person.greet()); // Hi, I'm John
```

#### Nested Objects

```mylang
var nested = {
  outer: {
    inner: {
      value: 42
    }
  }
};

coreio.print(nested.outer.inner.value); // 42
```

---

### Control Structures

#### If-Else

```mylang
var x = 10;

if (x > 5) {
  coreio.print("x is greater than 5");
} else {
  coreio.print("x is less than or equal to 5");
}
```

#### While Loop

```mylang
var count = 5;

while (count > 0) {
  coreio.print("Countdown:", count);
  count--;
}
```

#### For Loop

```mylang
for (var i = 0; i < 3; i++) {
  coreio.print("Iteration:", i);
}
```

---

### Error Handling

#### Try-Catch

```mylang
try {
  var result = import("nonexistent");
} catch (err) {
  coreio.print("Error:", err);
}
```

#### Finally

```mylang
try {
  coreio.print("Try block");
} finally {
  coreio.print("Finally block");
}
```

---

## Import System

MyLang supports importing modules from local files or URLs.

#### Local Import

```mylang
import "./utils.ml";
import (
  utilName: "./utils.ml"
);

coreio.print(utils.add(5, 15), utilName.add); // 20, function
```

#### HTTP Import

```mylang
import("http://example.com/module.ml");
```

#### Import Details

```mylang
coreio.print(import.base); // Project root directory
coreio.print(import.cache); // Cached modules
coreio.print(import.resolve("module.ml")); // Resolve file path
```

---

## Operators

### Arithmetic Operators

```mylang
coreio.print(5 + 3, 5 - 3, 5 * 3, 5 / 3, 5 % 3);
// 8, 2, 15, 1.6666666666666667, 2
```

### Comparison Operators

```mylang
coreio.print(5 > 3, 5 == 3, 5 != 3);
// true, false, true
```

### Logical Operators

```mylang
coreio.print(true && false, true || false, !true);
// false, true, false
```

---

## Examples

### Object with Methods

```mylang
var car = {
  make: "Toyota",
  model: "Corolla",
  getDetails: func() {
    return this.make + " " + this.model;
  }
};

coreio.print(car.getDetails()); // Toyota Corolla
```

### Array Iteration

```mylang
var fruits = ["Apple", "Banana", "Orange"];

for (var i = 0; i < fruits.length; i++) {
  coreio.print(fruits[i]);
}
```

#### Enum Methods

```mylang
coreio.print(Status.getByName("Offline")); // ["Offline", { value: 1, description: "Offline status user" }]
coreio.print(Status.getByName("NonExistent")); // nil
```

#### Enum with Mixed Content

```mylang
enum Action {
  SempaiJS = 7;
  Angel = {};
  Mz = func main() {};
}

// Action = "Invalid"; // Error: Enums are immutable
coreio.print(Action.SempaiJS); // 7
coreio.print(Action.Angel);    // {}
```

#### Auto-Incrementing Enums

```mylang
enum Number {
  One = 1;
  Two;    // 2
  Three;  // 3
}

coreio.print(Number.One, Number.Two, Number.Three); // 1, 2, 3
```

---

### Pattern Matching (`match`)

MyLang provides a powerful `match` expression for pattern matching, similar to a `switch` statement in other languages.

```mylang
func findInt(number) {
  match(number) {
    case (1): return "One";
    case (2): return "Two";
    case (3):
    case (4):
    case (5): return "3, 4 and 5";
    default: return "unknown";
  }
}

coreio.print(
  findInt(1), // One
  findInt(2), // Two
  findInt(3), // 3, 4 and 5
  findInt(6)  // unknown
);
```

### Using Enums and Match Together

```mylang
func getStatusDescription(status) {
  match(status) {
    case (Status.Online): return Status.Online.description;
    case (Status.Offline): return Status.Offline.description;
    default: return "Unknown status";
  }
}

coreio.print(
  getStatusDescription(Status.Online),  // Online status
  getStatusDescription(Status.Offline), // Offline status user
  getStatusDescription(nil)             // Unknown status
);
```

---

### Enums

**Enums** in MyLang allow you to define a set of named constants and associated values or methods. Enums can contain simple values, objects, or even functions.

#### Declaring an Enum

```mylang
enum Status {
  Online = { value: 0, description: "Online status" };
  Offline = { value: 1, description: "Offline status user" };

  func getByName(val) {
    var allStatus = objects.entries(this);
    for (var i = 0; i < arrays.count(allStatus) - 1; i++) {
      if (allStatus[i][0] == val) {
        return allStatus[i];
      }
    }
    return nil;
  };
}
```

#### Accessing Enum Values

```mylang
coreio.print(Status.Online); // { value: 0, description: "Online status" }
coreio.print(Status.Offline); // { value: 1, description: "Offline status user" }
```

---

## CLI Commands

### Command Overview

- **Run a File**
  ```bash
  mylang <file.ml>
  ```
- **Initialize Project**
  ```bash
  mylang init
  ```
- **Start REPL**
  ```bash
  mylang repl
  ```
- **Version**
  ```bash
  mylang version
  ```

---

## Contributing

We welcome contributions!

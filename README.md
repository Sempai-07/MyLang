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

coreio.print(utils.add(5, 15)); // 20
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

### Pipeline Operations

```mylang
var result = 10
  |> func(x) { return x * 2 }
  |> func(x) { return x + 5 };

coreio.print(result); // 25
```

### Array Iteration

```mylang
var fruits = ["Apple", "Banana", "Orange"];

for (var i = 0; i < fruits.length; i++) {
  coreio.print(fruits[i]);
}
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

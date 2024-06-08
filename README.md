# MyLang

Welcome `MyLang`, a powerful and flexible programming language designed to be easy to read and write. This document will guide you through the basics of `MyLang`, explaining its syntax, functions, and usage through examples.

## Table of Contents

1. [Introduction](#introduction)
2. [Variable Declarations](#variable-declarations)
3. [Imports](#imports)
4. [Objects](#objects)
5. [Functions](#functions)
6. [Main Function](#main-function)
7. [Printing and Comparison](#printing-and-comparison)
8. [Expressions](#expressions)

## Introduction

```warn
This is a test and simultaneously a humorous (or joke) language
```

`MyLang` is a modern programming language with a syntax designed to be clear and concise. This document will explain the various elements of the language and how they are used in a sample program.

## Variable Declarations

Variables in MyLang can be declared using the `var` keyword. Here is an example:

```js
var var_bool = true;
var var_int = 45;
var var_floot = 6.7;
var var_string = "Hello world";
var var_object = {
  var_bool,
  var_int,
  var_floot,
  var_string,
  key: var_string,
};

var wait;
wait = var_object;
```

## Imports

MyLang allows you to import standard libraries or custom modules. The import syntax is as follows:

```js
import "coreio";
coreio.print("Hello world");
```

```js
import("coreio");
coreio.print("Hello world");
```

```js
var text = "coreio";
import (
  std: text,
  std2: "coreio",
  "coreio",
);

std.print("Hello world");
std2.print("Hello world");
coreio.print("Hello world");
```

## Objects

Objects in MyLang can be created using curly braces `{}`. Here is an example of creating objects:

```js
import "coreio";

var object_1 = {
  coreio,
  how: "Yes",
};

var object_2 = {
  coreio: coreio,
  how: "Yes",
};

var object_3 = {
  coreio: coreio,
  how: "No",
};

object_1 == object_2; // true
object_1 == object_3; // false
object_2 == object_3; // false
```

## Functions

Functions in MyLang are declared using the `func` keyword. Here is an example of a simple function:

```js
import "coreio";

func get(text, text2) {
  coreio.print(text2);
  return text;
}
```

The `get` function takes a single parameter `text`, `text2` and returns it.

## Main Function

The `main` function is the entry point of a MyLang program. Here is an example:

```js
func main() {
  var variable;
  coreio.print(variable); // undefined
  variable = true;
  coreio.print(variable); // true
  variable = 90;
  coreio.print(variable); // 90
  variable = "Hellow";
  std.print("Hellow world");
  coreio.print(get(variable), !true, !false, -5, 5 + true);
  return;
}
```

In the `main` function, we declare a variable `variable` and assign it different values. We also use the `print` function from the `coreio` modules to output these values.

## Printing and Comparison

MyLang supports printing and comparison operations. Here is an example:

```js
var left_number = 5;
var right_number = 50;

coreio.print(
  left_number,
  right_number,
  left_number != right_number,
  left_number == right_number,
  left_number > right_number,
  left_number < right_number,
  left_number >= right_number,
  left_number <= right_number,
);
```

This line prints the values of `left_number` and `right_number`, as well as the results of various comparison operations between `left_number` and `right_number`.

## Expressions

MyLang allows complex expressions and nested function calls. Here are some examples:

```js
std.print(5 * 7 + ("str" + "str2") + 6 / 80000000, axios("7"));
coreio.print(5 * 7 + ("str" + "str2") + 6 / 80000000);
```

These lines print the results of arithmetic operations and string concatenations.

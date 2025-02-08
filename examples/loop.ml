import "ds";
import "coreio";

var seconds = 10;

coreio.print("Start time");

while (seconds > 0) {
  coreio.print("Left:", seconds);
  seconds--;
}

coreio.print("End time!");

func countdownWithConditions() {
  var count = 10;
  
  while (count > 0) {
    if (count == 5) {
      coreio.print("Пропускаем число 5");
      count--;
      continue;
    }

    coreio.print("Number:", count);

    if (count == 3) {
      coreio.print("We reached number 3, we complete the cycle");
      break;
    }

    count--;
  }

  coreio.print("Returning the result!");
  
  return "The cycle is complete!";
}

coreio.print(countdownWithConditions());

// ------- FOR -------

for (var i = 0; i < 10; i++) {
  if (i == 5) {
    coreio.print("Reached 5, exit the cycle");
    break;
  }
  coreio.print("Number:", i);
}

for (var i = 0; i < 7; i++) {
  if ((i % 2) == 0) {
    continue;
  }
  coreio.print("Odd number:", i);
}

func findFirstDivisibleBy3() {
  for (var i = 1; i <= 10; i++) {
    if ((i % 3) == 0) {
      return "The first number divisible by 3: " + i;
    }
  }
  return false;
}

coreio.print(findFirstDivisibleBy3());

for (var i = 10; i >= 0; i--) {
  coreio.print("Countdown:", i);
}

var fruits = ["Apple", "Banana", "Orange"];

for (var i = 0; i < fruits.length; i++) {
  coreio.print("Fruit:", fruits[i]);
}

// ------- In -------

var obj = {
  key1: 1,
  key2: 2,
  key3: 3,
}

for (var k in obj) {
  coreio.print(k, obj[k]); // key1 - 1, key2 - 2, key3 - 3
}

var arr = [10, 20, 30];

for (var i in arr) {
  coreio.print(i); // 10, 20, 30
}

var hash = ds.Hash();

hash.set("key1", 600);
hash.set("key2", 6000);
hash.set("key3", 60000);

for (var key in hash) {
  coreio.print(key); // key1, key2, key3
}

// ------- Match -------

func findInt(number) {
  match(number) {
    case (1): return "One";
    case (2): { return "Two"; }
    case (3):
    case (4):
    case (5): return "3, 4 and 5"
    default: return "unknown";
  }
}

coreio.print(
  findInt(), // unknown 
  findInt(1), // One
  findInt(2), // Two
  findInt(3), // 3, 4 and 5
  findInt(4), // 3, 4 and 5
  findInt(5), // 3, 4 and 5
  findInt(6), // unknown
);
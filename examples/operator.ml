import "coreio";

coreio.print(
  "List operator:",
  1 + 5, // 6
  1 - 5, // -4
  1 * 5, // 5
  1 / 5, // 0.2
  1 % 5, // 1
  1 == 5, // false
  1 != 5, // true
  1 > 5, // false
  1 < 5, // true
  1 >= 5, // false
  1 <= 5, // true
  1 & 5, // 1
  1 && 5, // 5
  1 | 5, // 5
  1 || 5 // 1
);

var index = 0;

index -= 1; // -1
index += 1; // 0

index = nil;

coreio.print("Assignment:", index); // nil

index = 0;

coreio.print(
  "Assignment operator:", 
  index, // 0
  index++, // 0 (1)
  index-- // 1 (2)
);

func square(number) {
  return number * number;
}

var result = 100
 |> func(number) { return number * 2 }
 |> func div(number) { return number / 2 }
 |> square
 
coreio.print("PipeLine:", result); // 200

coreio.print("Ternary 1", true ? 1 : 0); // 1
coreio.print("Ternary 2", false ? 1 : 0); // 0

coreio.print(
  "VisitUnary", 
  !true, // false
  !false, // true
  +"4", // 4 (int)
  -"4" // -4 (int)
);
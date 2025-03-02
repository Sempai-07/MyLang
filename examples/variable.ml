import "coreio";

var n1;
var n2 = nil;

coreio.print(n1, n2); // nil, nil

n1 = 1;
n2 = 2;

coreio.print(n1, n2); // 1, 2

n1 -= 1;
n2 += 2;

coreio.print(n1, n2); // 0, 4

n1++;
n2++;

coreio.print(n1, n2); // 1, 5

n1 = {};
n2 = {};

coreio.print(n1, n2); // {}, {}

n1["n1"] = 1;
n2["n2"] = [1, 2];

coreio.print(n1, n2); // { n1: 1 }, { n2: [1, 2] }

n2["n2"][2] = [1, 2];

coreio.print(n2); // { n2: [1, 2, [1, 2]] }

var constant = 10 as const;

// constant = 5; Error

var arr = [] as const; // Or any type

arr[0] = 100; // Good

// arr = {} Error

var arr1 = [1, 2, 3] as readonly; // Or object

// arr1 = {} Error

// arr1[0] = 0 Error

var (
  a,
  b = 1,
  c = 2 as readonly,
  v = a as const
);

coreio.print(a, b, c, v); // nil, 1, 2, null

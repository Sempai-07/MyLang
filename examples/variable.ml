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
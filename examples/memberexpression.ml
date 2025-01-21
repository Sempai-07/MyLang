import "coreio";

var object = {
  n1: "test",
  n2: "test2",
  n3: {
    n4: "test4",
    n5: [1, 2, 3],
    n6: func() {
      return this.n5;
    }
  },
  n4: func() {
    return this.n3.n5;
  }
}

coreio.print(
  "MemberExpression Object", 
  object,
  object.n1, // test
  object["n2"], // test2
  object["n3"].n4, // test4
  object["n3"]["n5"], // [1, 2, 3]
  object["n3"]["n6"](), // [1, 2, 3]
  object.n4(), // [1, 2, 3]
  object.n5, // nil
  object["n5"], // nil
);

var callObj = object.n4();

coreio.print(
  "MemberExpression Array", 
  callObj[0] // 1
  callObj[2], // 3
  callObj[3] // nil
);

var array = [func() { return this }];

coreio.print("Array This", array[0]()); // [function anonymous]
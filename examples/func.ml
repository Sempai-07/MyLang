import "coreio";

func add(a, b) {
  return a + b, a, b;
}

coreio.print("Func add:", add(1, 2)); // [3, 1, 2]

func args(name, name1) {
  return arguments;
}

coreio.print("Func args:", args("SempaiJS", "Sempa1JS"), args("SempaiJS")); // ["SempaiJS", "Sempa1JS"], ["SempaiJS"]

func rest(arg, ...args) {
  return arg, args;
}

coreio.print(rest(1, 2, 3, 4, 5, 6)); // [1, [2, 3, 4, 5, 6]]

func defaults(count = 1000) {
  return count;
}

coreio.print("Func default:", defaults(), defaults(nil), defaults(1)); // [1000, 1000, 1]

func defaultNil(name) {
  return name;
}

coreio.print("Func default nil:", defaultNil("name"), defaultNil()); // name, nil

var obj = {
  name: func() {
    return "name";
  },
  name1: func name1() {
    return "name1";
  }
}

coreio.print("Func obj", obj.name(), obj.name1()); // name, name1

var name = func() {
  return "name";
}

var name1 = func name1() {
  return "name1";
}

coreio.print("Func variable", name(), name1()); // name, name1

var rest1 = func(arg, ...args) {
  return arg, args;
}

coreio.print(rest1(1, 2, 3, 4, 5, 6)); // [1, [2, 3, 4, 5, 6]]

var MyClass = func(name) {
  this.name = name;
  
  return {
   getName: func() {
     return this.name;
   },
   setName: func(name) {
     this.name = name;
     return name;
   }
  }
}

var Vova = MyClass("SempaiJS");

coreio.print("Name Class:", Vova.getName()); // SempaiJS

Vova.setName("Hello");

coreio.print("Name Class:", Vova.getName()); // Hello

import "coreio";

func add(a, b) {
  return a + b, a, b;
}

coreio.print("Func add:", add(1, 2)); // [3, 1, 2]

func args(name, name1) {
  return arguments;
}

coreio.print("Func args:", args("SempaiJS", "Sempa1JS"), args("SempaiJS")); // ["SempaiJS", "Sempa1JS"], ["SempaiJS"]

func default(count = 1000) {
  return count;
}

coreio.print("Func default:", default(), default(nil), default(1)); // [1000, 1000, 1]

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

coreio.print("Func obj", obj.name(), obj.name1());

var name = func() {
  return "name";
}

var name1 = func name1() {
  return "name1";
}

coreio.print("Func variable", name(), name1());
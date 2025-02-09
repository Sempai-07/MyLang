import "coreio";
import "iter";

for (var i in iter.Iterator([0, 1, 2])) {
  coreio.print(i);
}

for (var key in iter.Iterator({ key1: 1, key2: 2, key3: 3 })) {
  coreio.print(key);
}

var obj = {
  key1: 100,
  key2: 200,
  key3: 300,
  [iter.symbol]: func(obj) {
    return iter.Iterator(this); // Or obj
  }
}

for (var key in obj) {
  coreio.print(key);
}

var arr = [0, 1, 2];

arr[iter.symbol] = func(arr) {
  return iter.Iterator(this); // Or arr
}

for (var i in arr) {
  coreio.print(i);
}

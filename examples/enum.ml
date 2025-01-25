import "coreio";
import "arrays";
import "objects";

enum Status {
  Online = { value: 0, description: "Online status" };
  Offline = { value: 1, description: "Offline status user" };
  
  func getByName(val) {
    var allStatus = objects.entries(this);
    for (var i = 0; i < arrays.count(allStatus) - 1; i++) {
      if (allStatus[i][0] == val) {
        return allStatus[i];
      }
    }
    return nil;
  };
}

coreio.print(Status.getByName("Offline"));
coreio.print(Status.getByName("Offlie"));
coreio.print(Status.getByName("getByName"));

enum Action {
  SempaiJS = 7; 
  Angel = {};
  Mz = func main() {};
}

// Action = "SempaiLox"; Error

coreio.print(Status, Action);

enum Number {
  One = 1;
  Two; // 2
  Three; // 3
}

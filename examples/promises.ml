import "https";
import "promises";
import "math";
import "numbers";
import "coreio";

func getRequest(url) {
  return promises.Task(func(resolve, reject) {
    try {
      var data = https.request(url, "POST");
      resolve({ status: "ok", data });
    } catch(err) {
      reject({ status: "failed", err });
    }
  });
}

var result = getRequest("https://google.com");
// TODE: ...

func randomCrash() {
  if (numbers.toFixed(math.random(), 1) > 0.5) {
    return promises.resolve(true);
  } else {
    return promises.reject(true);
  }
}

await randomCrash();

async func a() {
  return 1;
}

async func b() {
  return await a();
}

async func c() {
  await a();
  return await b();
}

coreio.print(await c());
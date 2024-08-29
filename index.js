const { Interpreter, run } = require("./dist/index.js");

// const code = `
// var variable = "Sempai-07";
//
// func add() {
//   6
// }
//
// func yes(ad) {
//   ad(6, 8)
// }
//
// print("Hello world", (5 + 6), add(5, 7, (7/6), variable), variable, var index = add(9, variable, variable = "Sempai"), yes(add));
//
// var mutable = 50;
// print(mutable);
// mutable = 100 + 8;
// print(mutable)
//
// func remove(and) {
//   mutable = mutable - 1;
//   print(and(), mutable);
// }
//
// remove(func() {
//   mutable = mutable == mutable;
// });
//
// `;
//
// const code = `
// func return(result) {
//   result
// }
// func add(a, b, c) {
//   return(a + b + c);
// }
// print(add(1, 100000000000000, add(8, 700000)));
// `

// const code = `
// func once(callback) {
//   print(callback)
// }
//
// once(print(50))
// `

// const code = `
// 6 + 7
// `;

// const code = `
// "" && print("Hello world") + 5 && !0
// print("" && print("Hello world") + 5 && !0);
// 
// (func main() { print("Hello world"); })();
// `;

const code = `
import "coreio";

print("Version MyLang:", coreio.version());
`;

const result = run(code, [process.cwd() + "/index.ml"]);
console.log(result.ast);
new Interpreter(result.ast).run();

// console.log(result);

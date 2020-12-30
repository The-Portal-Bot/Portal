const { group, test, command, beforeStart, afterAll, expect } = require("corde");
const { client, loginBot } = require("..");

// beforeStart(() => {
//   loginBot();
// });

group("main commands", () => {
  test("hello command should return 'Hello!!'", () => {
    expect("hello").toReturn("Hello!!");
  });
});

afterAll(() => {
  client.destroy();
});
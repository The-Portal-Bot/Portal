const Roll = require('roll');

describe('mod_library', () => {
  it('1d6 must return a number between 1 and 6', () => {
    const roll_lib = new Roll();
    const roll = roll_lib.roll('1d6');

    const rollResult = parseInt(roll.result);

    expect(rollResult).toBeGreaterThanOrEqual(1);
    expect(rollResult).toBeLessThan(7);
  });

  it('3d2+3 must return a number between 6 and 9', () => {
    const roll_lib = new Roll();
    const roll = roll_lib.roll('3d2+3');

    const rollResult = parseInt(roll.result);

    expect(rollResult).toBeGreaterThanOrEqual(6);
    expect(rollResult).toBeLessThan(10);
  });

  it('1d50+1d20 must return a number between 2 and 70', () => {
    const roll_lib = new Roll();
    const roll = roll_lib.roll('1d50+1d20');

    const rollResult = parseInt(roll.result);

    expect(rollResult).toBeGreaterThanOrEqual(2);
    expect(rollResult).toBeLessThan(71);
  });
});

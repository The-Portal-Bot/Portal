Roll = require('roll');

test('1d6 must return a number between 1 and 6', () => {
    const roll_lib = new Roll();
    const roll = roll_lib.roll('1d6');
    expect(parseInt(roll.result)).toBeGreaterThanOrEqual(1);
    expect(parseInt(roll.result)).toBeLessThan(7);
});

test('3d2+3 must return a number between 6 and 9', () => {
    const roll_lib = new Roll();
    const roll = roll_lib.roll('3d2+3');
    expect(parseInt(roll.result)).toBeGreaterThanOrEqual(6);
    expect(parseInt(roll.result)).toBeLessThan(10);
});

test('1d50+1d20 must return a number between 2 and 70', () => {
    const roll_lib = new Roll();
    const roll = roll_lib.roll('1d50+1d20');
    expect(parseInt(roll.result)).toBeGreaterThanOrEqual(2);
    expect(parseInt(roll.result)).toBeLessThan(71);
});
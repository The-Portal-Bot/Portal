const roll = require('../../build/commands/roll.js');

test('1d6 must return a number between 1 and 6', () => {
    roll(null, null, ['1d6']).then(result => {
        expect(parseInt(result.value.substr(0, 1))).toBeGreaterThanOrEqual(1);
        expect(parseInt(result.value.substr(0, 1))).toBeLessThan(7);
    });
});

test('3d2+3 must return a number between 6 and 9', () => {
    roll(null, null, ['3d2+3']).then(result => {
        expect(parseInt(result.value.substr(0, 1))).toBeGreaterThanOrEqual(6);
        expect(parseInt(result.value.substr(0, 1))).toBeLessThan(10);
    });
});

test('1d50+1d20 must return a number between 2 and 70', () => {
    roll(null, null, ['1d50+1d20']).then(result => {
        expect(parseInt(result.value.substr(0, 2))).toBeGreaterThanOrEqual(2);
        expect(parseInt(result.value.substr(0, 2))).toBeLessThan(71);
    });
});
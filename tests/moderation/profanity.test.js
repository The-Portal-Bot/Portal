const modOps = require('../../build/libraries/modOps');

test('fuck must return true', () => {
    expect(modOps.isProfane('fuck')).toBe(true);
});

test('sample must return true', () => {
    expect(modOps.isProfane('sample')).toBe(false);
});

test('fuckshit must return true', () => {
    expect(modOps.isProfane('fuckshit')).toBe(true);
});

test('πούτσα must return true', () => {
    expect(modOps.isProfane('πούτσα')).toBe(true);
});

test('καλημέρα must return true', () => {
    expect(modOps.isProfane('καλημέρα')).toBe(false);
});

test('πουτσομπανάνα must return true', () => {
    expect(modOps.isProfane('πουτσομπανάνα')).toBe(true);
});
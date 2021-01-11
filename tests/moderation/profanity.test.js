const modOps = require('../../build/libraries/modOps');

test('fuck must return true', () => {
    expect(modOps.isProfane('fuck').length > 0 || false).toBe(true);
});

test('sample must return true', () => {
    expect(modOps.isProfane('sample').length > 0 || false).toBe(false);
});

test('fuckshit must return true', () => {
    expect(modOps.isProfane('fuckshit').length > 0 || false).toBe(true);
});

test('πούτσα must return true', () => {
    expect(modOps.isProfane('πούτσα').length > 0 || false).toBe(true);
});

test('καλημέρα must return true', () => {
    expect(modOps.isProfane('καλημέρα').length > 0 || false).toBe(false);
});

test('πουτσομπανάνα must return true', () => {
    expect(modOps.isProfane('πουτσομπανάνα').length > 0 || false).toBe(true);
});

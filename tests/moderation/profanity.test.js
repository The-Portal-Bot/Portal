const mod_library = require('../../build/libraries/mod.library');

test('fuck must return true', () => {
    expect(mod_library.isProfane('fuck').length > 0 || false).toBe(true);
});

test('sample must return false', () => {
    expect(mod_library.isProfane('sample').length > 0 || false).toBe(false);
});

test('fuckshit must return true', () => {
    expect(mod_library.isProfane('fuckshit').length > 0 || false).toBe(true);
});

test('πούτσα must return true', () => {
    expect(mod_library.isProfane('πούτσα').length > 0 || false).toBe(true);
});

test('καλημέρα must return false', () => {
    expect(mod_library.isProfane('καλημέρα').length > 0 || false).toBe(false);
});
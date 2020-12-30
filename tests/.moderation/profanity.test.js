const profanity = require('../../src/moderation/profanity.js');

test('fuck must return true', () => {
	expect(profanity('fuck')).toBe(true);
});

test('sample must return true', () => {
	expect(profanity('sample')).toBe(false);
});

test('fuckshit must return true', () => {
	expect(profanity('fuckshit')).toBe(true);
});

test('πούτσα must return true', () => {
	expect(profanity('πούτσα')).toBe(true);
});

test('καλημέρα must return true', () => {
	expect(profanity('καλημέρα')).toBe(false);
});

test('πουτσομπανάνα must return true', () => {
	expect(profanity('πουτσομπανάνα')).toBe(true);
});
const roll = require('../../src/commands/roll.js');

test('1d6 must return a number between 1 and 6', () => {
	roll(null, null, ['1d6']).then(result => {
		expect(result).toBeGreaterThanOrEqual(1);
		expect(result).toBeLessThan(7);
	})
	.catch(error => console.log('error :>> ', error));
});

test('3d12+5 must return a number between 6 and 42', () => {
	roll(null, null, ['3d12+5']).then(result => {
		expect(result).toBeGreaterThanOrEqual(6);
		expect(result).toBeLessThan(43);
	})
	.catch(error => console.log('error :>> ', error));
});

test('2d50+4d25 must return a number between 2 and 200', () => {
	roll(null, null, ['2d50+4d25']).then(result => {
		expect(result).toBeGreaterThanOrEqual(2);
		expect(result).toBeLessThan(201);
	})
	.catch(error => console.log('error :>> ', error));
});


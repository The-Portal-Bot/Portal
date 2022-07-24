const mod_library = require('../../build/libraries/mod.library');

describe('mod_library', () => {
    it('should return true if given word is "fuck"', () => {
        const wordToTest = 'fuck';

        const isProfaneResult = mod_library.isProfane(wordToTest);

        expect(isProfaneResult).toHaveLength(1);
    });

    it('should return true if given word is "sample"', () => {
        const wordToTest = 'sample';

        const isProfaneResult = mod_library.isProfane(wordToTest);

        expect(isProfaneResult).toHaveLength(0);
    });

    it('should return true if given word is "fuckshit"', () => {
        const wordToTest = 'fuckshit';

        const isProfaneResult = mod_library.isProfane(wordToTest);

        expect(isProfaneResult).toHaveLength(1);
    });

    it('should return true if given word is "πούτσα"', () => {
        const wordToTest = 'πούτσα';

        const isProfaneResult = mod_library.isProfane(wordToTest);

        expect(isProfaneResult).toHaveLength(1);
    });

    it('should return true if given word is "καλημέρα"', () => {
        const wordToTest = 'καλημέρα';

        const isProfaneResult = mod_library.isProfane(wordToTest);

        expect(isProfaneResult).toHaveLength(0);
    });
});

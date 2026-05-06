import { DEFAULT_CARD_BACK_THEME, getCardBackTheme } from './cardBackTheme';

describe('cardBackTheme', () => {
    test('provides default Ginza card back theme without face-up card metadata', () => {
        const theme = getCardBackTheme();

        expect(theme).toEqual(DEFAULT_CARD_BACK_THEME);
        expect(theme.id).toBe('default-ginza');

        const serialized = JSON.stringify(theme);
        expect(serialized).not.toContain('geishaId');
        expect(serialized).not.toContain('itemLabel');
        expect(serialized).not.toContain('itemImageUrl');
        expect(serialized).not.toContain('itemIconUrl');
        expect(serialized).not.toContain('charm');
    });
});

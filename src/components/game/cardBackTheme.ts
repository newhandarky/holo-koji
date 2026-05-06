export interface CardBackTheme {
    id: 'default-ginza';
    label: string;
    className: string;
    accent: string;
}

export const DEFAULT_CARD_BACK_THEME: CardBackTheme = {
    id: 'default-ginza',
    label: 'Default Ginza Card Back',
    className: 'opening-deal-card-back--default-ginza',
    accent: 'warm-gold'
};

export const getCardBackTheme = (): CardBackTheme => DEFAULT_CARD_BACK_THEME;

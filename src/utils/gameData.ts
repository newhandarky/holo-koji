import { characterProfilesBySet, CharacterProfile, Geisha, GeishaSet, ItemCard } from "@newhandarky/hanakoji-game-types"

export interface ItemIconDefinition {
    key: string;
    label: string;
    glyph: string;
    accentClassName: string;
    fallbackLabel: string;
    imageUrl?: string;
}

const buildUnknownItemIconDefinition = (itemType: string): ItemIconDefinition => ({
    key: `unknown:${itemType}`,
    label: itemType,
    glyph: '?',
    accentClassName: 'item-icon--unknown',
    fallbackLabel: '未知道具'
});

const ginzaItemDefinitions: Record<string, ItemIconDefinition> = {
    sake_01: {
        key: 'default:sake_01',
        label: 'Sake 01',
        glyph: '酒',
        accentClassName: 'item-icon--gold',
        fallbackLabel: '酒',
        imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/%E9%8A%80%E5%BA%A7-ICON/1777617306158-0263adb6-f340-46f9-86d6-0af83cdc0693-ChatGPT-Image-2026-5-1-02_20_07.png'
    },
    sake_02: {
        key: 'default:sake_02',
        label: 'Sake 02',
        glyph: '酒',
        accentClassName: 'item-icon--coral',
        fallbackLabel: '酒',
        imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/%E9%8A%80%E5%BA%A7-ICON/1777617306158-012e2f1c-59e5-422c-92f5-c2d836144343-ChatGPT-Image-2026-5-1-02_23_19.png'
    },
    sake_03: {
        key: 'default:sake_03',
        label: 'Sake 03',
        glyph: '酒',
        accentClassName: 'item-icon--plum',
        fallbackLabel: '酒',
        imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/%E9%8A%80%E5%BA%A7-ICON/1777617306158-fed18579-b61e-4e96-b3ea-38aedbb1801a-ChatGPT-Image-2026-5-1-02_11_49.png'
    },
    sake_04: {
        key: 'default:sake_04',
        label: 'Sake 04',
        glyph: '酒',
        accentClassName: 'item-icon--violet',
        fallbackLabel: '酒',
        imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/%E9%8A%80%E5%BA%A7-ICON/1777617306158-5b3899fd-2738-420f-9069-aa1f7134f55c-ChatGPT-Image-2026-5-1-02_31_22.png'
    },
    sake_05: {
        key: 'default:sake_05',
        label: 'Sake 05',
        glyph: '酒',
        accentClassName: 'item-icon--jade',
        fallbackLabel: '酒',
        imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/%E9%8A%80%E5%BA%A7-ICON/1777617306158-43d08d05-b5ba-4c51-b6ad-d7015306c8f7-ChatGPT-Image-2026-5-1-02_25_06.png'
    },
    sake_06: {
        key: 'default:sake_06',
        label: 'Sake 06',
        glyph: '酒',
        accentClassName: 'item-icon--sun',
        fallbackLabel: '酒',
        imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/%E9%8A%80%E5%BA%A7-ICON/1777617306158-2ef254e2-0aad-4286-98d8-c261fc9e33ed-ChatGPT-Image-2026-5-1-02_27_04.png'
    },
    sake_07: {
        key: 'default:sake_07',
        label: 'Sake 07',
        glyph: '酒',
        accentClassName: 'item-icon--ice',
        fallbackLabel: '酒',
        imageUrl: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/%E9%8A%80%E5%BA%A7-ICON/1777617306158-434f9580-6456-45aa-b5df-3d91a36c1a52-ChatGPT-Image-2026-5-1-02_28_43.png'
    }
};

const ginzaPositionItemTypes = Object.keys(ginzaItemDefinitions).sort();

const charmPointsDistribution = [2, 2, 2, 3, 3, 4, 5];

export function getCharacterProfilesForSet(geishaSet: GeishaSet): CharacterProfile[] {
    return characterProfilesBySet[geishaSet] ?? characterProfilesBySet.default;
}

export function createRandomizedGeishas(_geishaSet?: GeishaSet): Geisha[] {
    return charmPointsDistribution.map((charmPoints, index) => ({
        id: index + 1,
        name: `藝妓 ${index + 1}`,
        charmPoints,
        imageUrl: '',
        controlledBy: null,
    }));
}

export function getItemIconDefinitionByType(itemType: string, _geishaSet?: GeishaSet): ItemIconDefinition {
    return ginzaItemDefinitions[itemType] ?? buildUnknownItemIconDefinition(itemType);
}

export function getItemIconDefinitionByPosition(positionIndex: number, geishaSet?: GeishaSet): ItemIconDefinition {
    const normalizedIndex = Math.max(1, Math.floor(positionIndex));
    const mappedType = ginzaPositionItemTypes[normalizedIndex - 1];

    if (!mappedType) {
        return buildUnknownItemIconDefinition(`position-${normalizedIndex}`);
    }

    return getItemIconDefinitionByType(mappedType, geishaSet);
}

export function getGeishaNameById(geishaId: number, _geishaSet?: GeishaSet): string {
    return `藝妓 ${geishaId}`;
}

export function getGeishaCharmById(geishaId: number): number {
    return charmPointsDistribution[geishaId - 1] ?? 0;
}

export function getGeishaCardImageById(_geishaId: number, _geishaSet?: GeishaSet): string {
    return '';
}

export function getItemCardImage(card: ItemCard, geishaSet?: GeishaSet): string {
    return card.itemImageUrl?.trim() || getGeishaCardImageById(card.geishaId, geishaSet);
}

export function getItemCardLabel(card: ItemCard, geishaSet?: GeishaSet): string {
    return card.itemLabel?.trim() || getGeishaNameById(card.geishaId, geishaSet);
}

export function getItemIconDefinitionForCard(card: ItemCard, geishaSet?: GeishaSet): ItemIconDefinition {
    if (card.itemIconUrl?.trim()) {
        return {
            key: `${card.itemAssetName ?? card.type}:${card.itemIconUrl}`,
            label: card.itemLabel?.trim() || card.type,
            glyph: card.itemLabel?.trim()?.slice(0, 1) || '酒',
            accentClassName: 'item-icon--gold',
            fallbackLabel: card.itemLabel?.trim() || card.type,
            imageUrl: card.itemIconUrl.trim()
        };
    }

    return getItemIconDefinitionByType(card.type, geishaSet);
}

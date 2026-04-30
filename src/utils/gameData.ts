import { Geisha, GeishaSetKey } from "game-shared-types"

// 取得部署時的靜態資源基底路徑（支援 GitHub Pages）
const publicBaseUrl = process.env.PUBLIC_URL ?? '';

export interface ItemIconDefinition {
    key: string;
    label: string;
    glyph: string;
    accentClassName: string;
    fallbackLabel: string;
}

interface GeishaDisplayData {
    name: string;
    cardUrl: string;
    itemIcon: Omit<ItemIconDefinition, 'key'>;
}

const createItemIconDefinition = (geishaSet: GeishaSetKey, geishaIndex: number, itemIcon: GeishaDisplayData['itemIcon']): ItemIconDefinition => ({
    key: `${geishaSet}:geisha-${geishaIndex + 1}`,
    ...itemIcon
});

const buildUnknownItemIconDefinition = (itemType: string): ItemIconDefinition => ({
    key: `unknown:${itemType}`,
    label: itemType,
    glyph: '?',
    accentClassName: 'item-icon--unknown',
    fallbackLabel: '未知道具'
});

// 藝妓資料：名稱、手牌圖片與角色卡 icon 定義
export const geishaData: GeishaDisplayData[] = [
    {
        name: 'レイナ',
        cardUrl: `${publicBaseUrl}/images/items/origin/ina-tako.png`,
        itemIcon: { label: '章魚', glyph: '章', accentClassName: 'item-icon--coral', fallbackLabel: '章魚' }
    },
    {
        name: 'ミサキ',
        cardUrl: `${publicBaseUrl}/images/items/origin/mio-hatotaurosu.png`,
        itemIcon: { label: '神獸帽', glyph: '帽', accentClassName: 'item-icon--plum', fallbackLabel: '帽子' }
    },
    {
        name: 'ユア',
        cardUrl: `${publicBaseUrl}/images/items/origin/ayame-poyoyo.png`,
        itemIcon: { label: '妖羽', glyph: '妖', accentClassName: 'item-icon--violet', fallbackLabel: '妖羽' }
    },
    {
        name: 'エマ',
        cardUrl: `${publicBaseUrl}/images/items/origin/fubuki-konkonkon.png`,
        itemIcon: { label: '狐鈴', glyph: '狐', accentClassName: 'item-icon--ice', fallbackLabel: '狐鈴' }
    },
    {
        name: 'リオ',
        cardUrl: `${publicBaseUrl}/images/items/origin/miko-taiyaki.png`,
        itemIcon: { label: '鯛燒', glyph: '鯛', accentClassName: 'item-icon--sun', fallbackLabel: '鯛燒' }
    },
    {
        name: 'アヤ',
        cardUrl: `${publicBaseUrl}/images/items/origin/iroha-jakin.png`,
        itemIcon: { label: '邪刃', glyph: '刃', accentClassName: 'item-icon--jade', fallbackLabel: '邪刃' }
    },
    {
        name: 'ノア',
        cardUrl: `${publicBaseUrl}/images/items/origin/raden-sensu.png`,
        itemIcon: { label: '扇札', glyph: '扇', accentClassName: 'item-icon--gold', fallbackLabel: '扇札' }
    }
];

export const akatsuki: GeishaDisplayData[] = [
    {
        name: '火威青',
        cardUrl: `${publicBaseUrl}/images/items/akatsuki/ao-shanpan.png`,
        itemIcon: { label: '扇板', glyph: '扇', accentClassName: 'item-icon--jade', fallbackLabel: '扇板' }
    },
    {
        name: '潤羽るしあ',
        cardUrl: `${publicBaseUrl}/images/items/akatsuki/lushia-butterfly.jpg`,
        itemIcon: { label: '蝶飾', glyph: '蝶', accentClassName: 'item-icon--plum', fallbackLabel: '蝶飾' }
    },
    {
        name: '沙花叉クロヱ',
        cardUrl: `${publicBaseUrl}/images/items/akatsuki/sakamata-eyemask.png`,
        itemIcon: { label: '眼罩', glyph: '眼', accentClassName: 'item-icon--ice', fallbackLabel: '眼罩' }
    },
    {
        name: 'Gawr Gura',
        cardUrl: `${publicBaseUrl}/images/items/akatsuki/gura-shasha.jpg`,
        itemIcon: { label: '鯊鈴', glyph: '鯊', accentClassName: 'item-icon--coral', fallbackLabel: '鯊鈴' }
    },
    {
        name: '湊あくあ',
        cardUrl: `${publicBaseUrl}/images/items/akatsuki/aqua-neko.png`,
        itemIcon: { label: '貓飾', glyph: '貓', accentClassName: 'item-icon--violet', fallbackLabel: '貓飾' }
    },
    {
        name: '天音かなた',
        cardUrl: `${publicBaseUrl}/images/items/akatsuki/kanata-uparupa.png`,
        itemIcon: { label: '翼偶', glyph: '翼', accentClassName: 'item-icon--sun', fallbackLabel: '翼偶' }
    },
    {
        name: '桐生ココ',
        cardUrl: `${publicBaseUrl}/images/items/akatsuki/coco-incoco.jpg`,
        itemIcon: { label: '龍印', glyph: '龍', accentClassName: 'item-icon--gold', fallbackLabel: '龍印' }
    }
];

export const onesan: GeishaDisplayData[] = [
    {
        name: 'アキ・ローゼンタール',
        cardUrl: `${publicBaseUrl}/images/items/onesan-items/rosetai.jpg`,
        itemIcon: { label: '玫印', glyph: '薔', accentClassName: 'item-icon--plum', fallbackLabel: '玫印' }
    },
    {
        name: '癒月ちょこ',
        cardUrl: `${publicBaseUrl}/images/items/onesan-items/choco-fan.jpg`,
        itemIcon: { label: '甜扇', glyph: '甜', accentClassName: 'item-icon--coral', fallbackLabel: '甜扇' }
    },
    {
        name: 'ときのそら',
        cardUrl: `${publicBaseUrl}/images/items/onesan-items/ankimo.jpg`,
        itemIcon: { label: '空守', glyph: '空', accentClassName: 'item-icon--ice', fallbackLabel: '空守' }
    },
    {
        name: 'Mori Calliope',
        cardUrl: `${publicBaseUrl}/images/items/onesan-items/death-sensei.jpg`,
        itemIcon: { label: '死鐮', glyph: '死', accentClassName: 'item-icon--violet', fallbackLabel: '死鐮' }
    },
    {
        name: 'AZKi',
        cardUrl: `${publicBaseUrl}/images/items/onesan-items/guess.jpg`,
        itemIcon: { label: '星札', glyph: '星', accentClassName: 'item-icon--jade', fallbackLabel: '星札' }
    },
    {
        name: 'Elizabeth Rose Bloodflame',
        cardUrl: `${publicBaseUrl}/images/items/onesan-items/sword.jpg`,
        itemIcon: { label: '劍徽', glyph: '劍', accentClassName: 'item-icon--sun', fallbackLabel: '劍徽' }
    },
    {
        name: 'Nerissa Ravencroft',
        cardUrl: `${publicBaseUrl}/images/items/onesan-items/jial-bird.jpg`,
        itemIcon: { label: '羽印', glyph: '羽', accentClassName: 'item-icon--gold', fallbackLabel: '羽印' }
    }
];

export const collaboration: GeishaDisplayData[] = [
    {
        name: 'アキ・ローゼンタール',
        cardUrl: `${publicBaseUrl}/images/items/collaboration/gojo.png`,
        itemIcon: { label: '咒印', glyph: '咒', accentClassName: 'item-icon--ice', fallbackLabel: '咒印' }
    },
    {
        name: '癒月ちょこ',
        cardUrl: `${publicBaseUrl}/images/items/collaboration/inu.png`,
        itemIcon: { label: '犬章', glyph: '犬', accentClassName: 'item-icon--sun', fallbackLabel: '犬章' }
    },
    {
        name: 'ときのそら',
        cardUrl: `${publicBaseUrl}/images/items/collaboration/weapon.jpg`,
        itemIcon: { label: '兵裝', glyph: '兵', accentClassName: 'item-icon--jade', fallbackLabel: '兵裝' }
    },
    {
        name: 'Mori Calliope',
        cardUrl: `${publicBaseUrl}/images/items/collaboration/neko.jpg`,
        itemIcon: { label: '貓印', glyph: '貓', accentClassName: 'item-icon--coral', fallbackLabel: '貓印' }
    },
    {
        name: 'AZKi',
        cardUrl: `${publicBaseUrl}/images/items/collaboration/aqua.jpg`,
        itemIcon: { label: '水徽', glyph: '水', accentClassName: 'item-icon--ice', fallbackLabel: '水徽' }
    },
    {
        name: 'Elizabeth Rose Bloodflame',
        cardUrl: `${publicBaseUrl}/images/items/collaboration/bsg.png`,
        itemIcon: { label: '焰印', glyph: '焰', accentClassName: 'item-icon--plum', fallbackLabel: '焰印' }
    },
    {
        name: 'Nerissa Ravencroft',
        cardUrl: `${publicBaseUrl}/images/items/collaboration/candy.png`,
        itemIcon: { label: '糖章', glyph: '糖', accentClassName: 'item-icon--violet', fallbackLabel: '糖章' }
    }
];

const geishaSetMap: Record<GeishaSetKey, typeof geishaData> = {
    default: geishaData,
    akatsuki,
    onesan,
    collaboration
};

const charmPointsDistribution = [2, 2, 2, 3, 3, 4, 5];

/**
 * 創建隨機順序的藝妓陣列
 */
export function createRandomizedGeishas(geishaSet: GeishaSetKey = 'default'): Geisha[] {
    const data = geishaSetMap[geishaSet] ?? geishaData;
    const shuffledGeishas = [...data].sort(() => Math.random() - 0.5);

    return shuffledGeishas.map((geisha, index) => ({
        id: index + 1,
        name: geisha.name,
        charmPoints: charmPointsDistribution[index],
        imageUrl: '',
        controlledBy: null,
    }));
}

const getGeishaDataBySet = (geishaSet: GeishaSetKey = 'default') =>
    geishaSetMap[geishaSet] ?? geishaData;

const resolveGeishaIndexFromItemType = (itemType: string): number | null => {
    const match = /^geisha-(\d+)$/.exec(itemType.trim());
    if (!match) {
        return null;
    }

    const geishaIndex = Number(match[1]) - 1;
    return Number.isInteger(geishaIndex) && geishaIndex >= 0 ? geishaIndex : null;
};

export function getItemIconDefinitionByType(itemType: string, geishaSet: GeishaSetKey = 'default'): ItemIconDefinition {
    const data = getGeishaDataBySet(geishaSet);
    const geishaIndex = resolveGeishaIndexFromItemType(itemType);

    if (geishaIndex === null || geishaIndex >= data.length) {
        return buildUnknownItemIconDefinition(itemType);
    }

    return createItemIconDefinition(geishaSet, geishaIndex, data[geishaIndex].itemIcon);
}

// 依藝妓 ID 取得名稱
export function getGeishaNameById(geishaId: number, geishaSet: GeishaSetKey = 'default'): string {
    const data = getGeishaDataBySet(geishaSet);
    return data[geishaId - 1]?.name ?? `藝妓 ${geishaId}`;
}

// 依藝妓 ID 取得魅力值
export function getGeishaCharmById(geishaId: number): number {
    return charmPointsDistribution[geishaId - 1] ?? 0;
}

// 依藝妓 ID 取得手牌圖片網址
export function getGeishaCardImageById(geishaId: number, geishaSet: GeishaSetKey = 'default'): string {
    const data = getGeishaDataBySet(geishaSet);
    return data[geishaId - 1]?.cardUrl ?? '';
}

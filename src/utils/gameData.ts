import { Geisha, GeishaSetKey } from "game-shared-types"

// 取得部署時的靜態資源基底路徑（支援 GitHub Pages）
const publicBaseUrl = process.env.PUBLIC_URL ?? '';

// 藝妓資料：名稱與圖片網址
export const geishaData = [
    {
        name: 'レイナ',
        cardUrl: `${publicBaseUrl}/images/items/origin/ina-tako.png`
    },
    {
        name: 'ミサキ',
        cardUrl: `${publicBaseUrl}/images/items/origin/mio-hatotaurosu.png`
    },
    {
        name: 'ユア',
        cardUrl: `${publicBaseUrl}/images/items/origin/ayame-poyoyo.png`
    },
    {
        name: 'エマ',
        cardUrl: `${publicBaseUrl}/images/items/origin/fubuki-konkonkon.png`
    },
    {
        name: 'リオ',
        cardUrl: `${publicBaseUrl}/images/items/origin/miko-taiyaki.png`
    },
    {
        name: 'アヤ',
        cardUrl: `${publicBaseUrl}/images/items/origin/iroha-jakin.png`
    },
    {
        name: 'ノア',
        cardUrl: `${publicBaseUrl}/images/items/origin/raden-sensu.png`
    }
];

export const akatsuki = [
    {
        name: '火威青',
        cardUrl: `${publicBaseUrl}/images/items/akatsuki/ao-shanpan.png`
    },
    {
        name: '潤羽るしあ',
        cardUrl: `${publicBaseUrl}/images/items/akatsuki/lushia-butterfly.jpg`
    },
    {
        name: '沙花叉クロヱ',
        cardUrl: `${publicBaseUrl}/images/items/akatsuki/sakamata-eyemask.png`
    },
    {
        name: 'Gawr Gura',
        cardUrl: `${publicBaseUrl}/images/items/akatsuki/gura-shasha.jpg`
    },
    {
        name: '湊あくあ',
        cardUrl: `${publicBaseUrl}/images/items/akatsuki/aqua-neko.png`
    },
    {
        name: '天音かなた',
        cardUrl: `${publicBaseUrl}/images/items/akatsuki/kanata-uparupa.png`
    },
    {
        name: '桐生ココ',
        cardUrl: `${publicBaseUrl}/images/items/akatsuki/coco-incoco.jpg`
    }
];

export const onesan = [
    {
        name: 'アキ・ローゼンタール',
        cardUrl: `${publicBaseUrl}/images/items/onesan-items/rosetai.jpg`
    },
    {
        name: '癒月ちょこ',
        cardUrl: `${publicBaseUrl}/images/items/onesan-items/choco-fan.jpg`
    },
    {
        name: 'ときのそら',
        cardUrl: `${publicBaseUrl}/images/items/onesan-items/ankimo.jpg`
    },
    {
        name: 'Mori Calliope',
        cardUrl: `${publicBaseUrl}/images/items/onesan-items/death-sensei.jpg`
    },
    {
        name: 'AZKi',
        cardUrl: `${publicBaseUrl}/images/items/onesan-items/guess.jpg`
    },
    {
        name: 'Elizabeth Rose Bloodflame',
        cardUrl: `${publicBaseUrl}/images/items/onesan-items/sword.jpg`
    },
    {
        name: 'Nerissa Ravencroft',
        cardUrl: `${publicBaseUrl}/images/items/onesan-items/jial-bird.jpg`
    }
];

export const collaboration = [
    {
        name: 'アキ・ローゼンタール',
        cardUrl: `${publicBaseUrl}/images/items/collaboration/gojo.png`
    },
    {
        name: '癒月ちょこ',
        cardUrl: `${publicBaseUrl}/images/items/collaboration/inu.png`
    },
    {
        name: 'ときのそら',
        cardUrl: `${publicBaseUrl}/images/items/collaboration/weapon.jpg`
    },
    {
        name: 'Mori Calliope',
        cardUrl: `${publicBaseUrl}/images/items/collaboration/neko.jpg`
    },
    {
        name: 'AZKi',
        cardUrl: `${publicBaseUrl}/images/items/collaboration/aqua.jpg`
    },
    {
        name: 'Elizabeth Rose Bloodflame',
        cardUrl: `${publicBaseUrl}/images/items/collaboration/bsg.png`
    },
    {
        name: 'Nerissa Ravencroft',
        cardUrl: `${publicBaseUrl}/images/items/collaboration/candy.png`
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

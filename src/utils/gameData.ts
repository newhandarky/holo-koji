import { Geisha } from "game-shared-types"

// 取得部署時的靜態資源基底路徑（支援 GitHub Pages）
const publicBaseUrl = process.env.PUBLIC_URL ?? '';

// 藝妓資料：名稱與圖片網址
export const geishaData = [
    {
        name: '一伊那尓栖',
        imageUrl: `${publicBaseUrl}/images/geisha/ninomae-inanis.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/ina-tako.png`
    },
    {
        name: '大神ミオ',
        imageUrl: `${publicBaseUrl}/images/geisha/ookami-mio.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/mio-hatotaurosu.png`
    },
    {
        name: '百鬼あやめ',
        imageUrl: `${publicBaseUrl}/images/geisha/nakiri-ayame.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/ayame-poyoyo.png`
    },
    {
        name: '白上フブキ',
        imageUrl: `${publicBaseUrl}/images/geisha/shirakami-fubuki.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/fubuki-konkonkon.png`
    },
    {
        name: 'さくらみこ',
        imageUrl: `${publicBaseUrl}/images/geisha/sakura-miko.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/miko-taiyaki.png`
    },
    {
        name: '風真いろは',
        imageUrl: `${publicBaseUrl}/images/geisha/kazama-iroha.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/iroha-jakin.png`
    },
    {
        name: '儒烏風亭らでん',
        imageUrl: `${publicBaseUrl}/images/geisha/juufuutei-raden.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/raden-sensu.png`
    }
];

const charmPointsDistribution = [2, 2, 2, 3, 3, 4, 5];

/**
 * 創建隨機順序的藝妓陣列
 */
export function createRandomizedGeishas(): Geisha[] {
    const shuffledGeishas = [...geishaData].sort(() => Math.random() - 0.5);

    return shuffledGeishas.map((geisha, index) => ({
        id: index + 1,
        name: geisha.name,
        charmPoints: charmPointsDistribution[index],
        controlledBy: null,
    }));
}

// 依藝妓 ID 取得名稱
export function getGeishaNameById(geishaId: number): string {
    return geishaData[geishaId - 1]?.name ?? `藝妓 ${geishaId}`;
}

// 依藝妓 ID 取得圖片網址
export function getGeishaImageById(geishaId: number): string {
    return geishaData[geishaId - 1]?.imageUrl ?? '';
}

// 依藝妓 ID 取得魅力值
export function getGeishaCharmById(geishaId: number): number {
    return charmPointsDistribution[geishaId - 1] ?? 0;
}

// 依藝妓 ID 取得手牌圖片網址
export function getGeishaCardImageById(geishaId: number): string {
    return geishaData[geishaId - 1]?.cardUrl ?? '';
}

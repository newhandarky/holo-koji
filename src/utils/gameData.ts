import { Geisha, GeishaSetKey } from "game-shared-types"

// 取得部署時的靜態資源基底路徑（支援 GitHub Pages）
const publicBaseUrl = process.env.PUBLIC_URL ?? '';

// 藝妓資料：名稱與圖片網址
export const geishaData = [
    {
        name: '一伊那尓栖',
        imageUrl: `${publicBaseUrl}/images/geisha/origin/ninomae-inanis.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/origin/ina-tako.png`
    },
    {
        name: '大神ミオ',
        imageUrl: `${publicBaseUrl}/images/geisha/origin/ookami-mio.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/origin/mio-hatotaurosu.png`
    },
    {
        name: '百鬼あやめ',
        imageUrl: `${publicBaseUrl}/images/geisha/origin/nakiri-ayame.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/origin/ayame-poyoyo.png`
    },
    {
        name: '白上フブキ',
        imageUrl: `${publicBaseUrl}/images/geisha/origin/shirakami-fubuki.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/origin/fubuki-konkonkon.png`
    },
    {
        name: 'さくらみこ',
        imageUrl: `${publicBaseUrl}/images/geisha/origin/sakura-miko.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/origin/miko-taiyaki.png`
    },
    {
        name: '風真いろは',
        imageUrl: `${publicBaseUrl}/images/geisha/origin/kazama-iroha.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/origin/iroha-jakin.png`
    },
    {
        name: '儒烏風亭らでん',
        imageUrl: `${publicBaseUrl}/images/geisha/origin/juufuutei-raden.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/origin/raden-sensu.png`
    }
];

export const akatsuki = [
    {
        name: '火威青',
        imageUrl: `${publicBaseUrl}/images/geisha/akatsuki/ao.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/akatsuki/ao-shanpan.png`
    },
    {
        name: '潤羽るしあ',
        imageUrl: `${publicBaseUrl}/images/geisha/akatsuki/lushia.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/akatsuki/lushia-butterfly.jpg`
    },
    {
        name: '沙花叉クロヱ',
        imageUrl: `${publicBaseUrl}/images/geisha/akatsuki/sakamata.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/akatsuki/sakamata-eyemask.png`
    },
    {
        name: 'Gawr Gura',
        imageUrl: `${publicBaseUrl}/images/geisha/akatsuki/gura.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/akatsuki/gura-shasha.jpg`
    },
    {
        name: '湊あくあ',
        imageUrl: `${publicBaseUrl}/images/geisha/akatsuki/aqua.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/akatsuki/aqua-neko.png`
    },
    {
        name: '天音かなた',
        imageUrl: `${publicBaseUrl}/images/geisha/akatsuki/kanata.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/akatsuki/kanata-uparupa.png`
    },
    {
        name: '桐生ココ',
        imageUrl: `${publicBaseUrl}/images/geisha/akatsuki/coco.png`,
        cardUrl: `${publicBaseUrl}/images/items/akatsuki/coco-incoco.jpg`
    }
];

export const onesan = [
    {
        name: 'アキ・ローゼンタール',
        imageUrl: `${publicBaseUrl}/images/geisha/onesan/aki.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/onesan-items/rosetai.jpg`
    },
    {
        name: '癒月ちょこ',
        imageUrl: `${publicBaseUrl}/images/geisha/onesan/choko.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/onesan-items/choco-fan.jpg`
    },
    {
        name: 'ときのそら',
        imageUrl: `${publicBaseUrl}/images/geisha/onesan/sora.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/onesan-items/ankimo.jpg`
    },
    {
        name: 'Mori Calliope',
        imageUrl: `${publicBaseUrl}/images/geisha/onesan/cali.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/onesan-items/death-sensei.jpg`
    },
    {
        name: 'AZKi',
        imageUrl: `${publicBaseUrl}/images/geisha/onesan/azki.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/onesan-items/guess.jpg`
    },
    {
        name: 'Elizabeth Rose Bloodflame',
        imageUrl: `${publicBaseUrl}/images/geisha/onesan/Elizabeth.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/onesan-items/sword.jpg`
    },
    {
        name: 'Nerissa Ravencroft',
        imageUrl: `${publicBaseUrl}/images/geisha/onesan/Nerissa.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/onesan-items/jial-bird.jpg`
    }
];

export const collaboration = [
    {
        name: 'アキ・ローゼンタール',
        imageUrl: `${publicBaseUrl}/images/geisha/collaboration/marin.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/collaboration/gojo.png`
    },
    {
        name: '癒月ちょこ',
        imageUrl: `${publicBaseUrl}/images/geisha/collaboration/ren.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/collaboration/inu.png`
    },
    {
        name: 'ときのそら',
        imageUrl: `${publicBaseUrl}/images/geisha/collaboration/yoru.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/collaboration/weapon.jpg`
    },
    {
        name: 'Mori Calliope',
        imageUrl: `${publicBaseUrl}/images/geisha/collaboration/megumin.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/collaboration/neko.jpg`
    },
    {
        name: 'AZKi',
        imageUrl: `${publicBaseUrl}/images/geisha/collaboration/arima.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/collaboration/aqua.jpg`
    },
    {
        name: 'Elizabeth Rose Bloodflame',
        imageUrl: `${publicBaseUrl}/images/geisha/collaboration/furiren.jpg`,
        cardUrl: `${publicBaseUrl}/images/items/collaboration/bsg.png`
    },
    {
        name: 'Nerissa Ravencroft',
        imageUrl: `${publicBaseUrl}/images/geisha/collaboration/erien.jpg`,
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

// 依藝妓 ID 取得圖片網址
export function getGeishaImageById(geishaId: number, geishaSet: GeishaSetKey = 'default'): string {
    const data = getGeishaDataBySet(geishaSet);
    return data[geishaId - 1]?.imageUrl ?? '';
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

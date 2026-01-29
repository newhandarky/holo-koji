import { Geisha } from "game-shared-types"

export const geishaData = [
    {
        name: '一伊那尓栖',
        imageUrl: 'https://hololive.hololivepro.com/wp-content/uploads/2020/07/Ninomae-Inanis_list_thumb.png',
        cardUrl: 'https://shop.hololivepro.com/cdn/shop/files/hololivefriends_top_JP_Ina_nis_1024x1024.png?v=1715331031'
    },
    {
        name: '大神ミオ',
        imageUrl: 'https://hololive.hololivepro.com/wp-content/uploads/2020/06/Ookami-Mio_thumb.png',
        cardUrl: 'https://shop.hololivepro.com/cdn/shop/files/hololivefriends_vol.21_top_OokamiMioHoodieOutfit_1024x1024.png?v=1752219950'
    },
    {
        name: '百鬼あやめ',
        imageUrl: 'https://hololive.hololivepro.com/wp-content/uploads/2020/06/Nakiri-Ayame_list_thumb.png',
        cardUrl: 'https://shop.hololivepro.com/cdn/shop/files/hololivefriends_top_Ayame_3f7b539d-d483-4ec4-9fde-26dc08fb5081_1024x1024.png?v=1712154681'
    },
    {
        name: '白上フブキ',
        imageUrl: 'https://hololive.hololivepro.com/wp-content/uploads/2020/06/Shirakami-Fubuki_list_thumb.png',
        cardUrl: 'https://shop.hololivepro.com/cdn/shop/files/hololivefriends_vol.21_top_ShirakamiFubukiParadeDressOutfit_1024x1024.png?v=1752215575'
    },
    {
        name: 'さくらみこ',
        imageUrl: 'https://hololive.hololivepro.com/wp-content/uploads/2020/06/Sakura-Miko_list_thumb.png',
        cardUrl: 'https://shop.hololivepro.com/cdn/shop/files/hololivefriends_top_SakuraMiko_5297c6d4-0bbd-4fcd-885d-44651d1da7be_1024x1024.png?v=1712154621'
    },
    {
        name: '風真いろは',
        imageUrl: 'https://hololive.hololivepro.com/wp-content/uploads/2020/07/Kazama-Iroha_list_thumb.png',
        cardUrl: 'https://shop.hololivepro.com/cdn/shop/files/hololivefriends_top_Iroha_60230f42-68ef-44a1-88ce-853b21b7b2c9_1024x1024.png?v=1712154725'
    },
    {
        name: '儒烏風亭らでん',
        imageUrl: 'https://hololive.hololivepro.com/wp-content/uploads/2023/09/Juufuutei-Raden_list_thumb.png',
        cardUrl: 'https://shop.hololivepro.com/cdn/shop/files/hololivefriends_vol.15_top_JuufuuteiRaden_1024x1024.png?v=1725328691'
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

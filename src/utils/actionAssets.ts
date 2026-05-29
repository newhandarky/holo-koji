import { ActionToken } from "@newhandarky/hanakoji-game-types";

export const actionIconMap: Record<ActionToken['type'], string> = {
    secret: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/Action/1777803055114-320a8d17-6c9e-4575-9a40-aec696061ef3-ChatGPT-Image-2026-5-3-05_39_56.png',
    'trade-off': 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/Action/1777803055114-8df4d047-16de-431b-9f0c-3072164b917e-ChatGPT-Image-2026-5-3-05_46_10.png',
    gift: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/Action/1777803055114-5a7552fd-ecad-4af7-8d8c-3867e1c998a1-ChatGPT-Image-2026-5-3-06_07_13.png',
    competition: 'https://pub-0238f59b333e4bf38dac0e35da86c1a0.r2.dev/uploads/Action/1777803055114-ed742264-8f13-4685-90ef-02da57f2918b-ChatGPT-Image-2026-5-3-06_02_38.png'
};

export const actionStatusConfig: Array<{ type: ActionToken['type']; label: string; iconUrl: string }> = [
    { type: 'secret', label: '密約', iconUrl: actionIconMap.secret },
    { type: 'trade-off', label: '取捨', iconUrl: actionIconMap['trade-off'] },
    { type: 'gift', label: '贈予', iconUrl: actionIconMap.gift },
    { type: 'competition', label: '競爭', iconUrl: actionIconMap.competition }
];

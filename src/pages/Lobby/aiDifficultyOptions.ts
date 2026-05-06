export type AiDifficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'hell';

export interface AiDifficultyOption {
    value: AiDifficulty;
    label: string;
    description: string;
    rank: number;
}

export const AI_DIFFICULTY_OPTIONS: AiDifficultyOption[] = [
    { value: 'easy', label: '簡單', description: '適合初次體驗', rank: 1 },
    { value: 'medium', label: '中等', description: '標準挑戰', rank: 2 },
    { value: 'hard', label: '偏強', description: '需要穩定判斷', rank: 3 },
    { value: 'expert', label: '超強', description: '高壓進階對手', rank: 4 },
    { value: 'hell', label: '地獄', description: '最高難度挑戰', rank: 5 }
];

const AI_DIFFICULTY_VALUES = new Set<AiDifficulty>(
    AI_DIFFICULTY_OPTIONS.map((option) => option.value)
);

export const normalizeAiDifficulty = (value: unknown): AiDifficulty => {
    return typeof value === 'string' && AI_DIFFICULTY_VALUES.has(value as AiDifficulty)
        ? value as AiDifficulty
        : 'easy';
};

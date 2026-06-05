import React from 'react';
import { MotionCue } from './gameMotion';

interface PlayerHandRemovalCuesProps {
    removalCues: MotionCue[];
}

export const PlayerHandRemovalCues: React.FC<PlayerHandRemovalCuesProps> = ({ removalCues }) => {
    if (removalCues.length === 0) {
        return null;
    }

    return (
        <div className="player-hand-removal-cues" aria-hidden="true">
            {removalCues.map((cue, index) => (
                <div
                    key={cue.id}
                    className={`player-hand-removal-cue player-hand-removal-cue--${cue.owner} ${cue.reducedMotion ? 'player-hand-removal-cue--reduced' : ''}`}
                    style={{
                        ['--removal-index' as string]: `${index}`,
                        ['--motion-delay' as string]: `${cue.delayMs}ms`,
                        ['--motion-duration' as string]: `${cue.durationMs}ms`
                    }}
                />
            ))}
        </div>
    );
};

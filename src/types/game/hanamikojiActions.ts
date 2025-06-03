import { Card } from "./hanamikoji"

export type HanamikojiActionType = 'PLAY_ACTION' | 'CHOOSE_CARD' | 'END_TURN'

export interface PlayAction {
    type: 'PLAY_ACTION'
    playerId: string
    actionId: number // 1~4
    cards: Card[]
}

export interface ChooseCardAction {
    type: 'CHOOSE_CARD'
    playerId: string
    chosen: Card[]
}

export interface EndTurnAction {
    type: 'END_TURN'
    playerId: string
}

export type HanamikojiGameAction = PlayAction | ChooseCardAction | EndTurnAction

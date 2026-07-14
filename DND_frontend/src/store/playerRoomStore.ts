import { create } from 'zustand';

export const DICE = [4, 6, 8, 10, 12, 20, 100] as const;
export type Die = (typeof DICE)[number];

export const PLAYER_ROOM_TABS = ['overview', 'skills', 'inventory', 'abilities', 'dice'] as const;
export type PlayerRoomTab = (typeof PLAYER_ROOM_TABS)[number];

export type DiceRoll = {
  id: string;
  die: Die;
  naturalRoll: number;
  modifier: number;
  total: number;
  rolledAt: string;
};

type PlayerRoomState = {
  activeRoomId: string | null;
  activeTab: PlayerRoomTab;
  selectedDie: Die;
  diceModifier: number;
  rollHistory: DiceRoll[];
  enterRoom: (roomId: string) => void;
  setActiveTab: (tab: PlayerRoomTab) => void;
  selectDie: (die: Die) => void;
  setDiceModifier: (modifier: number) => void;
  rollDice: () => void;
  clearRollHistory: () => void;
};

export const usePlayerRoomStore = create<PlayerRoomState>((set, get) => ({
  activeRoomId: null,
  activeTab: 'overview',
  selectedDie: 20,
  diceModifier: 0,
  rollHistory: [],

  enterRoom: (roomId) =>
    set((state) =>
      state.activeRoomId === roomId
        ? state
        : {
            activeRoomId: roomId,
            activeTab: 'overview',
            selectedDie: 20,
            diceModifier: 0,
            rollHistory: [],
          },
    ),
  setActiveTab: (activeTab) => set({ activeTab }),
  selectDie: (selectedDie) => set({ selectedDie }),
  setDiceModifier: (diceModifier) => set({ diceModifier }),
  rollDice: () => {
    const { selectedDie, diceModifier } = get();
    const naturalRoll = Math.floor(Math.random() * selectedDie) + 1;
    const roll: DiceRoll = {
      id: `${Date.now()}-${Math.random()}`,
      die: selectedDie,
      naturalRoll,
      modifier: diceModifier,
      total: naturalRoll + diceModifier,
      rolledAt: new Date().toISOString(),
    };

    set((state) => ({ rollHistory: [roll, ...state.rollHistory].slice(0, 10) }));
  },
  clearRollHistory: () => set({ rollHistory: [] }),
}));

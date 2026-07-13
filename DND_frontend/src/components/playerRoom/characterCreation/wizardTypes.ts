import type { CharacterDraft } from '../../../types/playerCharacter';

export type DraftUpdater = (updater: (current: CharacterDraft) => CharacterDraft) => void;

export type CreationStepProps = {
  draft: CharacterDraft;
  updateDraft: DraftUpdater;
};

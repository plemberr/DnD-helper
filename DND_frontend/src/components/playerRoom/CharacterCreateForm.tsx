import type { CharacterDraft } from '../../types/playerCharacter';
import { CharacterCreationWizard } from './characterCreation/CharacterCreationWizard';

type CharacterCreateFormProps = {
  roomId: string;
  isSubmitting: boolean;
  submitError?: string;
  onCreate: (draft: CharacterDraft) => Promise<void>;
};

export function CharacterCreateForm(props: CharacterCreateFormProps) {
  return <CharacterCreationWizard {...props} />;
}

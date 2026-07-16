export const ABILITY_NAMES = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
] as const;

export type AbilityName = (typeof ABILITY_NAMES)[number];

export type AbilityScores = Record<AbilityName, number>;

export const ABILITY_LABELS: Record<AbilityName, string> = {
  strength: 'Сила',
  dexterity: 'Ловкость',
  constitution: 'Телосложение',
  intelligence: 'Интеллект',
  wisdom: 'Мудрость',
  charisma: 'Харизма',
};

export const SKILLS = [
  { key: 'athletics', label: 'Атлетика', ability: 'strength' },
  { key: 'acrobatics', label: 'Акробатика', ability: 'dexterity' },
  { key: 'sleightOfHand', label: 'Ловкость рук', ability: 'dexterity' },
  { key: 'stealth', label: 'Скрытность', ability: 'dexterity' },
  { key: 'investigation', label: 'Анализ', ability: 'intelligence' },
  { key: 'history', label: 'История', ability: 'intelligence' },
  { key: 'arcana', label: 'Магия', ability: 'intelligence' },
  { key: 'nature', label: 'Природа', ability: 'intelligence' },
  { key: 'religion', label: 'Религия', ability: 'intelligence' },
  { key: 'animalHandling', label: 'Уход за животными', ability: 'wisdom' },
  { key: 'insight', label: 'Проницательность', ability: 'wisdom' },
  { key: 'medicine', label: 'Медицина', ability: 'wisdom' },
  { key: 'perception', label: 'Восприятие', ability: 'wisdom' },
  { key: 'survival', label: 'Выживание', ability: 'wisdom' },
  { key: 'performance', label: 'Выступление', ability: 'charisma' },
  { key: 'intimidation', label: 'Запугивание', ability: 'charisma' },
  { key: 'deception', label: 'Обман', ability: 'charisma' },
  { key: 'persuasion', label: 'Убеждение', ability: 'charisma' },
] as const satisfies ReadonlyArray<{
  key: string;
  label: string;
  ability: AbilityName;
}>;

export type SkillName = (typeof SKILLS)[number]['key'];

export type InventoryCategory = 'weapon' | 'armor' | 'consumable' | 'quest' | 'other';

export type InventoryItemDetails = {
  name: string;
  quantity?: number;
  category?: InventoryCategory;
  type?: string;
  description?: string;
};

export type CharacterFeatureType = 'racial' | 'class' | 'background' | 'general';

export type CharacterFeatureDetails = {
  name: string;
  type?: CharacterFeatureType;
  summary?: string;
  description?: string;
};

export type CharacterDraft = {
  name: string;
  race: string;
  characterClass: string;
  subclass: string;
  background: string;
  level: number;
  abilities: AbilityScores;
  proficientSkills: SkillName[];
  inventory: string[];
  inventoryDetails?: InventoryItemDetails[];
};

export type PlayerCharacter = CharacterDraft & {
  id: string;
  roomId: string;
  userId: string;
  currentHp: number;
  maxHp: number;
  armorClass: number;
  initiative: number;
  speed: number;
  passivePerception: number;
  proficiencyBonus: number;
  features: string[];
  featureDetails?: CharacterFeatureDetails[];
  createdAt: string;
};

export const getAbilityModifier = (score: number) => Math.floor((score - 10) / 2);

export const getProficiencyBonus = (level: number) => Math.floor((level - 1) / 4) + 2;

export const formatModifier = (modifier: number) => (modifier >= 0 ? `+${modifier}` : `${modifier}`);

export function calculateCharacterStats(draft: CharacterDraft) {
  const dexterityModifier = getAbilityModifier(draft.abilities.dexterity);
  const constitutionModifier = getAbilityModifier(draft.abilities.constitution);
  const wisdomModifier = getAbilityModifier(draft.abilities.wisdom);
  const proficiencyBonus = getProficiencyBonus(draft.level);

  return {
    armorClass: 10 + dexterityModifier,
    initiative: dexterityModifier,
    maxHp: 10 + constitutionModifier + (draft.level - 1) * 6,
    passivePerception:
      10 + wisdomModifier + (draft.proficientSkills.includes('perception') ? proficiencyBonus : 0),
    proficiencyBonus,
  };
}

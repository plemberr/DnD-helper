import {
  getAbilityModifier,
  type AbilityName,
  type CharacterFeatureDetails,
  type CharacterFeatureType,
  type InventoryCategory,
  type InventoryItemDetails,
  type PlayerCharacter,
} from '../../../types/playerCharacter';

export const savingThrowsByClass: Record<string, AbilityName[]> = {
  Бард: ['dexterity', 'charisma'],
  Варвар: ['strength', 'constitution'],
  Воин: ['strength', 'constitution'],
  Волшебник: ['intelligence', 'wisdom'],
  Друид: ['intelligence', 'wisdom'],
  Жрец: ['wisdom', 'charisma'],
  Колдун: ['wisdom', 'charisma'],
  Монах: ['strength', 'dexterity'],
  Паладин: ['wisdom', 'charisma'],
  Плут: ['dexterity', 'intelligence'],
  Следопыт: ['strength', 'dexterity'],
  Чародей: ['constitution', 'charisma'],
};

export function getSavingThrowBonus(character: PlayerCharacter, ability: AbilityName) {
  const proficient = (savingThrowsByClass[character.characterClass] ?? []).includes(ability);
  return {
    proficient,
    bonus: getAbilityModifier(character.abilities[ability]) +
      (proficient ? character.proficiencyBonus : 0),
  };
}

export type DisplayInventoryItem = {
  id: string;
  name: string;
  quantity: number;
  category: InventoryCategory;
  type: string;
  description: string;
};

export const inventoryCategories: Array<{ key: 'all' | InventoryCategory; label: string }> = [
  { key: 'all', label: 'Всё' },
  { key: 'weapon', label: 'Оружие' },
  { key: 'armor', label: 'Броня' },
  { key: 'consumable', label: 'Расходники' },
  { key: 'quest', label: 'Квестовые' },
  { key: 'other', label: 'Прочее' },
];

function inferInventoryCategory(name: string): InventoryCategory {
  const value = name.toLocaleLowerCase('ru-RU');
  if (/меч|лук|клин|топор|кинжал|копь|арбалет|оруж|стрелков/.test(value)) return 'weapon';
  if (/брон|доспех|щит|кольчуг|шлем|одежд|сапог|перчат/.test(value)) return 'armor';
  if (/зель|эликс|еда|хлеб|стрел|болт|свиток|боеприпас/.test(value)) return 'consumable';
  if (/ключ|квест|реликв|артефакт|письмо|печать|знак/.test(value)) return 'quest';
  return 'other';
}

export function normalizeInventory(
  inventory: string[],
  details: InventoryItemDetails[] = [],
): DisplayInventoryItem[] {
  return inventory.map((name, index) => {
    const detail = details.find((item) => item.name === name);
    const category = detail?.category ?? inferInventoryCategory(name);
    return {
      id: `${index}-${name}`,
      name,
      quantity: Math.max(1, detail?.quantity ?? 1),
      category,
      type: detail?.type ?? inventoryCategories.find((item) => item.key === category)?.label ?? 'Предмет',
      description: detail?.description ?? 'Предмет из снаряжения персонажа. Подробности пока не указаны.',
    };
  });
}

export const featureTypeLabels: Record<CharacterFeatureType, string> = {
  racial: 'Расовые',
  class: 'Классовые',
  background: 'Происхождение',
  general: 'Общие черты',
};

export type DisplayFeature = Required<Pick<CharacterFeatureDetails, 'name'>> & {
  id: string;
  type: CharacterFeatureType;
  summary: string;
  description: string;
};

function inferFeatureType(name: string, index: number): CharacterFeatureType {
  const value = name.toLocaleLowerCase('ru-RU');
  if (/зрение|эльф|дварф|расов|наслед/.test(value)) return 'racial';
  if (/происхожд|предыстор/.test(value)) return 'background';
  if (/вдохнов|общ|геро/.test(value)) return 'general';
  return index === 0 ? 'background' : 'class';
}

export function normalizeFeatures(
  features: string[],
  details: CharacterFeatureDetails[] = [],
): DisplayFeature[] {
  return features.map((name, index) => {
    const detail = details.find((item) => item.name === name);
    return {
      id: `${index}-${name}`,
      name,
      type: detail?.type ?? inferFeatureType(name, index),
      summary: detail?.summary ?? 'Особенность персонажа, полученная во время создания или развития героя.',
      description:
        detail?.description ??
        'Подробное описание будет доступно после подключения расширенных данных персонажа.',
    };
  });
}

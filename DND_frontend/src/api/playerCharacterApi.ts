import {
  calculateCharacterStats,
  type CharacterDraft,
  type PlayerCharacter,
} from '../types/playerCharacter';

const STORAGE_KEY = 'dnd-player-characters';
const MOCK_DELAY_MS = 450;

const delay = (milliseconds = MOCK_DELAY_MS) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

function readStoredCharacters(): PlayerCharacter[] {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return [];

    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as PlayerCharacter[]) : [];
  } catch {
    return [];
  }
}

function writeStoredCharacters(characters: PlayerCharacter[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
}

export async function getPlayerCharacter(
  roomId: string,
  userId: string,
): Promise<PlayerCharacter | null> {
  await delay();

  const storedCharacter = readStoredCharacters().find(
    (character) => character.roomId === roomId && character.userId === userId,
  );

  return storedCharacter ?? null;
}

export async function createPlayerCharacter(
  roomId: string,
  userId: string,
  draft: CharacterDraft,
): Promise<PlayerCharacter> {
  await delay(650);

  const stats = calculateCharacterStats(draft);
  const character: PlayerCharacter = {
    ...draft,
    ...stats,
    id: crypto.randomUUID(),
    roomId,
    userId,
    currentHp: stats.maxHp,
    speed: 30,
    features: ['Черта происхождения', 'Классовая особенность', 'Вдохновение героя'],
    inventoryDetails:
      draft.inventoryDetails ??
      draft.inventory.map((name) => ({
        name,
        category: 'other' as const,
        type: 'Снаряжение',
        description: 'Предмет из стартового снаряжения персонажа.',
      })),
    featureDetails: [
      {
        name: 'Черта происхождения',
        type: 'background',
        summary: `Опыт, полученный благодаря предыстории «${draft.background}».`,
      },
      {
        name: 'Классовая особенность',
        type: 'class',
        summary: `Базовая особенность класса «${draft.characterClass}».`,
      },
      {
        name: 'Вдохновение героя',
        type: 'general',
        summary: 'Напоминание о решимости героя в ключевой момент приключения.',
      },
    ],
    createdAt: new Date().toISOString(),
  };

  const otherCharacters = readStoredCharacters().filter(
    (savedCharacter) => savedCharacter.roomId !== roomId || savedCharacter.userId !== userId,
  );
  writeStoredCharacters([...otherCharacters, character]);

  return character;
}

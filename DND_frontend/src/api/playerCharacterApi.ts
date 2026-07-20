import {
  ABILITY_NAMES,
  calculateCharacterStats,
  type CharacterDraft,
  type PlayerCharacter,
  getAbilityModifier,
  getProficiencyBonus,
} from '../types/playerCharacter';

const CHARACTER_API_BASE_URL = import.meta.env.VITE_CHARACTER_API_BASE_URL ?? '/api/characters';
const SUPPLEMENT_STORAGE_KEY = 'dnd-player-character-supplements';

interface ApiErrorBody {
  detail?: string;
}

interface ItemDto {
  id?: string | null;
  type: string;
  value: string;
}

interface CharacterCreateDto {
  name: string;
  race: string;
  character_class: string;
  level: number;
  age?: number;
  weight: number;
  height: number;
  appearance: string;
  hp_current: number;
  hp_max: number;
  ac: number;
  initiative: number;
}

interface CharacterDetailDto {
  id: number;
  room_id: number;
  user_id: number;
  name: string;
  race: string;
  character_class: string;
  level: number;
  hp_current: number;
  hp_max: number;
  ac: number;
  initiative: number;
  inventory: ItemDto[];
  feats: ItemDto[];
  created_at: string;
}

interface CharacterListItemDto {
  id: number;
}

interface CharacterListResponseDto {
  items: CharacterListItemDto[];
}

type CharacterSupplement = Pick<
  PlayerCharacter,
  | 'subclass'
  | 'background'
  | 'abilities'
  | 'proficientSkills'
  | 'inventoryDetails'
  | 'featureDetails'
  | 'features'
  | 'speed'
>;

type CharacterSupplementMap = Record<string, CharacterSupplement>;

async function parseError(response: Response): Promise<never> {
  let message = `Request failed with status ${response.status}`;

  try {
    const body = (await response.json()) as ApiErrorBody;
    if (typeof body.detail === 'string' && body.detail.trim()) {
      message = body.detail;
    }
  } catch {
    // Intentionally ignored: fallback error message is used.
  }

  throw new Error(message);
}

async function request<TResponse>(
  path: string,
  init?: RequestInit,
  accessToken?: string | null,
): Promise<TResponse> {
  const response = await fetch(`${CHARACTER_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    return parseError(response);
  }

  return (await response.json()) as TResponse;
}

function readSupplements(): CharacterSupplementMap {
  try {
    const raw = localStorage.getItem(SUPPLEMENT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as CharacterSupplementMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeSupplements(data: CharacterSupplementMap) {
  localStorage.setItem(SUPPLEMENT_STORAGE_KEY, JSON.stringify(data));
}

function supplementKey(roomId: number, userId: number) {
  return `${roomId}:${userId}`;
}

function getDefaultAbilities(): CharacterDraft['abilities'] {
  return ABILITY_NAMES.reduce<CharacterDraft['abilities']>(
    (accumulator, ability) => ({
      ...accumulator,
      [ability]: 10,
    }),
    {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
  );
}

function toInventoryDetails(items: ItemDto[]) {
  return items.map((item) => ({
    name: item.value,
    type: item.type,
    category: 'other' as const,
  }));
}

function toFeatureDetails(items: ItemDto[]) {
  return items.map((item) => ({
    name: item.value,
    type: 'general' as const,
    summary: item.type,
  }));
}

function buildCharacterViewModel(
  roomId: number,
  detail: CharacterDetailDto,
  supplement?: CharacterSupplement,
): PlayerCharacter {
  const abilities = supplement?.abilities ?? getDefaultAbilities();
  const proficientSkills = supplement?.proficientSkills ?? [];
  const proficiencyBonus = getProficiencyBonus(detail.level);
  const passivePerception =
    10 + getAbilityModifier(abilities.wisdom) + (proficientSkills.includes('perception') ? proficiencyBonus : 0);

  return {
    id: String(detail.id),
    roomId: String(roomId),
    userId: String(detail.user_id),
    name: detail.name,
    race: detail.race,
    characterClass: detail.character_class,
    subclass: supplement?.subclass ?? '',
    background: supplement?.background ?? '',
    level: detail.level,
    abilities,
    proficientSkills,
    inventory: detail.inventory.map((item) => item.value),
    inventoryDetails: supplement?.inventoryDetails ?? toInventoryDetails(detail.inventory),
    currentHp: detail.hp_current,
    maxHp: detail.hp_max,
    armorClass: detail.ac,
    initiative: detail.initiative,
    speed: supplement?.speed ?? 30,
    passivePerception,
    proficiencyBonus,
    features: supplement?.features ?? detail.feats.map((item) => item.value),
    featureDetails: supplement?.featureDetails ?? toFeatureDetails(detail.feats),
    createdAt: detail.created_at,
  };
}

export async function getPlayerCharacter(
  roomId: string,
  userId: number,
  accessToken?: string | null,
): Promise<PlayerCharacter | null> {
  const roomIdNumber = Number.parseInt(roomId, 10);
  if (!Number.isFinite(roomIdNumber)) {
    return null;
  }

  const list = await request<CharacterListResponseDto>(
    `/rooms/${roomIdNumber}/characters?user_id=${userId}`,
    undefined,
    accessToken,
  );
  const firstCharacter = list.items[0];
  if (!firstCharacter) {
    return null;
  }

  const detail = await request<CharacterDetailDto>(
    `/rooms/${roomIdNumber}/characters/${firstCharacter.id}`,
    undefined,
    accessToken,
  );
  const supplements = readSupplements();

  return buildCharacterViewModel(roomIdNumber, detail, supplements[supplementKey(roomIdNumber, userId)]);
}

export async function createPlayerCharacter(
  roomId: string,
  userId: number,
  draft: CharacterDraft,
  accessToken: string,
): Promise<PlayerCharacter> {
  const roomIdNumber = Number.parseInt(roomId, 10);
  if (!Number.isFinite(roomIdNumber)) {
    throw new Error('Некорректный идентификатор комнаты.');
  }

  const stats = calculateCharacterStats(draft);
  const payload: CharacterCreateDto = {
    name: draft.name.trim(),
    race: draft.race,
    character_class: draft.characterClass,
    level: draft.level,
    weight: 70,
    height: 175,
    appearance: draft.background.trim() || 'Нет описания.',
    hp_current: stats.maxHp,
    hp_max: stats.maxHp,
    ac: stats.armorClass,
    initiative: stats.initiative,
  };

  const created = await request<CharacterDetailDto>(
    `/rooms/${roomIdNumber}/characters`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    accessToken,
  );

  const supplements = readSupplements();
  const supplement: CharacterSupplement = {
    subclass: draft.subclass,
    background: draft.background,
    abilities: draft.abilities,
    proficientSkills: draft.proficientSkills,
    inventoryDetails:
      draft.inventoryDetails ??
      draft.inventory.map((name) => ({
        name,
        category: 'other' as const,
        type: 'Снаряжение',
        description: 'Предмет из стартового снаряжения персонажа.',
      })),
    features: ['Черта происхождения', 'Классовая особенность', 'Вдохновение героя'],
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
    speed: 30,
  };
  writeSupplements({
    ...supplements,
    [supplementKey(roomIdNumber, userId)]: supplement,
  });

  return buildCharacterViewModel(roomIdNumber, created, supplement);
}

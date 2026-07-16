import type { CharacterDraft } from '../../../types/playerCharacter';

export const raceOptions = [
  { name: 'Человек', description: 'Гибкие и целеустремлённые герои, способные преуспеть в любом призвании.' },
  { name: 'Высший эльф', description: 'Наследники древней магии с острым умом и утончённой культурой.' },
  { name: 'Лесной эльф', description: 'Быстрые и наблюдательные странники, связанные с дикой природой.' },
  { name: 'Дварф', description: 'Стойкие мастера и воины, известные выносливостью и крепкой волей.' },
  { name: 'Полурослик', description: 'Небольшие, ловкие и удивительно храбрые искатели приключений.' },
  { name: 'Полуэльф', description: 'Харизматичные наследники двух миров, легко находящие общий язык с другими.' },
  { name: 'Полуорк', description: 'Сильные и несгибаемые герои, привыкшие преодолевать предубеждения.' },
  { name: 'Тифлинг', description: 'Отмеченные инфернальным наследием странники с врождённой магической силой.' },
] as const;

export const classOptions = [
  { name: 'Бард', description: 'Вдохновение, искусство и универсальная магия.' },
  { name: 'Варвар', description: 'Ярость, стойкость и сокрушительная сила.' },
  { name: 'Воин', description: 'Мастер оружия и тактического боя.' },
  { name: 'Волшебник', description: 'Учёный тайной магии с обширной книгой заклинаний.' },
  { name: 'Друид', description: 'Хранитель природы и силы первозданных форм.' },
  { name: 'Жрец', description: 'Проводник божественной воли и защитной магии.' },
  { name: 'Колдун', description: 'Носитель силы, дарованной таинственным покровителем.' },
  { name: 'Монах', description: 'Подвижный мастер тела, духа и внутренней энергии.' },
  { name: 'Паладин', description: 'Воин священной клятвы, защищающий союзников.' },
  { name: 'Плут', description: 'Точный, скрытный и изобретательный специалист.' },
  { name: 'Следопыт', description: 'Охотник, проводник и знаток опасных земель.' },
  { name: 'Чародей', description: 'Заклинатель, чья магия пробуждается изнутри.' },
] as const;

export function createInitialDraft(): CharacterDraft {
  return {
    name: '',
    race: '',
    characterClass: '',
    subclass: '',
    background: '',
    level: 1,
    abilities: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    proficientSkills: [],
    inventory: [],
  };
}

export const initialEquipment = 'Рюкзак\nОдежда путешественника';

import { Type } from '@prisma/client';

export function convertToId(id: string): number {
  const value = Number(String(id).replace(/[^0-9]/g, ''));

  if (Number.isNaN(value) || value < -2147483648 || value > 2147483647) {
    return -1;
  }

  return value;
}

export function convertToType(type: string): Type {
  const value = type.toUpperCase();

  switch (value) {
    case 'MOVIE':
    case 'MOVIES':
      return 'MOVIE';

    case 'TV':
    case 'SERIES':
      return 'TV';

    default:
      return 'MOVIE';
  }
}

import { Type } from '@prisma/client';

export function convertToId(id: string): number {
  return Number(String(id).replace(/[^0-9]/g, ''));
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

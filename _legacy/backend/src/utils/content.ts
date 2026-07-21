import { prisma } from '../config/database';

export async function saveContentItem(params: {
  userId: string;
  type: string;
  title: string;
  input: unknown;
  output: unknown;
}) {
  return prisma.contentItem.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      input: JSON.stringify(params.input),
      output: JSON.stringify(params.output),
    },
  });
}

export function parseContentItem<T extends { input: string; output: string }>(item: T) {
  return {
    ...item,
    input: JSON.parse(item.input),
    output: JSON.parse(item.output),
  };
}

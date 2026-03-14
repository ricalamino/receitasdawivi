import { getCollection } from 'astro:content';

export async function GET() {
  const receitas = await getCollection('receitas');
  const data = receitas.map((r) => ({
    title: r.data.title,
    slug: r.id,
    text: r.body ?? '',
  }));
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}

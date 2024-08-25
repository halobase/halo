import { redirect } from '@sveltejs/kit';

export async function load(event) {
  const { user } = await event.parent();
  if (!user) {
    throw redirect(303, `/iam?redirect_to=${event.url.pathname}`);
  }
  const slugs = [
    {
      "id": "services",
      "name": "数字模型",
      "icon": "🫐",
      "group": ""
    },
    {
      "id": "assistants",
      "name": "数字专家",
      "icon": "🙂",
      "group": ""
    },
    {
      "id": "knowledges",
      "name": "知识图谱",
      "icon": "📖",
      "group": ""
    },
    {
      "id": "keys",
      "name": "API Keys",
      "icon": "🗝️",
      "group": ""
    },
    {
      "id": "monitor",
      "name": "控制中心",
      "icon": "🕵️",
      "group": ""
    }
  ];
  const filteredSlugs = user.scope==='admin' ? slugs : slugs.filter(slug => slug.id !== 'monitor' && slug.id !== 'assistants');

  return { slugs: filteredSlugs };
}

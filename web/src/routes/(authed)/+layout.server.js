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
      "icon": "🧑‍🔧",
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
    },
    {
      "id": "users",
      "name": "用户中心",
      "icon": "🙂",
      "group": ""
    },
    {
      "id": "personal",
      "name": "个人中心",
      "icon": "🙂",
      "group": ""
    },
    {
      "id": "bills",
      "name": "费用账单",
      "icon": "💰",
      "group": ""
    }
  ];
  
  const filteredSlugs = user.scope==='admin' ? slugs.filter(slug => slug.id !== 'personal') : slugs.filter(slug => slug.id !== 'monitor' && slug.id !== 'assistants' && slug.id !== 'users');

  return { slugs: filteredSlugs };
}

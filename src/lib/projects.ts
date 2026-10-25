import { getCollection } from "astro:content";

export async function getProjects() {
  const projects = await getCollection("projects", ({ data }) => import.meta.env.DEV || !data.draft);
  return projects.sort((a, b) => a.data.order - b.data.order);
}

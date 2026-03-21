import { getProjects }   from "@/lib/api";
import { Hero } from "@/components/home/Home";
import { HomeWork } from "@/components/home/HomeWork";

export default async function HomePage() {
  const projects = await getProjects().catch(() => []);
  const featured = projects.slice(0, 6);

  return (
    <>
      <Hero />
      <HomeWork projects={featured} />
    </>
  );
}
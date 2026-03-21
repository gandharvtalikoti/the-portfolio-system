import type { Metadata } from "next";
import { site }          from "@/config/site";
import { AboutView } from "@/components/about/AboutView";

export const metadata: Metadata = {
  title:       "About",
  description: site.bio,
};

export default function AboutPage() {
  return <AboutView />;
}
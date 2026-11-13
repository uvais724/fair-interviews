import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://fairinterviews.org",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://fairinterviews.org/guides/types-of-interviews",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://fairinterviews.org/guides/structured-vs-unstructured-interviews",
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}

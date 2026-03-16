import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://agenticradio.ai',
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://agenticradio.ai/listen',
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: 'https://agenticradio.ai/request',
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://agenticradio.ai/channels',
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://agenticradio.ai/submit',
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: 'https://agenticradio.ai/developers',
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: 'https://agenticradio.ai/about',
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://agenticradio.ai/privacy',
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: 'https://agenticradio.ai/terms',
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]
}

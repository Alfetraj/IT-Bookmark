import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

export interface Metadata {
  title: string | null;
  description: string | null;
  favicon: string | null;
  image: string | null;
  domain: string | null;
}

export class MetadataService {
  async fetchMetadata(url: string): Promise<Metadata> {
    const metadata: Metadata = {
      title: null,
      description: null,
      favicon: null,
      image: null,
      domain: null,
    };

    try {
      const parsedUrl = new URL(url);
      metadata.domain = parsedUrl.hostname;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; IT-Bookmark-Bot/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 10000, // 10 seconds timeout
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Title
      metadata.title = $('meta[property="og:title"]').attr('content') ||
                       $('meta[name="twitter:title"]').attr('content') ||
                       $('title').text() ||
                       null;

      // Description
      metadata.description = $('meta[property="og:description"]').attr('content') ||
                             $('meta[name="description"]').attr('content') ||
                             $('meta[name="twitter:description"]').attr('content') ||
                             null;

      // Image
      metadata.image = $('meta[property="og:image"]').attr('content') ||
                       $('meta[name="twitter:image"]').attr('content') ||
                       null;

      // Favicon
      let favicon = $('link[rel="icon"]').attr('href') ||
                    $('link[rel="shortcut icon"]').attr('href') ||
                    $('link[rel="apple-touch-icon"]').attr('href');

      if (favicon) {
        // Resolve relative URL
        if (!favicon.startsWith('http')) {
          favicon = new URL(favicon, parsedUrl.origin).href;
        }
        metadata.favicon = favicon;
      } else {
        // Fallback to default favicon.ico
        metadata.favicon = `${parsedUrl.origin}/favicon.ico`;
      }

    } catch (error) {
      console.error(`Metadata extraction failed for ${url}:`, error);
    }

    return metadata;
  }
}

export const metadataService = new MetadataService();

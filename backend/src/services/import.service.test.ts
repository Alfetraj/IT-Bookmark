import { describe, it, expect, vi, beforeEach } from 'vitest';
import { importService } from './import.service';
import { supabase } from '../config/supabase';
import { queueManager } from '../config/queue';

// Mock dependencies
vi.mock('../config/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('../config/queue', () => ({
  queueManager: {
    send: vi.fn(),
  },
}));

vi.mock('../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('ImportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSupabaseChain = (mockData: any, mockError: any = null) => {
    const chain: any = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.insert = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.is = vi.fn().mockReturnValue(chain);
    chain.order = vi.fn().mockReturnValue(chain);
    chain.single = vi.fn().mockResolvedValue({ data: mockData, error: mockError });
    chain.maybeSingle = vi.fn().mockResolvedValue({ data: mockData, error: mockError });
    return chain;
  };

  it('throws error for invalid HTML format', async () => {
    const html = `<html><body><p>No DL tag</p></body></html>`;
    await expect(importService.importHtml('user-123', html)).rejects.toThrow('Invalid HTML format');
  });

  it('imports valid bookmarks and skips unsafe URLs', async () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
    <DL><p>
      <DT><A HREF="https://example.com" ADD_DATE="1700000000" TAGS="tech,news">Example</A>
      <DD>Example description
      <DT><A HREF="javascript:alert(1)">XSS</A>
      <DT><A HREF="not-a-url">Invalid</A>
    </DL><p>`;

    const chain = mockSupabaseChain(null);
    chain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    chain.single = vi.fn().mockResolvedValue({ data: { id: 'mock-id' }, error: null });
    
    vi.mocked(supabase.from).mockReturnValue(chain);
    vi.mocked(queueManager.send).mockResolvedValue(undefined);

    const result = await importService.importHtml('user-123', html);

    expect(result.totalProcessed).toBe(3);
    expect(result.bookmarksCreated).toBe(1);
    expect(result.bookmarksSkipped).toBe(2); 
    expect(queueManager.send).toHaveBeenCalledWith('bookmark.archive', expect.any(Object));
  });

  it('falls back to "Untitled Collection" for empty folder names', async () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
    <DL><p>
      <DT><H3></H3>
      <DL><p>
        <DT><A HREF="https://valid.com">Valid</A>
      </DL><p>
    </DL><p>`;

    const chain = mockSupabaseChain(null);
    chain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    chain.single = vi.fn().mockResolvedValue({ data: { id: 'folder-123' }, error: null });
    
    vi.mocked(supabase.from).mockReturnValue(chain);

    const result = await importService.importHtml('user-123', html);

    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Untitled Collection'
    }));
    expect(result.bookmarksCreated).toBe(1);
  });
});

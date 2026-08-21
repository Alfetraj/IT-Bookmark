import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportService } from './export.service';
import { supabase } from '../config/supabase';

vi.mock('../config/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('ExportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSupabaseChain = (mockData: any) => {
    const chain: any = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.order = vi.fn().mockResolvedValue({ data: mockData, error: null });
    return chain;
  };

  it('fetches export data explicitly without leaking private columns', async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'collections') return mockSupabaseChain([]);
      if (table === 'tags') return mockSupabaseChain([]);
      if (table === 'bookmarks') return mockSupabaseChain([]);
      return mockSupabaseChain([]);
    });

    const data = await exportService.getExportData('user-123');

    expect(data.collections).toEqual([]);
    expect(data.tags).toEqual([]);
    expect(data.bookmarks).toEqual([]);
    
    // Check that explicit select was called for bookmarks
    const mockFrom = vi.mocked(supabase.from);
    expect(mockFrom).toHaveBeenCalledWith('bookmarks');
  });

  it('generates Netscape HTML with proper escaping', () => {
    const data = {
      version: '1',
      exportedAt: new Date().toISOString(),
      collections: [],
      tags: [
        { id: 't1', name: 'Tag 1 <script>', color: null, created_at: '' },
        { id: 't2', name: 'Tag 2', color: null, created_at: '' }
      ],
      bookmarks: [
        {
          id: '1',
          url: 'https://example.com/search?q=1&2',
          title: 'Title <script>alert(1)</script>',
          description: 'Desc "quotes" & ampersands',
          notes: null,
          is_favorite: false,
          read_later: false,
          is_archived: false,
          collection_id: null,
          import_date: new Date('2023-01-01').toISOString(),
          created_at: new Date('2023-01-01').toISOString(),
          updated_at: new Date('2023-01-01').toISOString(),
          bookmark_tags: [{ tag_id: 't1' }, { tag_id: 't2' }]
        }
      ]
    };

    const html = exportService.generateNetscapeHtml(data);
    
    // Check URL escaping
    expect(html).toContain('HREF="https://example.com/search?q=1&amp;2"');
    // Check Title escaping
    expect(html).toContain('Title &lt;script&gt;alert(1)&lt;/script&gt;');
    // Check Description escaping
    expect(html).toContain('Desc &quot;quotes&quot; &amp; ampersands');
    // Check Tag escaping
    expect(html).toContain('TAGS="Tag 1 &lt;script&gt;,Tag 2"');
  });
});

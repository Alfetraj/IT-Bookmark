import React from 'react';
import { Copy, FileText, Image as ImageIcon, ExternalLink, Globe } from 'lucide-react';
import type { Bookmark } from '../types/bookmark.types';
import styles from '../styles/BookmarkDetail.module.scss';
import { useNavigate } from 'react-router-dom';

interface BookmarkDetailProps {
  bookmark: Bookmark;
}

export const BookmarkDetail: React.FC<BookmarkDetailProps> = ({ bookmark }) => {
  const navigate = useNavigate();

  const handleCopy = () => {
    navigator.clipboard.writeText(bookmark.url);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Hero Banner / Screenshot */}
        <div 
          className={styles.heroImage}
          style={
            bookmark.screenshotPath
              ? { backgroundImage: `url(${import.meta.env.VITE_API_URL || ''}/api/v1/storage/${bookmark.screenshotPath})` }
              : {}
          }
        >
          {!bookmark.screenshotPath && (
            <div style={{ textAlign: 'center' }}>
              <ImageIcon size={48} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
              <p>No preview available</p>
            </div>
          )}
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>{bookmark.title || 'Untitled'}</h2>

          {/* URL Field */}
          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Link</span>
            <div className={styles.fieldValue}>
              <a href={bookmark.url} target="_blank" rel="noreferrer" className={styles.urlText}>
                {bookmark.url}
              </a>
              <button onClick={handleCopy} aria-label="Copy URL" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <Copy size={16} />
              </button>
            </div>
          </div>

          {/* Collection Field */}
          {bookmark.collectionId && (
            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>Collection</span>
              <div className={styles.fieldValue} style={{ cursor: 'pointer' }} onClick={() => navigate(`/collections/${bookmark.collectionId}`)}>
                {bookmark.collectionId /* We should really resolve this to collection name */}
              </div>
            </div>
          )}

          {/* Tags Field */}
          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Tags</span>
            <div className={styles.fieldValue}>
              {bookmark.tags && bookmark.tags.length > 0 ? (
                <div className={styles.tagContainer}>
                  {bookmark.tags.map((tag: any) => (
                    <span key={tag.id} className={styles.tag}>{tag.name}</span>
                  ))}
                </div>
              ) : (
                <span style={{ color: 'var(--text-secondary)' }}>No tags</span>
              )}
            </div>
          </div>

          {/* Description Field */}
          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Description</span>
            <div className={styles.fieldValue} style={{ display: 'block' }}>
              {bookmark.description ? (
                <p style={{ margin: 0 }}>{bookmark.description}</p>
              ) : (
                <span style={{ color: 'var(--text-secondary)' }}>No description provided.</span>
              )}
            </div>
          </div>

          {/* Available Formats / Preservations */}
          <div className={styles.fieldGroup} style={{ marginTop: '2.5rem' }}>
            <span className={styles.fieldLabel} style={{ fontWeight: 'bold' }}>Preserved Formats</span>
            <div className={styles.formatList}>
              {/* Monolith Webpage (HTML) */}
              <div className={styles.formatRow}>
                <Globe size={24} className={styles.formatIcon} />
                <div className={styles.formatInfo}>
                  <span className={styles.formatName}>Webpage</span>
                  <span className={styles.formatStatus}>
                    {bookmark.archiveStatus === 'success' ? 'Preserved' : 'Pending'}
                  </span>
                </div>
                <ExternalLink size={16} className={styles.formatIcon} />
              </div>
              
              {/* Screenshot */}
              <div className={styles.formatRow}>
                <ImageIcon size={24} className={styles.formatIcon} />
                <div className={styles.formatInfo}>
                  <span className={styles.formatName}>Screenshot</span>
                  <span className={styles.formatStatus}>
                    {bookmark.screenshotPath ? 'Preserved' : 'Pending'}
                  </span>
                </div>
                <ExternalLink size={16} className={styles.formatIcon} />
              </div>

              {/* PDF */}
              <div className={styles.formatRow}>
                <FileText size={24} className={styles.formatIcon} />
                <div className={styles.formatInfo}>
                  <span className={styles.formatName}>PDF</span>
                  <span className={styles.formatStatus}>
                    {bookmark.pdfPath ? 'Preserved' : 'Pending'}
                  </span>
                </div>
                <ExternalLink size={16} className={styles.formatIcon} />
              </div>

              {/* Readable */}
              <div 
                className={`${styles.formatRow} ${bookmark.readabilityContent ? styles.clickable : ''}`}
                onClick={() => bookmark.readabilityContent && navigate(`/bookmarks/${bookmark.id}/reader`)}
              >
                <FileText size={24} className={styles.formatIcon} />
                <div className={styles.formatInfo}>
                  <span className={styles.formatName}>Readable text</span>
                  <span className={styles.formatStatus}>
                    {bookmark.readabilityContent ? 'Preserved (Click to read)' : 'Pending'}
                  </span>
                </div>
                <ExternalLink size={16} className={styles.formatIcon} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

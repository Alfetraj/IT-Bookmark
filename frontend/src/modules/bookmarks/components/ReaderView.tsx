import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useReaderQuery } from '../hooks/useReaderQuery';
import styles from '../styles/ReaderView.module.scss';
import { ArrowLeft, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

const ReaderView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useReaderQuery(id);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={48} />
        <p>Loading reader view...</p>
      </div>
    );
  }

  if (error) {
    const status = (error as any)?.response?.status;
    let errorMessage = 'Failed to load reader view.';
    
    if (status === 202) {
      errorMessage = 'Archive processing is still pending. Please try again later.';
    } else if (status === 422) {
      errorMessage = 'Archive processing failed for this bookmark. Reader view is unavailable.';
    } else if (status === 404) {
      errorMessage = 'No readable content was found for this bookmark.';
    }

    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={48} className={styles.errorIcon} />
        <h2>Cannot Load Reader View</h2>
        <p>{errorMessage}</p>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  if (!data) return null;

  // Sanitize the HTML before injecting it
  const sanitizedContent = DOMPurify.sanitize(data.content, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'figure', 'figcaption'
    ],
    ALLOWED_ATTR: ['href', 'name', 'target', 'src', 'alt', 'title', 'class'],
  });

  return (
    <div className={styles.readerContainer}>
      <header className={styles.readerHeader}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className={styles.readerMeta}>
          <a href={data.url} target="_blank" rel="noopener noreferrer" className={styles.domainLink}>
            {data.domain} <ExternalLink size={14} />
          </a>
        </div>
      </header>

      <article className={styles.readerArticle}>
        <h1 className={styles.readerTitle}>{data.title}</h1>
        
        <div 
          className={styles.readerContent}
          dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
        />
      </article>
    </div>
  );
};

export default ReaderView;

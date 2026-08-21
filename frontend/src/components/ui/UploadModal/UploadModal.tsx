import React, { useState } from 'react';
import { Modal } from '../modal/Modal';
import { Button } from '../button/button';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { importService } from '../../../modules/import/services/import.service';
import { useQueryClient } from '@tanstack/react-query';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setStatus(null);

    try {
      const response = await importService.importHtml(file);
      setStatus({
        type: 'success',
        message: response.message || 'Bookmarks imported successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });

      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err: any) {
      console.error('Import error:', err);
      setStatus({
        type: 'error',
        message: err.response?.data?.error || err.message || 'Failed to import file.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload / Import Bookmarks">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Upload a browser bookmark HTML export file or JSON file to import bookmarks and folders directly into your workspace.
        </p>

        <div
          style={{
            border: '2px dashed var(--border-color)',
            borderRadius: '10px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface)',
            cursor: 'pointer',
            position: 'relative',
          }}
          onClick={() => document.getElementById('sidebar-file-upload')?.click()}
        >
          <input
            id="sidebar-file-upload"
            type="file"
            accept=".html,.htm,.json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <Upload size={32} color="var(--accent-color, #38bdf8)" style={{ margin: '0 auto 0.75rem auto' }} />
          <p style={{ fontWeight: 600, margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>
            {file ? file.name : 'Click to select or drop a bookmark file'}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Supports Chrome, Firefox, Safari, Edge HTML exports and JSON (.html, .htm, .json)
          </span>
        </div>

        {status && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: status.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${status.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: status.type === 'success' ? '#10b981' : '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
            }}
          >
            {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{status.message}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button variant="secondary" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? (
              <>
                <Loader2 size={16} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                Importing...
              </>
            ) : (
              'Upload & Import'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

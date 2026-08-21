import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { importService } from '../modules/import/services/import.service';
import { exportService } from '../modules/import/services/export.service';

const Settings: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isExportingHTML, setIsExportingHTML] = useState(false);
    const [isExportingJSON, setIsExportingJSON] = useState(false);

    const handleExport = async (format: 'html' | 'json') => {
        try {
            if (format === 'html') setIsExportingHTML(true);
            else setIsExportingJSON(true);
            
            await exportService.exportBookmarks(format);
            
        } catch (error: any) {
            console.error('Export failed', error);
            setUploadStatus({ 
                type: 'error', 
                message: error.response?.data?.error || 'Failed to export bookmarks.' 
            });
        } finally {
            if (format === 'html') setIsExportingHTML(false);
            else setIsExportingJSON(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setUploadStatus(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        
        setIsUploading(true);
        setUploadStatus(null);
        
        try {
            const response = await importService.importHtml(file);
            setUploadStatus({ type: 'success', message: response.message || 'Bookmarks imported successfully!' });
            setFile(null); // Clear input
            
            // Reset file input element visually
            const fileInput = document.getElementById('bookmark-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
            
        } catch (error: any) {
            console.error('Import failed', error);
            setUploadStatus({ 
                type: 'error', 
                message: error.response?.data?.error || 'Failed to import bookmarks. Please try again.' 
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Settings</h1>
                <p style={{ color: 'var(--text-secondary, #6b7280)', margin: '0.5rem 0 0' }}>
                    Customize your application preferences.
                </p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="glass-card" style={{ maxWidth: '600px' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Appearance</h2>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                        <div>
                            <h3 style={{ fontWeight: 500, margin: '0 0 0.25rem 0' }}>Theme Mode</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>
                                Currently using {theme} mode
                            </p>
                        </div>
                        <button
                            onClick={toggleTheme}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'var(--accent-color)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {theme === 'light' ? '🌙 Switch to Dark' : '☀️ Switch to Light'}
                        </button>
                    </div>
                </div>

                <div className="glass-card" style={{ maxWidth: '600px' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Data Management</h2>
                    
                    <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                        <h3 style={{ fontWeight: 500, margin: '0 0 0.5rem 0' }}>Import Bookmarks</h3>
                        <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem 0', fontSize: '0.875rem' }}>
                            Upload a Netscape Bookmark HTML file exported from your browser to import your existing bookmarks and folders.
                        </p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input 
                                id="bookmark-upload"
                                type="file" 
                                accept=".html,text/html" 
                                onChange={handleFileChange}
                                disabled={isUploading}
                                style={{
                                    padding: '0.5rem',
                                    border: '1px dashed var(--border-color)',
                                    borderRadius: '0.25rem',
                                    background: 'var(--bg-primary)'
                                }}
                            />
                            
                            <button
                                onClick={handleUpload}
                                disabled={!file || isUploading}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'var(--accent-color)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    fontWeight: 500,
                                    cursor: (!file || isUploading) ? 'not-allowed' : 'pointer',
                                    opacity: (!file || isUploading) ? 0.6 : 1,
                                    alignSelf: 'flex-start'
                                }}
                            >
                                {isUploading ? 'Importing...' : 'Upload and Import'}
                            </button>

                            {uploadStatus && (
                                <div style={{ 
                                    padding: '0.75rem', 
                                    borderRadius: '0.25rem', 
                                    fontSize: '0.875rem',
                                    background: uploadStatus.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: uploadStatus.type === 'success' ? '#10b981' : '#ef4444',
                                    border: `1px solid ${uploadStatus.type === 'success' ? '#10b981' : '#ef4444'}`
                                }}>
                                    {uploadStatus.message}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', marginTop: '1.5rem' }}>
                        <h3 style={{ fontWeight: 500, margin: '0 0 0.5rem 0' }}>Export Bookmarks</h3>
                        <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem 0', fontSize: '0.875rem' }}>
                            Download a backup of your bookmarks in Netscape HTML or JSON format. The HTML format can be imported into most web browsers.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => handleExport('html')}
                                disabled={isExportingHTML}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '0.375rem',
                                    fontWeight: 500,
                                    cursor: isExportingHTML ? 'not-allowed' : 'pointer',
                                    opacity: isExportingHTML ? 0.6 : 1,
                                }}
                            >
                                {isExportingHTML ? 'Exporting HTML...' : 'Export as HTML'}
                            </button>
                            
                            <button
                                onClick={() => handleExport('json')}
                                disabled={isExportingJSON}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '0.375rem',
                                    fontWeight: 500,
                                    cursor: isExportingJSON ? 'not-allowed' : 'pointer',
                                    opacity: isExportingJSON ? 0.6 : 1,
                                }}
                            >
                                {isExportingJSON ? 'Exporting JSON...' : 'Export as JSON'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;

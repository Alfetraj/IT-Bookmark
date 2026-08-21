import React, { useState, useEffect } from 'react';
import { Copy, Link, UserPlus, Trash2, Shield, Globe } from 'lucide-react';
import api from '../../services/api';
import styles from './ShareModal.module.scss';

interface Member {
  id: string;
  user_id: string;
  role: string;
  users: {
    name: string | null;
    email: string;
  };
}

interface ShareModalProps {
  collectionId: string;
  collectionName: string;
  shareToken: string | null;
  onClose: () => void;
  onShareUpdated: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ collectionId, collectionName, shareToken: initialToken, onClose, onShareUpdated }) => {
  const [activeTab, setActiveTab] = useState<'link' | 'members'>('link');
  const [shareToken, setShareToken] = useState<string | null>(initialToken);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New member form
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('viewer');

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers();
    }
  }, [activeTab]);

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/collections/${collectionId}/members`);
      setMembers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch members');
    }
  };

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/collections/${collectionId}/share`);
      setShareToken(res.data.shareToken);
      onShareUpdated();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate link');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeLink = async () => {
    setLoading(true);
    try {
      await api.delete(`/collections/${collectionId}/share`);
      setShareToken(null);
      onShareUpdated();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to revoke link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareToken) return;
    const url = `${window.location.origin}/shared/${shareToken}`;
    navigator.clipboard.writeText(url);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail) return;
    // In a real app we might lookup the user ID by email first.
    // For this prototype, we'll assume the endpoint accepts an email directly and does the lookup.
    // Wait, the backend expects `targetUserId`. So we need to look it up or change the backend.
    // Let's assume the backend will need an update or we show a disclaimer.
    setError("Adding members requires a user lookup endpoint which is pending. Use Link Sharing for now.");
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Share: {collectionName}</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.tabs}>
          <button 
            className={activeTab === 'link' ? styles.activeTab : ''} 
            onClick={() => setActiveTab('link')}
          >
            <Link size={16} /> Link Sharing
          </button>
          <button 
            className={activeTab === 'members' ? styles.activeTab : ''} 
            onClick={() => setActiveTab('members')}
          >
            <UserPlus size={16} /> Members
          </button>
        </div>

        <div className={styles.content}>
          {error && <div className={styles.error}>{error}</div>}

          {activeTab === 'link' ? (
            <div className={styles.tabContent}>
              <p className={styles.description}>
                Anyone with this link can view this collection and its bookmarks. They will not be able to edit or add bookmarks.
              </p>
              
              {shareToken ? (
                <div className={styles.linkActive}>
                  <div className={styles.linkBox}>
                    <Globe size={18} className={styles.globeIcon} />
                    <input 
                      type="text" 
                      readOnly 
                      value={`${window.location.origin}/shared/${shareToken}`} 
                    />
                    <button onClick={handleCopyLink} title="Copy Link"><Copy size={18} /></button>
                  </div>
                  <button className={styles.dangerBtn} onClick={handleRevokeLink} disabled={loading}>
                    Disable Public Link
                  </button>
                </div>
              ) : (
                <button className={styles.primaryBtn} onClick={handleGenerateLink} disabled={loading}>
                  Generate Public Link
                </button>
              )}
            </div>
          ) : (
            <div className={styles.tabContent}>
              <form onSubmit={handleAddMember} className={styles.inviteForm}>
                <input 
                  type="email" 
                  placeholder="Collaborator's email address" 
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  required
                />
                <select value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value)}>
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                </select>
                <button type="submit" disabled={loading}>Invite</button>
              </form>

              <div className={styles.memberList}>
                <h4>Current Members</h4>
                {members.length === 0 ? (
                  <p className={styles.empty}>No collaborators yet.</p>
                ) : (
                  <ul>
                    {members.map(member => (
                      <li key={member.id}>
                        <div className={styles.memberInfo}>
                          <span className={styles.name}>{member.users.name || 'User'}</span>
                          <span className={styles.email}>{member.users.email}</span>
                        </div>
                        <div className={styles.memberActions}>
                          <span className={styles.roleBadge}><Shield size={12} /> {member.role}</span>
                          <button className={styles.iconBtn}><Trash2 size={16} /></button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

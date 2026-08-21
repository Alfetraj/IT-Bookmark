import React, { useState, useEffect } from 'react';
import { useProfile } from '../modules/profile/hooks/useProfile';

const Profile: React.FC = () => {
    const { profile, isLoading, error, updateProfile, isUpdating } = useProfile();
    const [name, setName] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (profile?.name) {
            setName(profile.name);
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProfile(name);
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Failed to update profile', err);
        }
    };

    if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading profile...</div>;
    if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>Error loading profile.</div>;

    return (
        <div>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Profile</h1>
                <p style={{ color: 'var(--text-secondary, #6b7280)', margin: '0.5rem 0 0' }}>
                    Manage your account settings and preferences.
                </p>
            </header>

            <div className="glass-card" style={{ maxWidth: '600px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
                        <input
                            type="email"
                            value={profile?.email || ''}
                            disabled
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.375rem',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-primary)',
                                color: 'var(--text-secondary)',
                                opacity: 0.7,
                                cursor: 'not-allowed'
                            }}
                        />
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.375rem',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-primary)',
                                color: 'var(--text-primary)'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'var(--accent-color)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                fontWeight: 500,
                                cursor: isUpdating ? 'not-allowed' : 'pointer',
                                opacity: isUpdating ? 0.7 : 1
                            }}
                        >
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                        {successMessage && <span style={{ color: '#10b981', fontSize: '0.875rem' }}>{successMessage}</span>}
                    </div>
                </form>

                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Account Details</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Member since: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Profile;

import React, { useState, useRef } from 'react';

const initialProfile = {
  name: 'Alice Smith',
  email: 'alice@example.com',
  phone: '+1 234 567 8901',
  avatar: null as string | null,
};

const avatarStyle: React.CSSProperties = {
  width: 120,
  height: 120,
  borderRadius: '50%',
  background: '#007bff',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 56,
  margin: '0 auto 24px auto',
  userSelect: 'none',
  position: 'relative',
  overflow: 'visible',
};

const cameraIconStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: -8,
  left: '50%',
  transform: 'translateX(-50%)',
  background: '#fff',
  borderRadius: '50%',
  boxShadow: '0 1px 4px #bbb',
  padding: 4,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2,
};

const cardStyle: React.CSSProperties = {
  maxWidth: 350,
  margin: '40px auto',
  padding: 32,
  boxShadow: '0 2px 16px #eee',
  borderRadius: 20,
  background: '#fff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const labelStyle: React.CSSProperties = {
  fontWeight: 600,
  marginBottom: 4,
  marginTop: 16,
  display: 'block',
  textAlign: 'left',
  width: '100%',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  fontSize: 16,
  borderRadius: 6,
  border: '1px solid #ccc',
  marginBottom: 8,
  boxSizing: 'border-box',
};

const buttonRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  marginTop: 16,
  width: '100%',
  justifyContent: 'center',
};

const buttonStyle: React.CSSProperties = {
  flex: 1,
  padding: '12px 0',
  fontSize: 18,
  borderRadius: 10,
  border: 'none',
  background: '#f5f5f5',
  fontWeight: 600,
  cursor: 'pointer',
};

const fieldBlockStyle: React.CSSProperties = {
  width: '100%',
  marginBottom: 8,
};

const valueStyle: React.CSSProperties = {
  fontSize: 18,
  width: '100%',
  textAlign: 'center',
};

const Profile: React.FC = () => {
  const [profile, setProfile] = useState(initialProfile);
  const [editMode, setEditMode] = useState(false);
  const [temp, setTemp] = useState(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = () => {
    setEditMode(true);
    setTemp(profile);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemp({ ...temp, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    setProfile(temp);
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditMode(false);
    setTemp(profile);
  };

  const handleAvatarClick = () => {
    if (editMode && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setTemp({ ...temp, avatar: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const avatarToShow = editMode ? temp.avatar : profile.avatar;
  const nameToShow = editMode ? temp.name : profile.name;

  return (
    <div style={cardStyle}>
      <div style={{ position: 'relative', marginBottom: 8, width: 120, height: 120 }}>
        <div style={{ ...avatarStyle, background: avatarToShow ? 'transparent' : '#007bff', position: 'relative', width: 120, height: 120 }}>
          {avatarToShow ? (
            <img src={avatarToShow} alt="avatar" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'contain', position: 'relative', zIndex: 1, pointerEvents: 'none' }} />
          ) : (
            <span>{nameToShow.charAt(0).toUpperCase()}</span>
          )}
          {editMode && (
            <span style={{ ...cameraIconStyle, zIndex: 3 }} onClick={handleAvatarClick} title="Change profile picture">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#007bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="4"/><path d="M5.5 7h13l-1.38-2.76A2 2 0 0 0 15.24 3H8.76a2 2 0 0 0-1.88 1.24L5.5 7z"/><rect x="2" y="7" width="20" height="14" rx="2"/></svg>
              <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} />
            </span>
          )}
        </div>
      </div>
      <div style={fieldBlockStyle}>
        <label style={labelStyle}>Name:</label>
        {editMode ? (
          <input
            name="name"
            value={temp.name}
            onChange={handleChange}
            style={inputStyle}
          />
        ) : (
          <div style={{ ...valueStyle, textAlign: 'left' }}>{profile.name}</div>
        )}
      </div>
      <div style={fieldBlockStyle}>
        <label style={labelStyle}>Email:</label>
        {editMode ? (
          <input
            name="email"
            value={temp.email}
            onChange={handleChange}
            style={inputStyle}
          />
        ) : (
          <div style={valueStyle}>{profile.email}</div>
        )}
      </div>
      <div style={fieldBlockStyle}>
        <label style={labelStyle}>Phone:</label>
        {editMode ? (
          <input
            name="phone"
            value={temp.phone}
            onChange={handleChange}
            style={inputStyle}
          />
        ) : (
          <div style={{ ...valueStyle, textAlign: 'left' }}>{profile.phone}</div>
        )}
      </div>
      <div style={buttonRowStyle}>
        {!editMode ? (
          <button data-testid="edit-profile" style={buttonStyle} onClick={handleEdit}>Edit</button>
        ) : (
          <>
            <button data-testid="submit-profile" style={buttonStyle} onClick={handleSubmit}>Submit</button>
            <button data-testid="cancel-profile" style={buttonStyle} onClick={handleCancel}>Cancel</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile; 
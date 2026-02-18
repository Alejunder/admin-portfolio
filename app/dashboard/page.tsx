'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: string;
}

interface Project {
  id: string;
  slug: string;
  title: { en: string; es: string };
  description: { en: string; es: string };
  technologies?: string[];
  accentColor: string;
  imageUrl?: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  published: boolean;
  featured: boolean;
  order: number;
}

interface Certification {
  id: string;
  title: { en: string; es: string };
  issuer?: { en: string; es: string };
  imageUrl: string;
  credentialUrl: string | null;
  published: boolean;
  featured: boolean;
  order: number;
}

interface About {
  id: string;
  title: { en: string; es: string };
  description: { en: string; es: string };
  shortBio?: { en: string; es: string } | null;
  location?: string | null;
  email?: string | null;
  updatedAt: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  status: string;
  createdAt: string;
}

type ActiveTab = 'about' | 'projects' | 'certifications' | 'contact';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('about');
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [about, setAbout] = useState<About | null>(null);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [editingItem, setEditingItem] = useState<Project | Certification | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      if (activeTab === 'about') {
        loadAbout();
      } else if (activeTab === 'projects') {
        loadProjects();
      } else if (activeTab === 'certifications') {
        loadCertifications();
      } else if (activeTab === 'contact') {
        loadContactMessages();
      }
    }
  }, [activeTab, user]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!data.user) {
        router.push('/login');
        return;
      }

      setUser(data.user);
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadAbout = async () => {
    try {
      const response = await fetch('/api/admin/about');
      const data = await response.json();
      if (data.success && data.data) {
        setAbout(data.data);
      }
    } catch (error) {
      console.error('Failed to load about:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/admin/projects');
      const data = await response.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadCertifications = async () => {
    try {
      const response = await fetch('/api/admin/certifications');
      const data = await response.json();
      if (data.success) {
        setCertifications(data.data);
      }
    } catch (error) {
      console.error('Failed to load certifications:', error);
    }
  };

  const loadContactMessages = async () => {
    try {
      const response = await fetch('/api/admin/contact');
      const data = await response.json();
      if (data.success) {
        setContactMessages(data.data);
      }
    } catch (error) {
      console.error('Failed to load contact messages:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDelete = async (id: string, type: 'project' | 'certification') => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const endpoint = type === 'project' 
        ? `/api/admin/projects/${id}` 
        : `/api/admin/certifications/${id}`;
      
      const response = await fetch(endpoint, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        if (type === 'project') {
          loadProjects();
        } else {
          loadCertifications();
        }
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch (error) {
      alert('Failed to delete item');
    }
  };

  const handleTogglePublished = async (item: Project | Certification, type: 'project' | 'certification') => {
    try {
      const endpoint = type === 'project' 
        ? `/api/admin/projects/${item.id}` 
        : `/api/admin/certifications/${item.id}`;
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, published: !item.published }),
      });
      
      const data = await response.json();
      if (data.success) {
        if (type === 'project') {
          loadProjects();
        } else {
          loadCertifications();
        }
      } else {
        alert(data.error || 'Failed to update');
      }
    } catch (error) {
      alert('Failed to update item');
    }
  };

  const handleSaveAbout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      title: {
        en: formData.get('title_en') as string,
        es: formData.get('title_es') as string,
      },
      description: {
        en: formData.get('description_en') as string,
        es: formData.get('description_es') as string,
      },
    };

    try {
      setSaving(true);
      const response = await fetch('/api/admin/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        setAbout(result.data);
        alert('About section updated successfully!');
      } else {
        alert(result.error || 'Failed to update');
      }
    } catch (error) {
      alert('Failed to save about section');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`/api/admin/contact/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        loadContactMessages();
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch (error) {
      alert('Failed to delete message');
    }
  };

  const handleSaveProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const githubUrl = (formData.get('githubUrl') as string)?.trim();
    const liveUrl = (formData.get('liveUrl') as string)?.trim();
    
    const projectData = {
      slug: formData.get('slug') as string,
      title: {
        en: formData.get('title_en') as string,
        es: formData.get('title_es') as string,
      },
      description: {
        en: formData.get('description_en') as string,
        es: formData.get('description_es') as string,
      },
      technologies: [],
      accentColor: formData.get('accentColor') as string,
      imageUrl: null,
      githubUrl: githubUrl || null,
      liveUrl: liveUrl || null,
      published: formData.get('published') === 'true',
      featured: formData.get('featured') === 'true',
      order: parseInt(formData.get('order') as string) || 0,
    };

    try {
      setSaving(true);
      const url = editingItem ? `/api/admin/projects/${editingItem.id}` : '/api/admin/projects';
      const method = editingItem ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();
      if (result.success) {
        loadProjects();
        setShowForm(false);
        setEditingItem(null);
        alert(`Project ${editingItem ? 'updated' : 'created'} successfully!`);
      } else {
        alert(result.error || 'Failed to save project');
      }
    } catch (error) {
      alert('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'certifications');

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = await response.json();
      if (result.success) {
        setUploadedImageUrl(result.data.path);
        alert('Image uploaded successfully!');
      } else {
        alert(result.error || 'Failed to upload image');
      }
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveCertification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const credentialUrl = (formData.get('credentialUrl') as string)?.trim();
    const manualImageUrl = (formData.get('imageUrl') as string)?.trim();
    
    // Use uploaded image, manual URL, or existing image (when editing)
    const imageUrl = uploadedImageUrl || manualImageUrl || (editingItem as Certification)?.imageUrl;
    
    if (!imageUrl) {
      alert('Please upload an image or enter an image URL');
      return;
    }
    
    const certData = {
      title: {
        en: formData.get('title_en') as string,
        es: formData.get('title_es') as string,
      },
      imageUrl,
      credentialUrl: credentialUrl || null,
      published: formData.get('published') === 'true',
      featured: formData.get('featured') === 'true',
      order: parseInt(formData.get('order') as string) || 0,
    };

    try {
      setSaving(true);
      const url = editingItem ? `/api/admin/certifications/${editingItem.id}` : '/api/admin/certifications';
      const method = editingItem ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(certData),
      });

      const result = await response.json();
      if (result.success) {
        loadCertifications();
        setShowForm(false);
        setEditingItem(null);
        setUploadedImageUrl(null);
        alert(`Certification ${editingItem ? 'updated' : 'created'} successfully!`);
      } else {
        alert(result.error || 'Failed to save certification');
      }
    } catch (error) {
      alert('Failed to save certification');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0C0C0C' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="spinner"></div>
          <div className="text-lg glow-text" style={{ color: '#F2613F' }}>Initializing System...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full scanline flex flex-col" style={{ background: '#0C0C0C' }}>
      {/* Navigation */}
      <nav className="neuro-card w-full" style={{ borderRadius: '0', borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 w-full">
          <div className="flex justify-between h-20 items-center w-full">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold glow-text tracking-wider" style={{ color: '#F2613F' }}>
                ALECAM.DEV
              </h1>
              <span className="text-xs px-3 py-1.5 rounded-full font-semibold" 
                    style={{ 
                      background: 'rgba(155, 57, 34, 0.3)',
                      border: '1px solid rgba(242, 97, 63, 0.3)',
                      color: '#a8a8a8'
                    }}>
                ADMIN
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-sm" style={{ color: '#a8a8a8' }}>
                <span style={{ color: '#9B3922' }}>●</span> {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="neuro-btn text-sm"
                style={{ padding: '10px 24px' }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="neuro-card w-full" style={{ borderRadius: '0', borderLeft: 'none', borderRight: 'none', borderTop: 'none', marginTop: '-1px' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 w-full">
          <nav className="flex space-x-2 w-full" aria-label="Tabs">
            {[
              { key: 'about', label: 'About', count: null },
              { key: 'projects', label: 'Projects', count: projects.length },
              { key: 'certifications', label: 'Certifications', count: certifications.length },
              { key: 'contact', label: 'Messages', count: contactMessages.length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as ActiveTab)}
                className={`py-5 px-8 font-medium text-sm transition-all relative ${
                  activeTab === tab.key
                    ? 'text-white'
                    : 'hover:text-white'
                }`}
                style={{ 
                  color: activeTab === tab.key ? '#F2613F' : '#6b6b6b',
                  borderBottom: activeTab === tab.key ? '3px solid #F2613F' : '3px solid transparent',
                  textShadow: activeTab === tab.key ? '0 0 10px rgba(242, 97, 63, 0.5)' : 'none'
                }}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2.5 px-2.5 py-1 text-xs rounded-full font-semibold" 
                        style={{ 
                          background: activeTab === tab.key ? 'rgba(242, 97, 63, 0.2)' : 'rgba(155, 57, 34, 0.2)',
                          border: `1px solid ${activeTab === tab.key ? 'rgba(242, 97, 63, 0.4)' : 'rgba(155, 57, 34, 0.3)'}`,
                          color: activeTab === tab.key ? '#F2613F' : '#9B3922'
                        }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full flex items-start justify-center py-10">
        <div className="max-w-6xl w-full px-6 sm:px-8 lg:px-10">
          
          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="w-full">
              <h2 className="text-4xl font-bold mb-8 glow-text" style={{ color: '#F2613F' }}>
                About Section
              </h2>
              <div className="neuro-card p-10 w-full">
                <form key={about?.id || 'new-about'} onSubmit={handleSaveAbout}>
                  <div className="space-y-8">
                    {/* Title */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-3 tracking-wide" style={{ color: '#a8a8a8' }}>
                          Title (English) *
                        </label>
                        <input
                          type="text"
                          name="title_en"
                          defaultValue={about?.title?.en || ''}
                          required
                          className="neuro-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-3 tracking-wide" style={{ color: '#a8a8a8' }}>
                          Title (Spanish) *
                        </label>
                        <input
                          type="text"
                          name="title_es"
                          defaultValue={about?.title?.es || ''}
                          required
                          className="neuro-input"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-3 tracking-wide" style={{ color: '#a8a8a8' }}>
                          Description (English) *
                        </label>
                        <textarea
                          name="description_en"
                          defaultValue={about?.description?.en || ''}
                          required
                          rows={6}
                          className="neuro-input resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-3 tracking-wide" style={{ color: '#a8a8a8' }}>
                          Description (Spanish) *
                        </label>
                        <textarea
                          name="description_es"
                          defaultValue={about?.description?.es || ''}
                          required
                          rows={6}
                          className="neuro-input resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <button
                        type="submit"
                        disabled={saving}
                        className="neuro-btn"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold glow-text" style={{ color: '#F2613F' }}>Projects</h2>
                <button
                  onClick={() => { setEditingItem(null); setShowForm(true); }}
                  className="neuro-btn"
                >
                  + Add Project
                </button>
              </div>

              <div className="neuro-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(155, 57, 34, 0.3)' }}>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" 
                            style={{ color: '#9B3922' }}>
                          Title (EN)
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" 
                            style={{ color: '#9B3922' }}>
                          Slug
                        </th>
                        <th className="px-8 py-5 text-left text-xs font-semibold uppercase tracking-wider" 
                            style={{ color: '#9B3922' }}>
                          Status
                        </th>
                        <th className="px-8 py-5 text-left text-xs font-semibold uppercase tracking-wider" 
                            style={{ color: '#9B3922' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'rgba(72, 30, 20, 0.3)' }}>
                      {projects.map((project) => (
                        <tr key={project.id} className="hover:bg-[rgba(72,30,20,0.1)] transition-colors">
                          <td className="px-8 py-5 whitespace-nowrap">
                            <div className="text-sm font-semibold text-white">
                              {project.title.en}
                            </div>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap">
                            <div className="text-sm" style={{ color: '#a8a8a8' }}>{project.slug}</div>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap">
                            <div className="flex gap-2">
                              <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full`}
                                    style={{
                                      background: project.published ? 'rgba(76, 175, 80, 0.2)' : 'rgba(155, 57, 34, 0.2)',
                                      border: `1px solid ${project.published ? 'rgba(76, 175, 80, 0.4)' : 'rgba(155, 57, 34, 0.4)'}`,
                                      color: project.published ? '#90EE90' : '#9B3922'
                                    }}>
                                {project.published ? 'Published' : 'Draft'}
                              </span>
                              {project.featured && (
                                <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full"
                                      style={{
                                        background: 'rgba(242, 97, 63, 0.2)',
                                        border: '1px solid rgba(242, 97, 63, 0.4)',
                                        color: '#F2613F'
                                      }}>
                                  Featured
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold">
                            <div className="flex gap-4">
                              <button
                                onClick={() => handleTogglePublished(project, 'project')}
                                className="transition-colors"
                                style={{ color: '#9B3922' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#F2613F'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#9B3922'}
                              >
                                {project.published ? 'Unpublish' : 'Publish'}
                              </button>
                              <button
                                onClick={() => { setEditingItem(project); setShowForm(true); }}
                                className="transition-colors"
                                style={{ color: '#9B3922' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#F2613F'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#9B3922'}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(project.id, 'project')}
                                className="transition-colors"
                                style={{ color: '#9B3922' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#F2613F'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#9B3922'}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {projects.length === 0 && (
                    <div className="text-center py-16" style={{ color: '#6b6b6b' }}>
                      No projects yet. Click &quot;Add Project&quot; to create one.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Certifications Tab */}
          {activeTab === 'certifications' && (
            <div className="w-full">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold glow-text" style={{ color: '#F2613F' }}>Certifications</h2>
                <button
                  onClick={() => { setEditingItem(null); setShowForm(true); setUploadedImageUrl(null); }}
                  className="neuro-btn"
                >
                  + Add Certification
                </button>
              </div>

              <div className="neuro-card overflow-hidden w-full">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(155, 57, 34, 0.3)' }}>
                        <th className="px-8 py-5 text-left text-xs font-semibold uppercase tracking-wider" 
                            style={{ color: '#9B3922' }}>
                          Title (EN)
                        </th>
                        <th className="px-8 py-5 text-left text-xs font-semibold uppercase tracking-wider" 
                            style={{ color: '#9B3922' }}>
                          Status
                        </th>
                        <th className="px-8 py-5 text-left text-xs font-semibold uppercase tracking-wider" 
                            style={{ color: '#9B3922' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'rgba(72, 30, 20, 0.3)' }}>
                      {certifications.map((cert) => (
                        <tr key={cert.id} className="hover:bg-[rgba(72,30,20,0.1)] transition-colors">
                          <td className="px-8 py-5 whitespace-nowrap">
                            <div className="text-sm font-semibold text-white">
                              {cert.title.en}
                            </div>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap">
                            <div className="flex gap-2">
                              <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full`}
                                    style={{
                                      background: cert.published ? 'rgba(76, 175, 80, 0.2)' : 'rgba(155, 57, 34, 0.2)',
                                      border: `1px solid ${cert.published ? 'rgba(76, 175, 80, 0.4)' : 'rgba(155, 57, 34, 0.4)'}`,
                                      color: cert.published ? '#90EE90' : '#9B3922'
                                    }}>
                                {cert.published ? 'Published' : 'Draft'}
                              </span>
                              {cert.featured && (
                                <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full"
                                      style={{
                                        background: 'rgba(242, 97, 63, 0.2)',
                                        border: '1px solid rgba(242, 97, 63, 0.4)',
                                        color: '#F2613F'
                                      }}>
                                  Featured
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold">
                            <div className="flex gap-4">
                              <button
                                onClick={() => handleTogglePublished(cert, 'certification')}
                                className="transition-colors"
                                style={{ color: '#9B3922' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#F2613F'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#9B3922'}
                              >
                                {cert.published ? 'Unpublish' : 'Publish'}
                              </button>
                              <button
                                onClick={() => { setEditingItem(cert); setShowForm(true); setUploadedImageUrl(null); }}
                                className="transition-colors"
                                style={{ color: '#9B3922' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#F2613F'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#9B3922'}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(cert.id, 'certification')}
                                className="transition-colors"
                                style={{ color: '#9B3922' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#9B3922'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#9B3922'}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {certifications.length === 0 && (
                    <div className="text-center py-16" style={{ color: '#6b6b6b' }}>
                      No certifications yet. Click &quot;Add Certification&quot; to create one.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Contact Messages Tab */}
          {activeTab === 'contact' && (
            <div className="w-full">
              <h2 className="text-3xl font-bold mb-8 glow-text" style={{ color: '#F2613F' }}>Contact Messages</h2>
              <div className="neuro-card w-full">
                {contactMessages.length === 0 ? (
                  <div className="text-center py-16" style={{ color: '#6b6b6b' }}>
                    No contact messages yet.
                  </div>
                ) : (
                  <div className="divide-y" style={{ borderColor: 'rgba(72, 30, 20, 0.3)' }}>
                    {contactMessages.map((message) => (
                      <div key={message.id} className="p-8 hover:bg-[rgba(72,30,20,0.1)] transition-colors">
                        <div className="flex justify-between items-start gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-medium text-white">
                                {message.name}
                              </h3>
                              <span className={`px-3 py-1 text-xs rounded-full font-semibold`}
                                    style={{
                                      background: message.status === 'UNREAD' 
                                        ? 'rgba(242, 97, 63, 0.2)' 
                                        : message.status === 'READ'
                                        ? 'rgba(155, 57, 34, 0.2)'
                                        : 'rgba(155, 57, 34, 0.2)',
                                      border: `1px solid ${
                                        message.status === 'UNREAD'
                                        ? 'rgba(242, 97, 63, 0.4)'
                                        : 'rgba(155, 57, 34, 0.4)'
                                      }`,
                                      color: message.status === 'UNREAD' ? '#F2613F' : '#9B3922'
                                    }}>
                                {message.status}
                              </span>
                            </div>
                            <p className="text-sm mb-1">
                              <a href={`mailto:${message.email}`} 
                                 className="transition-colors"
                                 style={{ color: '#9B3922' }}
                                 onMouseEnter={(e) => e.currentTarget.style.color = '#F2613F'}
                                 onMouseLeave={(e) => e.currentTarget.style.color = '#9B3922'}>
                                {message.email}
                              </a>
                            </p>
                            {message.subject && (
                              <p className="text-sm font-medium mb-2" style={{ color: '#a8a8a8' }}>
                                Subject: {message.subject}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap mt-3" style={{ color: '#ffffff' }}>
                              {message.message}
                            </p>
                            <p className="text-xs mt-3" style={{ color: '#6b6b6b' }}>
                              Received: {new Date(message.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="ml-4 text-sm font-medium transition-colors px-4 py-2 neuro-btn"
                            style={{ padding: '8px 16px' }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto"
             style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="neuro-card max-w-4xl w-full my-8 p-8 sm:p-10 relative">
            {/* Close button */}
            <button
              onClick={() => { setShowForm(false); setEditingItem(null); }}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-2xl transition-colors"
              style={{ color: '#9B3922' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#F2613F'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#9B3922'}
            >
              ×
            </button>

            <h3 className="text-xl sm:text-2xl font-bold mb-8 glow-text" style={{ color: '#F2613F' }}>
              {editingItem ? 'Edit' : 'Add'} {activeTab === 'projects' ? 'Project' : 'Certification'}
            </h3>
            
            {activeTab === 'projects' ? (
              <form key={editingItem?.id || 'new-project'} onSubmit={handleSaveProject} className="space-y-6">
                {/* Slug */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#a8a8a8' }}>
                    Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    defaultValue={(editingItem as Project)?.slug || ''}
                    required
                    placeholder="project-slug"
                    className="neuro-input"
                  />
                </div>

                {/* Title */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#a8a8a8' }}>
                      Title (English) *
                    </label>
                    <input
                      type="text"
                      name="title_en"
                      defaultValue={(editingItem as Project)?.title?.en || ''}
                      required
                      className="neuro-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#a8a8a8' }}>
                      Title (Spanish) *
                    </label>
                    <input
                      type="text"
                      name="title_es"
                      defaultValue={(editingItem as Project)?.title?.es || ''}
                      required
                      className="neuro-input"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#a8a8a8' }}>
                      Description (English) *
                    </label>
                    <textarea
                      name="description_en"
                      defaultValue={(editingItem as Project)?.description?.en || ''}
                      required
                      rows={4}
                      className="neuro-input resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#a8a8a8' }}>
                      Description (Spanish) *
                    </label>
                    <textarea
                      name="description_es"
                      defaultValue={(editingItem as Project)?.description?.es || ''}
                      required
                      rows={4}
                      className="neuro-input resize-none"
                    />
                  </div>
                </div>

                {/* Accent Color & Order */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#a8a8a8' }}>
                      Accent Color *
                    </label>
                    <input
                      type="text"
                      name="accentColor"
                      defaultValue={(editingItem as Project)?.accentColor || '#6366f1'}
                      required
                      placeholder="#6366f1"
                      className="neuro-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#a8a8a8' }}>
                      Order
                    </label>
                    <input
                      type="number"
                      name="order"
                      defaultValue={(editingItem as Project)?.order || 0}
                      className="neuro-input"
                    />
                  </div>
                </div>

                {/* URLs */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#a8a8a8' }}>
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      name="githubUrl"
                      defaultValue={(editingItem as Project)?.githubUrl || ''}
                      placeholder="https://github.com/..."
                      className="neuro-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#a8a8a8' }}>
                      Live URL
                    </label>
                    <input
                      type="url"
                      name="liveUrl"
                      defaultValue={(editingItem as Project)?.liveUrl || ''}
                      placeholder="https://example.com"
                      className="neuro-input"
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="published"
                      value="true"
                      defaultChecked={(editingItem as Project)?.published || false}
                      className="mr-2 w-4 h-4"
                      style={{ accentColor: '#F2613F' }}
                    />
                    <span className="text-sm font-semibold" style={{ color: '#a8a8a8' }}>Published</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="featured"
                      value="true"
                      defaultChecked={(editingItem as Project)?.featured || false}
                      className="mr-2 w-4 h-4"
                      style={{ accentColor: '#F2613F' }}
                    />
                    <span className="text-sm font-semibold" style={{ color: '#a8a8a8' }}>Featured</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-6 pt-8 border-t" style={{ borderColor: 'rgba(155, 57, 34, 0.3)' }}>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditingItem(null); }}
                    className="flex-1 neuro-btn"
                    style={{ 
                      background: 'linear-gradient(145deg, rgba(72, 30, 20, 0.6), rgba(12, 12, 12, 0.8))',
                      borderColor: 'rgba(155, 57, 34, 0.3)'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 neuro-btn"
                  >
                    {saving ? 'Saving...' : editingItem ? 'Update Project' : 'Create Project'}
                  </button>
                </div>
              </form>
            ) : (
              <form key={editingItem?.id || 'new-certification'} onSubmit={handleSaveCertification} className="space-y-6">
                {/* Title */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#a8a8a8' }}>
                      Title (English) *
                    </label>
                    <input
                      type="text"
                      name="title_en"
                      defaultValue={(editingItem as Certification)?.title?.en || ''}
                      required
                      className="neuro-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#a8a8a8' }}>
                      Title (Spanish) *
                    </label>
                    <input
                      type="text"
                      name="title_es"
                      defaultValue={(editingItem as Certification)?.title?.es || ''}
                      required
                      className="neuro-input"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#a8a8a8' }}>
                    Certification Image *
                  </label>
                  
                  {/* Upload Button */}
                  <div className="flex items-center gap-4">
                    <label className="neuro-btn cursor-pointer inline-block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      {uploading ? 'Uploading...' : '📁 Upload Image'}
                    </label>
                    {uploadedImageUrl && (
                      <span className="text-sm" style={{ color: '#90EE90' }}>
                        ✓ Image uploaded
                      </span>
                    )}
                  </div>

                  {/* Preview */}
                  {(uploadedImageUrl || (editingItem as Certification)?.imageUrl) && (
                    <div className="mt-3">
                      <img
                        src={uploadedImageUrl || (editingItem as Certification)?.imageUrl}
                        alt="Preview"
                        className="max-w-xs max-h-48 rounded border-2"
                        style={{ borderColor: 'rgba(242, 97, 63, 0.3)' }}
                      />
                    </div>
                  )}

                  {/* Manual URL Option */}
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm" style={{ color: '#a8a8a8' }}>
                      Or enter image URL manually
                    </summary>
                    <input
                      type="text"
                      name="imageUrl"
                      defaultValue={(editingItem as Certification)?.imageUrl || ''}
                      placeholder="/certifications/diploma.jpg or https://example.com/cert.jpg"
                      className="neuro-input mt-2"
                    />
                  </details>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#a8a8a8' }}>
                    Credential URL
                  </label>
                  <input
                    type="url"
                    name="credentialUrl"
                    defaultValue={(editingItem as Certification)?.credentialUrl || ''}
                    placeholder="https://credential-url.com"
                    className="neuro-input"
                  />
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#a8a8a8' }}>
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    defaultValue={(editingItem as Certification)?.order || 0}
                    className="neuro-input"
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="published"
                      value="true"
                      defaultChecked={(editingItem as Certification)?.published || false}
                      className="mr-2 w-4 h-4"
                      style={{ accentColor: '#F2613F' }}
                    />
                    <span className="text-sm font-semibold" style={{ color: '#a8a8a8' }}>Published</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="featured"
                      value="true"
                      defaultChecked={(editingItem as Certification)?.featured || false}
                      className="mr-2 w-4 h-4"
                      style={{ accentColor: '#F2613F' }}
                    />
                    <span className="text-sm font-semibold" style={{ color: '#a8a8a8' }}>Featured</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-6 pt-8 border-t" style={{ borderColor: 'rgba(155, 57, 34, 0.3)' }}>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditingItem(null); setUploadedImageUrl(null); }}
                    className="flex-1 neuro-btn"
                    style={{ 
                      background: 'linear-gradient(145deg, rgba(72, 30, 20, 0.6), rgba(12, 12, 12, 0.8))',
                      borderColor: 'rgba(155, 57, 34, 0.3)'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 neuro-btn"
                  >
                    {saving ? 'Saving...' : editingItem ? 'Update Certification' : 'Create Certification'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

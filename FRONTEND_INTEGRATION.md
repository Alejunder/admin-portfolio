# Frontend Integration Guide

This guide explains how to integrate the alecam.dev public frontend (React + Vite) with the admin API backend.

---

## 🎯 Data Flow Architecture

```
User → alecam.dev (React + Vite)
     ↓
     fetch() → https://admin.alecam.dev/api/*
     ↓
     Next.js API Routes → Prisma → PostgreSQL (Supabase)
     ↓
     JSON Response (with i18n data)
     ↓
     React Components → Display Content
```

---

## 📡 API Endpoints

### **Public Endpoints** (No Auth Required)

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/api/projects` | GET | Get all published projects | `{ success: true, data: Project[] }` |
| `/api/projects/:id` | GET | Get project by ID or slug | `{ success: true, data: Project }` |
| `/api/certifications` | GET | Get all published certifications | `{ success: true, data: Certification[] }` |
| `/api/certifications/:id` | GET | Get certification by ID | `{ success: true, data: Certification }` |
| `/api/contact` | POST | Submit contact form | `{ success: true, message: string }` |

### **Query Parameters**

| Endpoint | Parameter | Description | Example |
|----------|-----------|-------------|---------|
| `/api/projects` | `featured=true` | Filter featured projects only | `/api/projects?featured=true` |
| `/api/certifications` | `featured=true` | Filter featured certifications only | `/api/certifications?featured=true` |

---

## 📦 Data Structures

### **Project**

```typescript
interface Project {
  id: string;
  slug: string; // URL-friendly identifier
  title: {
    en: string;
    es: string;
  };
  description: {
    en: string;
    es: string;
  };
  technologies: string[]; // e.g., ["React", "Node.js", "PostgreSQL"]
  accentColor: string;    // Hex color for UI (e.g., "#0ff")
  imageUrl: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
```

### **Certification**

```typescript
interface Certification {
  id: string;
  title: {
    en: string;
    es: string;
  };
  issuer: {
    en: string;
    es: string;
  };
  imageUrl: string;        // Path to certificate image
  credentialUrl: string | null; // External verification link
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🔧 Frontend Implementation

### **1. Create API Service**

Create `src/services/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://admin.alecam.dev/api';

/**
 * Fetch all published projects
 * @param {boolean} featuredOnly - If true, only return featured projects
 * @returns {Promise<Project[]>}
 */
export async function fetchProjects(featuredOnly = false) {
  const url = featuredOnly 
    ? `${API_BASE_URL}/projects?featured=true`
    : `${API_BASE_URL}/projects`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch projects');
  }
  
  return data.data;
}

/**
 * Fetch a single project by slug or ID
 * @param {string} slugOrId
 * @returns {Promise<Project>}
 */
export async function fetchProject(slugOrId) {
  const response = await fetch(`${API_BASE_URL}/projects/${slugOrId}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Project not found');
  }
  
  return data.data;
}

/**
 * Fetch all published certifications
 * @param {boolean} featuredOnly
 * @returns {Promise<Certification[]>}
 */
export async function fetchCertifications(featuredOnly = false) {
  const url = featuredOnly
    ? `${API_BASE_URL}/certifications?featured=true`
    : `${API_BASE_URL}/certifications`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch certifications');
  }
  
  return data.data;
}

/**
 * Submit contact form
 * @param {Object} formData - { name, email, subject?, message }
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function submitContactForm(formData) {
  const response = await fetch(`${API_BASE_URL}/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to submit form');
  }
  
  return data;
}
```

---

### **2. Update Projects Section**

Replace hardcoded data in `src/sections/Projects.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ProjectCarousel from "../components/ProjectCarousel";
import { fetchProjects } from "../services/api";
import "./styles/Projects.css";

export default function Projects() {
  const { t, i18n } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchProjects(true); // Fetch only featured projects
      
      // Transform API data to match ProjectCarousel format
      const formattedProjects = data.map(project => ({
        key: project.slug,
        link: project.liveUrl,
        accent: project.accentColor,
        title: project.title[i18n.language] || project.title.en,
        description: project.description[i18n.language] || project.description.en,
        technologies: project.technologies,
        imageUrl: project.imageUrl,
        githubUrl: project.githubUrl,
      }));
      
      setProjects(formattedProjects);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id='Projects' className="projects-section">
        <h2 className="projects-title">{t('projects.title')}</h2>
        <div className="text-center py-12">Loading projects...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section id='Projects' className="projects-section">
        <h2 className="projects-title">{t('projects.title')}</h2>
        <div className="text-center py-12 text-red-500">
          Failed to load projects. Please try again later.
        </div>
      </section>
    );
  }

  return (
    <section id='Projects' className="projects-section">
      <h2 className="projects-title">{t('projects.title')}</h2>
      {projects.length > 0 ? (
        <ProjectCarousel projects={projects} />
      ) : (
        <div className="text-center py-12">No projects available yet.</div>
      )}
    </section>
  );
}
```

---

### **3. Update Certifications Page**

Replace hardcoded data in `src/pages/CertificacionesPage.jsx`:

```jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { useFadeOut } from "../context/FadeOutContext";
import FadeWarpButton from "../components/FadeWarpButton";
import { fetchCertifications } from "../services/api";
import "../pages/styles/certificationsGallery.css";

const CertificacionesPage = () => {
  const { t, i18n } = useTranslation();
  const { controls } = useFadeOut();
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    loadCertifications();
  }, []);

  const loadCertifications = async () => {
    try {
      const data = await fetchCertifications();
      
      // Transform API data to match component format
      const formatted = data.map(cert => ({
        title: cert.title[i18n.language] || cert.title.en,
        issuer: cert.issuer[i18n.language] || cert.issuer.en,
        img: cert.imageUrl,
        link: cert.credentialUrl,
      }));
      
      setCertifications(formatted);
    } catch (err) {
      console.error('Failed to load certifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (index) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  const openModal = (img) => {
    setModalImg(img);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
      setModalImg(null);
    }, 600);
  };

  if (loading) {
    return (
      <motion.section
        className="certifications-page"
        initial={{ opacity: 1 }}
        animate={controls}
      >
        <h2 className="gallery-title">{t('certifications.title')}</h2>
        <div className="text-center py-12">Loading certifications...</div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="certifications-page"
      initial={{ opacity: 1 }}
      animate={controls}
    >
      <h2 className="gallery-title">{t('certifications.title')}</h2>

      <div className="cert-list">
        {certifications.map((cert, index) => (
          <button
            key={index}
            className={`cert-title-btn ${activeIndex === index ? "active" : ""}`}
            onClick={() => handleClick(index)}
          >
            {cert.title}
          </button>
        ))}
      </div>

      <div className="cert-display">
        <AnimatePresence mode="wait">
          {activeIndex !== null && (
            <motion.div
              key={activeIndex}
              className="cert-preview"
              initial={{ opacity: 0, y: 80, scale: 0.8, rotateZ: -15 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateZ: 0 }}
              exit={{ opacity: 0, y: 80, scale: 0.8, rotateZ: 15 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <img
                src={certifications[activeIndex].img}
                alt={certifications[activeIndex].title}
                className="cert-image"
                onClick={() => openModal(certifications[activeIndex].img)}
              />
              <motion.a
                href={certifications[activeIndex].link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-2 caption-button"
              >
                <p className="caption">{certifications[activeIndex].title}</p>
              </motion.a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal code remains the same... */}

      <div className="certifications-fadewarpbutton">
        <FadeWarpButton to="/" textKey="certifications.goBack" launchingKey="certifications.launching" />
      </div>
    </motion.section>
  );
};

export default CertificacionesPage;
```

---

### **4. Update Contact Form**

Update your contact form submission to use the API:

```jsx
import { submitContactForm } from "../services/api";

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    setSubmitting(true);
    
    const formData = {
      name: nameInput.current.value,
      email: emailInput.current.value,
      message: messageInput.current.value,
    };
    
    const result = await submitContactForm(formData);
    
    // Show success message
    setSuccessMessage(t('contact.success'));
    
    // Reset form
    e.target.reset();
    
  } catch (error) {
    console.error('Form submission error:', error);
    setErrorMessage(t('contact.error'));
  } finally {
    setSubmitting(false);
  }
};
```

---

## 🌐 Environment Variables

Create `.env` in your frontend project:

```env
VITE_API_URL=https://admin.alecam.dev/api
```

For local development:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🧪 Testing API Integration

### **Test Projects Endpoint**

```bash
curl https://admin.alecam.dev/api/projects?featured=true
```

Expected response:

```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx",
      "slug": "copilot4yt",
      "title": {
        "en": "AI Thumbnail Generator",
        "es": "Generador de miniaturas con IA"
      },
      "description": {
        "en": "An application that uses AI...",
        "es": "Una aplicación que utiliza IA..."
      },
      "technologies": ["React", "OpenAI API", "Node.js"],
      "accentColor": "#9a031e",
      "liveUrl": "https://copilot4yt.vercel.app/",
      "featured": true,
      "published": true,
      "order": 1
    }
  ]
}
```

### **Test Certifications Endpoint**

```bash
curl https://admin.alecam.dev/api/certifications
```

---

## 🎨 Migrating from Hardcoded to Dynamic

### **Before (Hardcoded)**

```javascript
// src/modules/projectsData.js
export const projectsData = [
  { key: "project1", link: "", accent: "#0ff" },
  { key: "project2", link: "https://example.com", accent: "#9a031e" },
];
```

```json
// src/locales/eng.json
{
  "projects": {
    "project1": {
      "title": "My Project",
      "description": "Project description"
    }
  }
}
```

### **After (Dynamic)**

```javascript
// Fetch from API
const projects = await fetchProjects(true);

// Access i18n data directly from API response
projects.forEach(project => {
  console.log(project.title.en); // "My Project"
  console.log(project.title.es); // "Mi Proyecto"
});
```

---

## 🚀 Deployment Checklist

- [ ] Update frontend `.env` with production API URL
- [ ] Remove hardcoded `projectsData.js` file
- [ ] Remove project translations from `locales/*.json` files
- [ ] Update all components to fetch from API
- [ ] Test all endpoints in production
- [ ] Set up error boundaries for API failures
- [ ] Add loading states for async data
- [ ] Configure CORS if needed (already handled by Next.js)

---

## 🔒 Security Notes

1. **Public API**: Only published projects/certifications are returned
2. **Contact Form**: Rate limiting should be configured on the backend
3. **No Credentials**: Public endpoints don't require authentication
4. **HTTPS Only**: Always use HTTPS in production

---

## 📚 Additional Resources

- API Documentation: `portfolio-admin/API.md`
- Database Schema: `portfolio-admin/prisma/schema.prisma`
- Admin Dashboard: `https://admin.alecam.dev/dashboard`

---

Need help? Check the admin panel at `https://admin.alecam.dev/dashboard` or review the API documentation.

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('[Login] Attempting login with:', { email });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      console.log('[Login] Response status:', response.status);

      const data = await response.json();
      console.log('[Login] Response data:', data);

      if (!response.ok) {
        console.error('[Login] Login failed:', data);
        setError(data.error || 'Login failed');
        return;
      }

      console.log('[Login] Login successful, redirecting to dashboard...');
      console.log('[Login] Waiting 500ms before redirect...');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('[Login] Error during login:', err);
      setError(`Network error: ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 scanline" 
         style={{ background: 'radial-gradient(ellipse at center, rgba(72, 30, 20, 0.2) 0%, #0C0C0C 70%)' }}>
      
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-1 h-1 bg-[#F2613F] rounded-full opacity-20 animate-pulse"
             style={{ top: '20%', left: '10%', animationDuration: '3s' }}></div>
        <div className="absolute w-1 h-1 bg-[#9B3922] rounded-full opacity-20 animate-pulse"
             style={{ top: '60%', left: '80%', animationDuration: '4s', animationDelay: '1s' }}></div>
        <div className="absolute w-1 h-1 bg-[#F2613F] rounded-full opacity-20 animate-pulse"
             style={{ top: '40%', left: '90%', animationDuration: '5s', animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="inline-block mb-8 px-8 py-4 neuro-card">
            <h1 className="text-4xl font-bold glow-text tracking-wider" 
                style={{ color: '#F2613F' }}>
              ALECAM.DEV
            </h1>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Admin Access
          </h2>
          <p className="text-sm" style={{ color: '#a8a8a8' }}>
            Secure Authentication Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="neuro-card p-8 relative">
          {/* Holographic corner accent */}
          <div className="absolute top-0 right-0 w-20 h-20 opacity-20 pointer-events-none"
               style={{ 
                 background: 'radial-gradient(circle at top right, #F2613F, transparent)',
                 filter: 'blur(20px)'
               }}></div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="neuro-card p-4 border-2" 
                   style={{ 
                     borderColor: 'rgba(242, 97, 63, 0.5)',
                     background: 'linear-gradient(145deg, rgba(72, 30, 20, 0.5), rgba(12, 12, 12, 0.8))'
                   }}>
                <p className="text-sm" style={{ color: '#F2613F' }}>⚠ {error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2" 
                       style={{ color: '#a8a8a8' }}>
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="neuro-input"
                  placeholder="admin@alecam.dev"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2" 
                       style={{ color: '#a8a8a8' }}>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="neuro-input"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="neuro-btn w-full text-base font-bold tracking-wide"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff' }}></div>
                  Authenticating...
                </span>
              ) : (
                'ACCESS SYSTEM'
              )}
            </button>
          </form>

          {/* Footer info */}
          <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(155, 57, 34, 0.2)' }}>
            <p className="text-xs text-center" style={{ color: '#6b6b6b' }}>
              Protected by advanced security protocols
            </p>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-1 w-full rounded-full overflow-hidden" 
             style={{ background: 'linear-gradient(90deg, transparent, #9B3922, #F2613F, #9B3922, transparent)' }}>
        </div>
      </div>
    </div>
  );
}

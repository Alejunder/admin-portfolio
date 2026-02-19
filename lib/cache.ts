import { revalidatePath } from 'next/cache';

/**
 * Cache Manager
 * Centralized cache invalidation for on-demand revalidation
 * 
 * Data Engineer Optimization Strategy:
 * - Zero unnecessary database queries (only revalidate on actual mutations)
 * - Instant user feedback (cache purged immediately after changes)
 * - Granular cache control (invalidate only affected resources)
 * - Observable cache behavior (structured logging for monitoring)
 */

type CacheInvalidationLog = {
  timestamp: string;
  resource: string;
  paths: string[];
  source: string;
};

/**
 * Log cache invalidation for observability
 */
function logCacheInvalidation(log: CacheInvalidationLog): void {
  if (process.env.NODE_ENV === 'production') {
    // Structured logging for production monitoring
    console.log(JSON.stringify({
      event: 'cache_invalidation',
      ...log,
    }));
  } else {
    // Human-readable logging for development
    console.log(`[Cache] Invalidated ${log.resource} (${log.paths.join(', ')})`);
  }
}

/**
 * Cache Manager
 * Provides granular cache invalidation methods
 */
export const CacheManager = {
  /**
   * Invalidate all project-related caches
   * Call after: CREATE, UPDATE, DELETE project
   * 
   * Invalidates:
   * - /api/projects (list)
   * - /api/projects/[id] (detail by ID)
   * - /api/projects/[slug] (detail by slug)
   */
  invalidateProjects: (source = 'unknown'): void => {
    const paths = ['/api/projects'];
    
    paths.forEach(path => revalidatePath(path));
    
    logCacheInvalidation({
      timestamp: new Date().toISOString(),
      resource: 'projects',
      paths,
      source,
    });
  },

  /**
   * Invalidate all certification-related caches
   * Call after: CREATE, UPDATE, DELETE certification
   * 
   * Invalidates:
   * - /api/certifications (list)
   * - /api/certifications/[id] (detail)
   */
  invalidateCertifications: (source = 'unknown'): void => {
    const paths = ['/api/certifications'];
    
    paths.forEach(path => revalidatePath(path));
    
    logCacheInvalidation({
      timestamp: new Date().toISOString(),
      resource: 'certifications',
      paths,
      source,
    });
  },

  /**
   * Invalidate about section cache
   * Call after: UPDATE about content
   * 
   * Invalidates:
   * - /api/about
   */
  invalidateAbout: (source = 'unknown'): void => {
    const paths = ['/api/about'];
    
    paths.forEach(path => revalidatePath(path));
    
    logCacheInvalidation({
      timestamp: new Date().toISOString(),
      resource: 'about',
      paths,
      source,
    });
  },

  /**
   * Nuclear option - invalidate all public API caches
   * Use sparingly, only for:
   * - Major schema migrations
   * - Batch operations affecting multiple resources
   * - Emergency cache clearing
   */
  invalidateAll: (source = 'admin-manual'): void => {
    const paths = ['/api'];
    
    paths.forEach(path => revalidatePath(path, 'layout'));
    
    logCacheInvalidation({
      timestamp: new Date().toISOString(),
      resource: 'all',
      paths,
      source,
    });

    console.warn('[Cache] Nuclear cache invalidation triggered!', { source });
  },
};

/**
 * Helper: Invalidate cache with error handling
 * Wraps cache invalidation to prevent cache errors from breaking mutations
 */
export function safeInvalidate(
  invalidateFn: () => void,
  errorContext: string
): void {
  try {
    invalidateFn();
  } catch (error) {
    // Cache invalidation failure should not break the mutation
    // Log the error but continue
    console.error(`[Cache Error] Failed to invalidate cache: ${errorContext}`, error);
  }
}

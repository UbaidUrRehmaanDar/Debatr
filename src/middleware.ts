// Middleware disabled - using layout-based authentication instead
// This is more reliable for this application architecture
// Performance optimizations are handled at the component and caching level

export function middleware() {
  // No-op middleware - pages handle auth themselves
}

export const config = {
  matcher: [], // Disable middleware for all routes
}

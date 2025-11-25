import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { SEOService } from '../services/seo.service';

/**
 * Guard to update SEO metadata when navigating to routes
 */
export const seoGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const seoService = inject(SEOService);
  
  // Get SEO data from route data
  const seoData = route.data['seo'];
  
  if (seoData) {
    seoService.updateTags({
      title: seoData.title,
      description: seoData.description,
      keywords: seoData.keywords,
      url: window.location.href
    });
  }
  
  return true;
};


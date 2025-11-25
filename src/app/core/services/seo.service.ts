import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SEOService {
  private defaultTitle = 'Adalana - Sistema de Gestão de Assinaturas';
  private defaultDescription = 'Sistema completo de gestão de assinaturas e entregas';

  constructor(
    private title: Title,
    private meta: Meta,
    private router: Router
  ) {
    this.initializeSEO();
  }

  /**
   * Initialize SEO with default values
   */
  private initializeSEO(): void {
    this.updateTags({
      title: this.defaultTitle,
      description: this.defaultDescription,
      keywords: 'assinaturas, entregas, gestão, e-commerce, produtos',
      url: window.location.href,
      type: 'website'
    });
  }

  /**
   * Update SEO tags
   */
  updateTags(data: SEOData): void {
    // Update title
    if (data.title) {
      this.title.setTitle(data.title);
    }

    // Update or create meta tags
    if (data.description) {
      this.meta.updateTag({ name: 'description', content: data.description });
      this.meta.updateTag({ property: 'og:description', content: data.description });
      this.meta.updateTag({ name: 'twitter:description', content: data.description });
    }

    if (data.keywords) {
      this.meta.updateTag({ name: 'keywords', content: data.keywords });
    }

    if (data.image) {
      this.meta.updateTag({ property: 'og:image', content: data.image });
      this.meta.updateTag({ name: 'twitter:image', content: data.image });
    }

    if (data.url) {
      this.meta.updateTag({ property: 'og:url', content: data.url });
    }

    if (data.type) {
      this.meta.updateTag({ property: 'og:type', content: data.type });
    }

    // Always update og:title
    const title = data.title || this.defaultTitle;
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ name: 'twitter:title', content: title });
  }

  /**
   * Update title only
   */
  updateTitle(title: string): void {
    this.title.setTitle(title);
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ name: 'twitter:title', content: title });
  }

  /**
   * Update description only
   */
  updateDescription(description: string): void {
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ name: 'twitter:description', content: description });
  }
}


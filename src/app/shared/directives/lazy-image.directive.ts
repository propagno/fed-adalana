import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: 'img[appLazyLoad]',
  standalone: true
})
export class LazyImageDirective implements OnInit, OnDestroy {
  @Input() appLazyLoad: string = ''; // URL da imagem
  @Input() placeholderSrc?: string; // Placeholder opcional
  @Input() errorSrc?: string; // Imagem de erro opcional

  private observer?: IntersectionObserver;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Set placeholder or default gray background
    if (this.placeholderSrc) {
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.placeholderSrc);
    } else {
      // Set default placeholder style
      this.renderer.setStyle(this.el.nativeElement, 'background-color', '#f3f4f6');
      this.renderer.setStyle(this.el.nativeElement, 'min-height', '100px');
    }

    // Add loading class
    this.renderer.addClass(this.el.nativeElement, 'lazy-loading');

    // Create IntersectionObserver
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadImage();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01
      }
    );

    // Start observing
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private loadImage(): void {
    const img = this.el.nativeElement;

    // Create a new image to preload
    const tempImg = new Image();

    tempImg.onload = () => {
      // Image loaded successfully
      this.renderer.setAttribute(img, 'src', this.appLazyLoad);
      this.renderer.removeClass(img, 'lazy-loading');
      this.renderer.addClass(img, 'lazy-loaded');
      
      // Add fade-in animation
      this.renderer.setStyle(img, 'animation', 'fadeIn 0.3s ease-in');
      
      // Stop observing
      if (this.observer) {
        this.observer.unobserve(img);
      }
    };

    tempImg.onerror = () => {
      // Image failed to load
      if (this.errorSrc) {
        this.renderer.setAttribute(img, 'src', this.errorSrc);
      }
      this.renderer.removeClass(img, 'lazy-loading');
      this.renderer.addClass(img, 'lazy-error');
      
      // Stop observing
      if (this.observer) {
        this.observer.unobserve(img);
      }
    };

    // Start loading
    tempImg.src = this.appLazyLoad;
  }
}

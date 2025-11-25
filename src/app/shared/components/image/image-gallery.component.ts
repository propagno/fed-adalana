import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="image-gallery">
      <!-- Main Image -->
      <div class="relative mb-4">
        <div class="aspect-square bg-gray-100 rounded-lg border border-gray-200 overflow-hidden group cursor-zoom-in"
             (click)="showZoom = !showZoom">
          <img [src]="getImageUrl(selectedImage || images[0])" 
               [alt]="'Imagem do produto'"
               (error)="onImageError($event)"
               class="w-full h-full object-contain transition-transform duration-300"
               [class.scale-150]="showZoom">
          <div *ngIf="!getImageUrl(selectedImage || images[0])" class="w-full h-full flex items-center justify-center">
            <div class="text-gray-400 text-display font-display opacity-50">Sem imagem</div>
          </div>
          
          <!-- Zoom Indicator -->
          <div *ngIf="!showZoom" class="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-medium text-body-sm opacity-0 group-hover:opacity-100 transition-opacity">
            Clique para ampliar
          </div>
        </div>
        
        <!-- Navigation Arrows -->
        <button *ngIf="images.length > 1"
                (click)="previousImage()"
                [attr.aria-label]="'Imagem anterior'"
                class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-md transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-light">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button *ngIf="images.length > 1"
                (click)="nextImage()"
                [attr.aria-label]="'Próxima imagem'"
                class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-md transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-light">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <!-- Thumbnails -->
      <div *ngIf="images.length > 1" class="flex gap-2 overflow-x-auto pb-2">
        <button *ngFor="let img of images; let i = index"
                (click)="selectImage(img)"
                [attr.aria-label]="'Selecionar imagem ' + (i + 1)"
                [class.border-primary-light]="selectedImage === img || (!selectedImage && i === 0)"
                [class.border-gray-300]="selectedImage !== img && (selectedImage || i !== 0)"
                class="flex-shrink-0 w-20 h-20 rounded-medium border-2 overflow-hidden hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-light">
          <img [src]="getImageUrl(img)" 
               [alt]="'Miniatura ' + (i + 1)"
               (error)="onThumbnailError($event)"
               class="w-full h-full object-cover">
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class ImageGalleryComponent implements OnInit {
  @Input() images: string[] = [];
  @Input() mainImage?: string;
  @Output() imageSelected = new EventEmitter<string>();

  selectedImage: string | null = null;
  showZoom = false;

  ngOnInit(): void {
    if (this.mainImage) {
      this.selectedImage = this.mainImage;
    }
  }

  selectImage(image: string): void {
    this.selectedImage = image;
    this.showZoom = false;
    this.imageSelected.emit(image);
  }

  nextImage(): void {
    const currentIndex = this.getCurrentIndex();
    if (currentIndex < this.images.length - 1) {
      this.selectImage(this.images[currentIndex + 1]);
    } else {
      this.selectImage(this.images[0]);
    }
  }

  previousImage(): void {
    const currentIndex = this.getCurrentIndex();
    if (currentIndex > 0) {
      this.selectImage(this.images[currentIndex - 1]);
    } else {
      this.selectImage(this.images[this.images.length - 1]);
    }
  }

  getCurrentIndex(): number {
    const imageToFind = this.selectedImage || this.images[0];
    return this.images.findIndex(img => img === imageToFind);
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    if (imageUrl.startsWith('/api/files/')) {
      const apiBaseUrl = environment.apiUrl || 'http://localhost:8080';
      return `${apiBaseUrl}${imageUrl}`;
    }
    const parts = imageUrl.split('/');
    if (parts.length >= 2) {
      const type = parts[0];
      const filename = parts[parts.length - 1];
      const apiBaseUrl = environment.apiUrl || 'http://localhost:8080';
      return `${apiBaseUrl}/api/files/${type}/${filename}`;
    }
    const apiBaseUrl = environment.apiUrl || 'http://localhost:8080';
    return `${apiBaseUrl}/api/files/products/${imageUrl}`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }

  onThumbnailError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="24"%3E?%3C/text%3E%3C/svg%3E';
    }
  }
}


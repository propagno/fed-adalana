import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface UploadResponse {
  url: string;
  filename: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private baseUrl = environment.apiUrl || 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  uploadImage(file: File, type: 'product' | 'account'): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.http.post<UploadResponse>(`${this.baseUrl}/api/upload/image`, formData);
  }

  compressImage(file: File, maxWidth: number = 1920, maxHeight: number = 1920, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not create blob'));
                return;
              }
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            },
            file.type,
            quality
          );
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Constrói URL completa para um arquivo servido pelo backend
   * @param type Tipo do arquivo (account, product, etc.)
   * @param filename Nome do arquivo
   * @returns URL completa do arquivo
   */
  getFileUrl(type: string, filename: string): string {
    if (!filename) {
      return '';
    }
    
    // Se já é uma URL completa, retorna como está
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    
    // Se já começa com /api/files/, retorna com baseUrl
    if (filename.startsWith('/api/files/')) {
      return `${this.baseUrl}${filename}`;
    }
    
    // Constrói URL completa
    return `${this.baseUrl}/api/files/${type}/${filename}`;
  }
}


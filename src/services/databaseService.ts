import { GeneratedImage } from '../types';

const DB_NAME = 'hyprFluxDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';
const METADATA_KEY = 'generatedImages';

export class DatabaseService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };
      });

      console.log('IndexedDB initialized successfully');
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      throw error;
    }
  }

  async saveImage(image: GeneratedImage): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Save image data to IndexedDB
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ 
          id: image.timestamp,
          imageData: image.imageData 
        });

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });

      // Save metadata to localStorage
      const savedMetadata = localStorage.getItem(METADATA_KEY);
      const metadata = savedMetadata ? JSON.parse(savedMetadata) : [];
      const { imageData, ...metaWithoutImage } = image;
      metadata.unshift(metaWithoutImage);
      localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));

      console.log('Image saved successfully:', image.timestamp);
    } catch (error) {
      console.error('Failed to save image:', error);
      throw error;
    }
  }

  async loadImages(): Promise<GeneratedImage[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const savedMetadata = localStorage.getItem(METADATA_KEY);
      if (!savedMetadata) {
        console.log('No saved metadata found');
        return [];
      }

      const metadata = JSON.parse(savedMetadata);
      console.log('Loading images for metadata entries:', metadata.length);

      const loadedImages = await Promise.all(
        metadata.map(async (meta: Omit<GeneratedImage, 'imageData'>) => {
          try {
            const imageData = await this.getImageData(meta.timestamp);
            if (imageData) {
              return { ...meta, imageData };
            }
            console.warn('No image data found for:', meta.timestamp);
            return null;
          } catch (error) {
            console.error('Error loading image:', meta.timestamp, error);
            return null;
          }
        })
      );

      const validImages = loadedImages.filter((img): img is GeneratedImage => img !== null);
      console.log('Successfully loaded images:', validImages.length);
      return validImages;
    } catch (error) {
      console.error('Failed to load images:', error);
      throw error;
    }
  }

  private async getImageData(id: string): Promise<string | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result?.imageData || null);
      };
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });

      localStorage.removeItem(METADATA_KEY);
      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw error;
    }
  }
}
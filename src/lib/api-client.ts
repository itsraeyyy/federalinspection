/**
 * Simulated API Client for Next.js App Router
 * When NestJS is ready, replace `fetch` calls or configure base URL here.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const apiClient = {
  async get<T>(url: string, init?: RequestInit): Promise<T> {
    // Simulated mock network delay
    await new Promise(res => setTimeout(res, 500));
    console.log(`[GET] ${BASE_URL}${url}`);
    return {} as T; // Mock return
  },

  async post<T>(url: string, body: any, init?: RequestInit): Promise<T> {
    await new Promise(res => setTimeout(res, 500));
    console.log(`[POST] ${BASE_URL}${url}`, body);
    return body as T; // Mock return
  },

  async put<T>(url: string, body: any, init?: RequestInit): Promise<T> {
    await new Promise(res => setTimeout(res, 500));
    console.log(`[PUT] ${BASE_URL}${url}`, body);
    return body as T; // Mock return
  },

  async delete<T>(url: string, init?: RequestInit): Promise<T> {
    await new Promise(res => setTimeout(res, 500));
    console.log(`[DELETE] ${BASE_URL}${url}`);
    return {} as T; // Mock return
  }
};

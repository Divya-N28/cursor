import axios, { AxiosResponse } from 'axios';
import { IGetProductsResponse, IProduct } from 'models';

const isProduction = process.env.NODE_ENV === 'production';

// Helper for delay between retries
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getProducts = async (options = { retries: 2, retryDelay: 1000 }) => {
  let response: AxiosResponse<IGetProductsResponse> | { data: { products: IProduct[] } } | undefined;
  let error: string | null = null;
  let products: IProduct[] = [];
  let attempt = 0;
  let loading = true;

  while (attempt <= options.retries) {
    try {
      if (isProduction) {
        response = await axios.get<IGetProductsResponse>(
          'https://react-shopping-cart-67954.firebaseio.com/products.json',
          { timeout: 10000 }
        );
        if ('status' in response && (response.status < 200 || response.status >= 300)) {
          throw new Error(`Server responded with status ${response.status}`);
        }
      } else {
        response = require('static/json/products.json');
      }
      // Safely access products for both Axios and require cases
      if (response && response.data && 'products' in response.data) {
        products = (response.data as { products: IProduct[] }).products || [];
      } else if (response && response.data && 'products' in (response.data as any)) {
        products = (response.data as any).products || [];
      } else {
        products = [];
      }
      error = null;
      break; // Success, exit retry loop
    } catch (err: any) {
      attempt++;
      if (attempt > options.retries) {
        if (err.response) {
          error = `Failed to fetch products: Server error (${err.response.status})`;
        } else if (err.request) {
          error = 'Network error: Unable to reach the server.';
        } else {
          error = `Unexpected error: ${err.message || 'Unknown error'}`;
        }
        products = [];
      } else {
        await delay(options.retryDelay);
      }
    }
  }
  loading = false;
  return { products, error, loading };
};

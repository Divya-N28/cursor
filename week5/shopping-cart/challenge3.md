# Challenge 3: Robust API Error Handling and Loading State Management

## Overview
This challenge focused on making the product fetching logic production-ready by adding robust error handling, retry mechanisms, and user-friendly error and loading state management.

---

## Issues Addressed
- No error handling for network/API failures
- No HTTP status code validation
- No retry mechanism for transient errors
- No user-friendly error messages
- Loading and error states not surfaced to the UI

---

## Before

### `getProducts` (src/services/products.ts)
```typescript
export const getProducts = async () => {
  let response: IGetProductsResponse;

  if (isProduction) {
    response = await axios.get(
      'https://react-shopping-cart-67954.firebaseio.com/products.json'
    );
  } else {
    response = require('static/json/products.json');
  }

  const { products } = response.data || [];

  return products;
};
```

### `fetchProducts` (src/contexts/products-context/useProducts.tsx)
```typescript
const fetchProducts = useCallback(() => {
  setIsFetching(true);
  getProducts().then((products: IProduct[]) => {
    setIsFetching(false);
    setProducts(products);
  });
}, [setIsFetching, setProducts]);
```

### `filterProducts` (src/contexts/products-context/useProducts.tsx)
```typescript
const filterProducts = useCallback((filters: string[]) => {
  setIsFetching(true);
  getProducts().then((products: IProduct[]) => {
    setIsFetching(false);
    let filteredProducts;
    if (filters && filters.length > 0) {
      const filterSet = new Set(filters);
      filteredProducts = products.filter((p: IProduct) =>
        p.availableSizes.some((size: string) => filterSet.has(size))
      );
    } else {
      filteredProducts = products;
    }
    setFilters(filters);
    setProducts(filteredProducts);
  });
}, [setFilters, setProducts, setIsFetching]);
```

---

## After

### `getProducts` (src/services/products.ts)
```typescript
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
      if (response && response.data && 'products' in response.data) {
        products = (response.data as { products: IProduct[] }).products || [];
      } else if (response && response.data && 'products' in (response.data as any)) {
        products = (response.data as any).products || [];
      } else {
        products = [];
      }
      error = null;
      break;
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
```

### `fetchProducts` (src/contexts/products-context/useProducts.tsx)
```typescript
const [fetchError, setFetchError] = useState<string | null>(null);

const fetchProducts = useCallback(() => {
  setIsFetching(true);
  setFetchError(null);
  getProducts().then(({ products, error }) => {
    setIsFetching(false);
    if (error) {
      setFetchError(error);
      setProducts([]);
    } else {
      setProducts(products);
    }
  });
}, [setIsFetching, setProducts, setFetchError]);
```

### `filterProducts` (src/contexts/products-context/useProducts.tsx)
```typescript
const filterProducts = useCallback((filters: string[]) => {
  setIsFetching(true);
  setFetchError(null);
  getProducts().then(({ products, error }) => {
    setIsFetching(false);
    if (error) {
      setFetchError(error);
      setProducts([]);
    } else {
      let filteredProducts;
      if (filters && filters.length > 0) {
        const filterSet = new Set(filters);
        filteredProducts = products.filter((p: IProduct) =>
          p.availableSizes.some((size: string) => filterSet.has(size))
        );
      } else {
        filteredProducts = products;
      }
      setFilters(filters);
      setProducts(filteredProducts);
    }
  });
}, [setFilters, setProducts, setIsFetching, setFetchError]);
```

---

## Improvements & Explanations
- **Comprehensive try-catch blocks**: All async API calls are wrapped in try-catch for robust error handling.
- **Network error handling**: Detects and reports network issues and server errors.
- **HTTP status code validation**: Ensures only successful (2xx) responses are accepted.
- **User-friendly error messages**: Clear, actionable error messages are set and exposed to the UI.
- **Retry mechanism**: Automatically retries failed requests (configurable attempts and delay).
- **Loading state management**: Loading and error states are managed and exposed for UI feedback.
- **Production-ready patterns**: All error and loading states are surfaced for use in UI components.

---

## Usage Example
You can now use the `fetchError` and `isFetching` states in your UI to show loaders and error messages to users.

```tsx
{isFetching && <Loader />}
{fetchError && <div className="error">{fetchError}</div>}
``` 
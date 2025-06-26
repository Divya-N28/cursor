import { useState, useCallback } from 'react';

import { useProductsContext } from './ProductsContextProvider';
import { IProduct } from 'models';
import { getProducts } from 'services/products';

const useProducts = () => {
  const {
    isFetching,
    setIsFetching,
    products,
    setProducts,
    filters,
    setFilters,
  } = useProductsContext();

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

  return {
    isFetching,
    fetchProducts,
    products,
    filterProducts,
    filters,
    fetchError,
  };
};

export default useProducts;

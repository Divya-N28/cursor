# Challenge 1: Improving addProduct Function in Cart Context

## Issues Identified

1. **State Mutation**: The original `updateQuantitySafely` could mutate the product object directly, violating React's immutability principle.
2. **Performance**: The `addProduct` function was recreated on every render, which could cause unnecessary re-renders in child components if passed as a prop.
3. **Immutable Update Patterns**: The update logic should always return new objects/arrays, never mutate existing ones.

---

## Before

```typescript
const addProduct = (newProduct: ICartProduct) => {
  let updatedProducts;
  const isProductAlreadyInCart = products.some(
    (product: ICartProduct) => newProduct.id === product.id
  );

  if (isProductAlreadyInCart) {
    updatedProducts = products.map((product: ICartProduct) => {
      return updateQuantitySafely(product, newProduct, newProduct.quantity);
    });
  } else {
    updatedProducts = [...products, newProduct];
  }

  setProducts(updatedProducts);
  updateCartTotal(updatedProducts);
};
```

---

## After

```typescript
import { useCallback } from 'react';

const updateQuantitySafely = (
  product: ICartProduct,
  newProduct: ICartProduct,
  quantity: number
): ICartProduct => {
  if (product.id === newProduct.id) {
    // Return a new object, do not mutate the original
    return { ...product, quantity: product.quantity + quantity };
  }
  return product;
};

const addProduct = useCallback(
  (newProduct: ICartProduct) => {
    let updatedProducts;
    const isProductAlreadyInCart = products.some(
      (product: ICartProduct) => newProduct.id === product.id
    );

    if (isProductAlreadyInCart) {
      updatedProducts = products.map((product: ICartProduct) =>
        updateQuantitySafely(product, newProduct, newProduct.quantity)
      );
    } else {
      updatedProducts = [...products, newProduct];
    }

    setProducts(updatedProducts);
    updateCartTotal(updatedProducts);
  },
  [products, setProducts, updateCartTotal]
);
```

---

## Explanations

- **Immutability**: `updateQuantitySafely` now returns a new object using the spread operator, ensuring the original product is not mutated.
- **Performance**: `addProduct` is wrapped in `useCallback`, so it is only recreated when its dependencies change, reducing unnecessary re-renders.
- **Immutable Update Pattern**: Both the `.map()` and the array spread (`[...products, newProduct]`) create new arrays, not mutating the original state.
- **No Prop Mutation**: The function does not mutate any props.

**Summary:**
- Avoid mutating state or objects in state directly.
- Use `useCallback` for functions passed as props.
- Always use immutable update patterns (spread, map, filter, etc.).
- Never mutate props. 
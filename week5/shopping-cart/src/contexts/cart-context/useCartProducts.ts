import { useCartContext } from './CartContextProvider';
import useCartTotal from './useCartTotal';
import { ICartProduct } from 'models';
import { useCallback } from 'react';

const useCartProducts = () => {
  const { products, setProducts } = useCartContext();
  const { updateCartTotal } = useCartTotal();

  const updateQuantitySafely = (
    product: ICartProduct,
    newProduct: ICartProduct,
    quantity: number
  ): ICartProduct => {
    if (product.id === newProduct.id) {
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

  const removeProduct = (productToRemove: ICartProduct) => {
    const updatedProducts = products.filter(
      (product: ICartProduct) => product.id !== productToRemove.id
    );

    setProducts(updatedProducts);
    updateCartTotal(updatedProducts);
  };

  const increaseProductQuantity = (productToIncrease: ICartProduct) => {
    const updatedProducts = products.map((product: ICartProduct) => {
      return updateQuantitySafely(product, productToIncrease, +1);
    });

    setProducts(updatedProducts);
    updateCartTotal(updatedProducts);
  };

  const decreaseProductQuantity = (productToDecrease: ICartProduct) => {
    const updatedProducts = products.map((product: ICartProduct) => {
      return updateQuantitySafely(product, productToDecrease, -1);
    });

    setProducts(updatedProducts);
    updateCartTotal(updatedProducts);
  };

  return {
    products,
    addProduct,
    removeProduct,
    increaseProductQuantity,
    decreaseProductQuantity,
  };
};

export default useCartProducts;

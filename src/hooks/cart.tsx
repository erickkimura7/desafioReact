import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { textSpanContainsPosition } from 'typescript';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const ProductStorageName = '@GoMarketplace:products';

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {

      const products = await AsyncStorage.getItem(ProductStorageName);

      if (!!products) {
        setProducts([...JSON.parse(products)]);
      }

    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async (product: Product) => {
    const existingProduct = products.find(each => each.id === product.id);

    let novaLista = [] as Product[];

    if (existingProduct) {
      novaLista = products.map(each => each.id === product.id ? { ...product, quantity: each.quantity + 1 } : each);
      setProducts(novaLista);
    } else {
      novaLista = [...products, { ...product, quantity: 1 }];
      setProducts(novaLista);
    }

    await AsyncStorage.setItem(ProductStorageName, JSON.stringify(novaLista));

  }, [products]);

  const increment = useCallback(async id => {
    const existingProduct = products.find(each => each.id === id);

    if (existingProduct) {

      const novaLista = products.map(each => each.id === id ? { ...each, quantity: each.quantity + 1 } : each);

      setProducts(novaLista);

      await AsyncStorage.setItem(ProductStorageName, JSON.stringify(novaLista));
    }

  }, [products]);

  const decrement = useCallback(async id => {
    const existingProduct = products.find(each => each.id === id);

    if (existingProduct) {

      const novaLista = products.filter(each => (each.id === id && each.quantity - 1 > 0) || each.id !== id)
        .map(each => each.id === id ? { ...each, quantity: each.quantity - 1 } : each);

      setProducts(novaLista);

      await AsyncStorage.setItem(ProductStorageName, JSON.stringify(novaLista));
    }
  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };

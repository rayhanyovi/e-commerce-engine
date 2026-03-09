"use client";

import { startTransition, useEffect, useState } from "react";

import {
  addItemToCart,
  clearCart as clearCartRequest,
  fetchCart,
  removeCartItemById,
  updateCartItemQty,
} from "@/lib/cart/client";
import type { AddCartItemDto, CartSnapshot, UpdateCartItemDto } from "@/shared/contracts";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Cart request failed";
}

export function useCart(initialCart: CartSnapshot | null = null) {
  const [cart, setCart] = useState<CartSnapshot | null>(initialCart);
  const [isLoading, setIsLoading] = useState(initialCart === null);
  const [error, setError] = useState<string | null>(null);

  async function refreshCart() {
    setIsLoading(true);
    setError(null);

    try {
      const nextCart = await fetchCart();
      startTransition(() => {
        setCart(nextCart);
      });

      return nextCart;
    } catch (error) {
      const message = getErrorMessage(error);

      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function applyMutation(work: () => Promise<CartSnapshot>) {
    setError(null);

    try {
      const nextCart = await work();

      startTransition(() => {
        setCart(nextCart);
      });

      return nextCart;
    } catch (error) {
      const message = getErrorMessage(error);

      setError(message);
      throw error;
    }
  }

  useEffect(() => {
    if (initialCart !== null) {
      return;
    }

    let active = true;

    setIsLoading(true);
    setError(null);

    void fetchCart()
      .then((nextCart) => {
        if (!active) {
          return;
        }

        startTransition(() => {
          setCart(nextCart);
        });
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setError(getErrorMessage(error));
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [initialCart]);

  const items = cart?.items ?? [];

  return {
    cart,
    items,
    itemCount: cart?.summary.itemCount ?? 0,
    subtotal: cart?.summary.subtotal ?? 0,
    isLoading,
    error,
    refreshCart,
    addItem: (dto: AddCartItemDto) => applyMutation(() => addItemToCart(dto)),
    updateQty: (input: { itemId: string } & UpdateCartItemDto) =>
      applyMutation(() => updateCartItemQty(input.itemId, { qty: input.qty })),
    removeItem: (itemId: string) => applyMutation(() => removeCartItemById(itemId)),
    clearCart: () => applyMutation(() => clearCartRequest()),
  };
}

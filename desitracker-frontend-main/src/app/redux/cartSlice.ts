import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartProduct {
    _id: string;
    name: string;
    price: number;
    thumbnail: string;
    quantity: number;
    businessId: string;
}

interface CartState {
    items: CartProduct[];
    businessId: string | null;
}

// Utility function to load cart from localStorage only if it's on the client
const loadCartFromLocalStorage = (): CartState => {
    if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                // Ensure that `items` is an array and `businessId` is valid
                return {
                    items: Array.isArray(parsedCart.items) ? parsedCart.items : [],
                    businessId: parsedCart.businessId || null,
                };
            } catch (error) {
                console.error("Error parsing cart from localStorage:", error);
                return { items: [], businessId: null };
            }
        }
    }
    return { items: [], businessId: null };
};

// Save the cart to localStorage (only on the client)
const saveCartToLocalStorage = (cart: CartState): void => {
    if (typeof window !== 'undefined') {
        try {
            console.log("Saving cart to localStorage:", cart); // Debugging line
            localStorage.setItem('cart', JSON.stringify(cart));
        } catch (error) {
            console.error("Error saving cart to localStorage:", error);
        }
    }
};

const cartSlice = createSlice({
    name: 'cart',
    initialState: loadCartFromLocalStorage(),  // Use localStorage if available
    reducers: {
        setBusinessId: (state, action: PayloadAction<string>) => {
            state.businessId = action.payload;
        },

        addProductToCart: (state, action: PayloadAction<CartProduct>) => {
            const product = action.payload;
            console.log("Adding product to cart:", product); // Debugging line

            // Ensure we're adding products for the correct business

            const existingProduct = state.items.find((item) => item._id === product._id);
            if (existingProduct) {
                existingProduct.quantity += product.quantity;
            } else {
                state.items.push(product);
            }

            console.log("Updated Redux state before saving:", state); // Debugging line
            saveCartToLocalStorage(state); // Save to localStorage
        },

        removeProductFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((item) => item._id !== action.payload);
            saveCartToLocalStorage(state);
        },

        updateProductQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
            const product = state.items.find((item) => item._id === action.payload.productId);
            if (product) {
                product.quantity = action.payload.quantity;
            }
            saveCartToLocalStorage(state);
        },

        clearCart: (state) => {
            state.items = [];
            saveCartToLocalStorage(state);
        },
    },
});

export const {
    addProductToCart,
    removeProductFromCart,
    updateProductQuantity,
    clearCart,
    setBusinessId,
} = cartSlice.actions;

export default cartSlice.reducer;

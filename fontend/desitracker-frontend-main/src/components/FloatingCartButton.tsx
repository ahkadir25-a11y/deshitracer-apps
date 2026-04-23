/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/store"; // Import the root state type
import { clearCart, removeProductFromCart, updateProductQuantity, setBusinessId } from "@/app/redux/cartSlice";
import { motion } from "framer-motion"; // Import framer-motion
import { FaTrashAlt } from "react-icons/fa"; // Import React Icons
import { IoCloseOutline } from "react-icons/io5";
import { TiShoppingCart } from "react-icons/ti";

interface FloatingCartButtonProps {
    whatsappPhoneNumber: string; // Pass phone number for WhatsApp checkout
    businessId: string; // Current businessId
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ whatsappPhoneNumber, businessId }) => {
    const [showModal, setShowModal] = useState(false);
    const { items, businessId: cartBusinessId } = useSelector((state: RootState) => state.cart);
    const dispatch = useDispatch();

    // Function to handle modal close
    const handleCloseModal = () => setShowModal(false);

    // Clear the cart when the businessId changes or on unmount
    useEffect(() => {
        if (cartBusinessId && cartBusinessId !== businessId) {
            dispatch(clearCart());
        }
        dispatch(setBusinessId(businessId));
    }, [businessId, cartBusinessId, dispatch]);

    // Function to generate the WhatsApp message with cart details
    const generateWhatsAppMessage = () => {
        let message = "Order Details:\n\n";
        items.forEach((item) => {
            message += `${item.name} - ${item.quantity} x $${item.price}\n`;
        });
        message += `\nTotal: $${items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        )}`;
        return message;
    };

    // WhatsApp link to send the order details
    const whatsappLink = `https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent(generateWhatsAppMessage())}`;

    // Handle removing product from cart
    const handleDeleteProduct = (productId: string) => {
        dispatch(removeProductFromCart(productId));
    };

    // Handle changing the quantity of products in the cart
    const handleChangeQuantity = (productId: string, quantity: number) => {
        if (quantity > 0) {
            dispatch(updateProductQuantity({ productId, quantity }));
        }
    };

    // Calculate the total quantity of items in the cart
    const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);

    return (
        <>
            {/* Floating Cart Button */}
            <motion.button
                onClick={() => setShowModal(true)}
                className="fixed bottom-20 right-6 z-50 bg-[#222] hover:bg-blue-700 p-3.5 rounded-full shadow-lg text-white focus:outline-none"
            >
                <TiShoppingCart size={20}/>
                {/* Display the cart counter if there are items */}
                {totalQuantity > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-2">
                        {totalQuantity}
                    </span>
                )}
            </motion.button>

            {/* Modal with framer-motion animation */}
            {showModal && (
                <motion.div
                    className="fixed inset-0 bg-black/30 z-50 flex justify-center items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="bg-white p-4 rounded-lg w-96 max-h-[80vh] overflow-auto">
                        <div className="flex items-start justify-between">
                            <h3 className="text-2xl font-semibold mb-4">Your Cart</h3>
                            <button
                                onClick={handleCloseModal}
                                className=" text-gray-500 hover:text-gray-700" >
                                <IoCloseOutline size={30} />
                            </button>
                        </div>

                        {items?.length === 0 ? (
                            <p className="text-center py-10 text-gray-500">Your cart is empty.</p>
                        ) : (
                            <div>
                                {items?.map((item) => (
                                    <div key={item._id} className="flex justify-between items-center mb-4">
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{item.name}</h4>
                                            <p>{item.price} x {item.quantity}</p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <motion.button
                                                className="text-red-500"
                                                onClick={() => handleDeleteProduct(item._id)}
                                            >
                                                <FaTrashAlt size={20} />
                                            </motion.button>

                                            {/* Quantity Input */}
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    handleChangeQuantity(item._id, parseInt(e.target.value))
                                                }
                                                min="1"
                                                className="w-16 p-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center gap-2 justify-between">
                                <button
                                    onClick={() => dispatch(clearCart())}
                                    className="bg-gray-500 text-white px-6 py-2 rounded "
                                >
                                    Clear Cart
                                </button>

                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-500 text-white py-2 px-6 rounded text-center hover:bg-green-600"
                            >
                                Checkout - WhatsApp
                            </a>
                        </div>

                    </div>
                </motion.div>
            )}
        </>
    );
};

export default FloatingCartButton;

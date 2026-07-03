/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

import { useDeleteProductMutation } from "@/app/redux/services/products.services";
import { addProductToCart } from "@/app/redux/cartSlice";

type ImageObj = { url: string; };

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    thumbnail?: string;
    images?: ImageObj[];
    currency: string;                // "USD", "BDT", etc.
    discount_percent?: number;       // 0–100
    discount_start?: string | null;  // ISO
    discount_end?: string | null;    // ISO
    final_price?: number;            // server virtual
    product_category_id?: any;       // id or populated { _id, name }
    business_id?: string;
  };
  isAdmin: boolean;
  businessId?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isAdmin, businessId }) => {
  const Router = useRouter();
  const dispatch = useDispatch();
  const [deleteProduct] = useDeleteProductMutation();

  const {
    _id,
    name,
    price,
    thumbnail,
    images = [],
    currency,
    discount_percent = 0,
    discount_start,
    discount_end,
    final_price,
    product_category_id,
  } = product;

  // Determine if discount is active at this moment
  const now = new Date();
  const start = discount_start ? new Date(discount_start) : null;
  const end = discount_end ? new Date(discount_end) : null;
  const discountActive =
    Number(discount_percent) > 0 &&
    (!start || now >= start) &&
    (!end || now <= end);

  // Use server's final_price when present; otherwise compute only if active
  const computedFinal = discountActive
    ? Math.round(price * (1 - (discount_percent || 0) / 100) * 100) / 100
    : price;

  const effectiveFinal =
    typeof final_price === "number" ? final_price : computedFinal;

  const primaryImage = thumbnail || images?.[0]?.url || "";

  const categoryName =
    typeof product_category_id === "object" && product_category_id?.name
      ? product_category_id.name
      : undefined;

  const formatPrice = (amount: number, code: string) => {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: code }).format(amount);
    } catch {
      return `${code} ${amount.toFixed(2)}`;
    }
  };

  const handleDelete = async (productId: string) => {
    const ok = window.confirm("Delete this product? This action cannot be undone.");
    if (!ok) return;
    try {
      await deleteProduct(productId).unwrap();
      toast.success("Product deleted successfully!");
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product.");
    }
  };

  const handleAddToCart = () => {
    const priceForCart = Number.isFinite(effectiveFinal) ? effectiveFinal : price;
    dispatch(
      addProductToCart({
        _id,
        name,
        price: priceForCart,
        thumbnail: primaryImage,
        quantity: 1,
        businessId: businessId ?? (product.business_id || ""),
      })
    );
    toast.success("Product added to cart!");
  };

  // ----- UI pieces -----
  const Title = (
    <h3 className="text-[15px] font-semibold text-slate-900 leading-5 line-clamp-1">
      {name}
    </h3>
  );


  const PriceBlock = (
    <div className="space-y-0.5">
      <div className="flex items-baseline gap-2">
        <span className="text-[18px] font-semibold text-slate-900">
          {formatPrice(effectiveFinal, currency)}
        </span>
        {discountActive && (
          <span className="text-[12px] text-slate-500 line-through">
            {formatPrice(price, currency)}
          </span>
        )}
      </div>
    </div>
  );

  const DiscountBadge = discountActive ? (
    <span className="absolute left-2 top-2 z-10 rounded-md bg-rose-600 text-white text-[11px] font-semibold px-2 py-0.5 shadow">
      {Math.round(discount_percent)}% OFF
    </span>
  ) : null;

  const AdminActions = isAdmin ? (
    <div className="absolute right-2 top-2 z-10 flex gap-2">
      <button
        aria-label="Edit product"
        onClick={(e) => {
          e.preventDefault();
          Router.push(`/profile/my-products/edit/${_id}`);
        }}
        className="p-2 rounded-md bg-white/95 hover:bg-white border border-slate-200 shadow-sm"
        title="Edit"
      >
        <FaEdit className="text-slate-800" size={16} />
      </button>
      <button
        aria-label="Delete product"
        onClick={(e) => {
          e.preventDefault();
          handleDelete(_id);
        }}
        className="p-2 rounded-md bg-white/95 hover:bg-white border border-rose-200 shadow-sm"
        title="Delete"
      >
        <FaTrashAlt className="text-rose-600" size={16} />
      </button>
    </div>
  ) : null;

  // ----- Card -----
  const CardInner = (
    <div className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden transition-shadow shadow-sm hover:shadow-md">
      {/* MEDIA: fixed aspect ratio + solid placeholder */}
      <div className="relative aspect-[4/3] w-full bg-slate-100">
        {DiscountBadge}
        {AdminActions}
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
              <span className="text-slate-400 text-xs">No Image</span>
            </div>
          </div>
        )}
      </div>

      {/* CONTENT: consistent spacing & clamped text */}
      <div className="p-4">
        <div className="flex items-center justify-center flex-col gap-3 mb-2">
          <div className="min-w-0 space-y-1">
            {Title}
          </div>
          {categoryName && (
            <span className="shrink-0 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-1">
              {categoryName}
            </span>
          )}
        </div>

        {/* Price + CTA row kept stable */}
        <div className="mt-3 flex flex-col items-center justify-center gap-3">
          {PriceBlock}

          {!isAdmin && (
            <button
              onClick={(e) => {
                e.preventDefault();
                handleAddToCart();
              }}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 text-white text-sm font-medium px-4 py-2 h-9 hover:bg-emerald-700 transition-colors"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // For shoppers the whole card is clickable; admins use overlay buttons.
  return isAdmin ? (
    CardInner
  ) : (
    <Link href={`/product/${_id}`} className="block">
      {CardInner}
    </Link>
  );
};

export default ProductCard;

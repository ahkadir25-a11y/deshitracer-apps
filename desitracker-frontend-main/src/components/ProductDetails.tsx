"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useGetProductByIdQuery, IProduct } from "@/app/redux/services/products.services";

const PLACEHOLDER_IMG = "https://via.placeholder.com/800x600?text=No+Image";

// Extend IProduct to include populated relational fields from the backend
type PopulatedProduct = Omit<IProduct, 'user_id' | 'business_id' | 'product_category_id' | 'images'> & {
  product_category_id?: { name?: string } | string;
  user_id?: { name?: string; phone?: string };
  business_id?: {
    businessName?: string;
    locations?: { address?: string; city?: string; country?: string };
    contactDetails?: { phoneNumber?: string; email?: string };
  };
  images?: { url: string; description?: string }[];
};

// --- Sub-components ---

const ProductSkeleton = () => (
  <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="aspect-[4/3] w-full bg-gray-200 rounded-xl" />
    <div>
      <div className="h-10 w-3/4 bg-gray-200 rounded mb-4" />
      <div className="h-4 w-full bg-gray-200 rounded mb-2" />
      <div className="h-4 w-5/6 bg-gray-200 rounded mb-8" />
      <div className="h-16 w-1/2 bg-gray-200 rounded-xl mb-6" />
      <div className="h-12 w-48 bg-gray-200 rounded-xl" />
    </div>
  </div>
);

const ProductGallery = ({
  thumbnail,
  images,
  name,
  discountPercent,
  showDiscountUI,
}: {
  thumbnail?: string;
  images?: { url: string; description?: string }[];
  name: string;
  discountPercent: number;
  showDiscountUI: boolean;
}) => {
  const [activeIdx, setActiveIdx] = useState(0);

  const gallery = useMemo(() => {
    const base: { url: string; description?: string }[] = [];
    if (thumbnail) base.push({ url: thumbnail, description: "Thumbnail" });
    for (const img of images || []) {
      if (img?.url && img.url !== thumbnail) base.push({ url: img.url, description: img.description });
    }
    return base.length ? base : [{ url: PLACEHOLDER_IMG }];
  }, [thumbnail, images]);

  const clampedIdx = Math.min(activeIdx, Math.max(0, gallery.length - 1));
  const active = gallery[clampedIdx];

  return (
    <div className="md:w-1/2">
      <div className="relative aspect-[4/3] w-full bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
        {showDiscountUI && (
          <span className="absolute left-4 top-4 z-10 bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm tracking-wide">
            {Math.round(discountPercent)}% OFF
          </span>
        )}
        <Image
          src={active?.url || PLACEHOLDER_IMG}
          alt={active?.description || name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {gallery.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {gallery.map((g, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`relative aspect-[4/3] rounded-lg overflow-hidden transition-all ${
                i === clampedIdx
                  ? "border-2 border-blue-600 shadow-sm"
                  : "border border-gray-200 hover:border-blue-400 opacity-70 hover:opacity-100"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image src={g.url} alt={g.description || `Image ${i + 1}`} fill sizes="100px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const SellerInfo = ({ user, business }: { user?: any; business?: any }) => {
  if (!user?.name && !business) return null;

  return (
    <div className="mt-8 text-gray-800 text-sm bg-gray-50 border border-gray-100 p-5 rounded-xl space-y-3">
      <h3 className="font-semibold text-gray-900 text-base border-b border-gray-200 pb-2 mb-3">Seller Details</h3>
      {user?.name && (
        <p className="flex justify-between">
          <span className="text-gray-500 font-medium">Seller</span>
          <span className="text-right font-medium">{user.name}</span>
        </p>
      )}
      {business && (
        <>
          {business.businessName && (
            <p className="flex justify-between">
              <span className="text-gray-500 font-medium">Business</span>
              <span className="text-right font-medium">{business.businessName}</span>
            </p>
          )}
          {(business.locations?.address || business.locations?.city || business.locations?.country) && (
            <div className="flex justify-between gap-4">
              <span className="text-gray-500 font-medium shrink-0">Location</span>
              <span className="text-right text-gray-700">
                {[business.locations?.address, business.locations?.city, business.locations?.country]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}
          {business.contactDetails?.phoneNumber && (
            <p className="flex justify-between">
              <span className="text-gray-500 font-medium">Phone</span>
              <span className="text-right text-gray-700">{business.contactDetails.phoneNumber}</span>
            </p>
          )}
          {business.contactDetails?.email && (
            <p className="flex justify-between">
              <span className="text-gray-500 font-medium">Email</span>
              <span className="text-right text-gray-700">{business.contactDetails.email}</span>
            </p>
          )}
        </>
      )}
    </div>
  );
};

// --- Main Component ---

const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const { data, isLoading } = useGetProductByIdQuery(id as string);
  const product = data as PopulatedProduct | undefined;

  // Derived state (defaults)
  const name = product?.name || "";
  const price = product?.price || 0;
  const currency = product?.currency || "USD";
  const discountPercent = product?.discount_percent || 0;
  const finalPrice = product?.final_price;

  // Discount logic
  const discountActive = useMemo(() => {
    if (!product || discountPercent <= 0) return false;
    const now = new Date();
    const start = product.discount_start ? new Date(product.discount_start) : null;
    const end = product.discount_end ? new Date(product.discount_end) : null;
    return (!start || now >= start) && (!end || now <= end);
  }, [product, discountPercent]);

  // Final price logic
  const effectiveFinal = useMemo(() => {
    if (typeof finalPrice === "number") return finalPrice;
    if (discountActive) {
      const computed = price * (1 - discountPercent / 100);
      return Math.round(computed * 100) / 100;
    }
    return price;
  }, [finalPrice, price, discountPercent, discountActive]);

  const savings = discountActive ? Math.max(0, +(price - effectiveFinal).toFixed(2)) : 0;

  // Format currency
  const formatPrice = (amount: number, code: string) => {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: code }).format(amount);
    } catch {
      return `${code} ${amount.toFixed(2)}`;
    }
  };

  // WhatsApp CTA Logic
  const phoneForWhatsApp = (product?.business_id?.contactDetails?.phoneNumber || product?.user_id?.phone || "")
    .toString()
    .replace(/\D/g, "");
  const waText = encodeURIComponent(`Hi, I'm interested in "${name}". Price: ${formatPrice(effectiveFinal, currency)}.`);
  const whatsappLink = phoneForWhatsApp ? `https://wa.me/${phoneForWhatsApp}?text=${waText}` : "";

  // Category Name
  const categoryName =
    typeof product?.product_category_id === "object" ? product.product_category_id?.name : undefined;

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:max-w-5xl">
        <ProductSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-6 text-center text-gray-500 py-32">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-2xl font-semibold text-gray-800">Product not found</p>
        <p className="mt-2 text-gray-500">The product you are looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:max-w-6xl">
      <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-5 sm:p-8 mb-10">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          <ProductGallery
            thumbnail={product.thumbnail}
            images={product.images}
            name={name}
            discountPercent={discountPercent}
            showDiscountUI={discountActive}
          />

          {/* Product Info Section */}
          <div className="md:w-1/2 flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">{name}</h1>
            </div>
            
            {categoryName && (
              <div className="mt-3">
                <span className="inline-flex rounded-full bg-blue-50 text-blue-700 border border-blue-100/50 text-xs font-semibold px-3 py-1">
                  {categoryName}
                </span>
              </div>
            )}

            {product.description && (
              <p className="text-gray-600 mt-5 leading-relaxed whitespace-pre-wrap">{product.description}</p>
            )}

            {/* Price Block */}
            <div className="mt-8 bg-gray-50 p-5 rounded-2xl border border-gray-100/80">
              <div className="flex items-end gap-3 flex-wrap">
                <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
                  {formatPrice(effectiveFinal, currency)}
                </span>
                {discountActive && (
                  <span className="text-xl text-gray-400 line-through mb-1 font-medium">
                    {formatPrice(price, currency)}
                  </span>
                )}
              </div>
              {discountActive && (
                <div className="mt-2.5 text-sm font-semibold text-rose-600 flex items-center gap-1.5 bg-rose-50 w-fit px-2.5 py-1 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  You save {formatPrice(savings, currency)} ({Math.round(discountPercent)}%)
                </div>
              )}
            </div>

            {/* Actions (Moved UP for better UX) */}
            <div className="mt-8">
              {whatsappLink ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#25D366] text-white font-semibold py-4 px-8 rounded-xl shadow-sm hover:bg-[#20b858] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                  </svg>
                  Buy on WhatsApp
                </a>
              ) : (
                <button
                  disabled
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-500 font-semibold py-4 px-8 rounded-xl cursor-not-allowed border border-gray-200"
                >
                  WhatsApp Unavailable
                </button>
              )}
            </div>

            <SellerInfo user={product.user_id} business={product.business_id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

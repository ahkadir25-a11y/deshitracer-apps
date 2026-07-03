/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useGetProductByIdQuery } from "@/app/redux/services/products.services";

const placeholder = "https://via.placeholder.com/800x600?text=No+Image";

const ProductDetails: React.FC = () => {
  const { id } = useParams(); // product ID
  const { data: product, isLoading } = useGetProductByIdQuery(id as string);

  // 🔒 Always declare hooks before any return/early-exit
  const [activeIdx, setActiveIdx] = useState(0);

  // Safe object to avoid conditional hook calls
  const p: any = product ?? {};

  // Destructure with defaults
  const {
    name = "",
    price = 0,
    description = "",
    images = [],
    thumbnail = "",
    user_id = {},
    business_id = {},
    currency = "USD",
    discount_percent = 0,
    discount_start,
    discount_end,
    final_price,
    product_category_id,
  } = p;

  // Discount window active?
  const now = new Date();
  const start = discount_start ? new Date(discount_start) : null;
  const end = discount_end ? new Date(discount_end) : null;
  const discountActive =
    Number(discount_percent) > 0 &&
    (!start || now >= start) &&
    (!end || now <= end);

  // Currency formatter
  const formatPrice = (amount: number, code: string) => {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: code }).format(amount);
    } catch {
      return `${code} ${amount.toFixed(2)}`;
    }
  };

  // Final price (prefer backend virtual; only compute if active)
  const effectiveFinal = useMemo(() => {
    if (typeof final_price === "number") return final_price;
    if (discountActive) {
      const computed = price * (1 - (discount_percent || 0) / 100);
      return Math.round(computed * 100) / 100;
    }
    return price;
  }, [final_price, price, discount_percent, discountActive]);

  const showDiscountUI = discountActive;
  const savings = showDiscountUI ? Math.max(0, +(price - effectiveFinal).toFixed(2)) : 0;

  const categoryName =
    typeof product_category_id === "object" && product_category_id?.name
      ? product_category_id.name
      : undefined;

  // Gallery (primary + thumbs)
  const gallery: { url: string; description?: string }[] = useMemo(() => {
    const base: { url: string; description?: string }[] = [];
    if (thumbnail) base.push({ url: thumbnail, description: "Thumbnail" });
    for (const img of images) {
      if (img?.url && img.url !== thumbnail) base.push({ url: img.url, description: img.description });
    }
    return base.length ? base : [{ url: placeholder }];
  }, [thumbnail, images]);

  const clampedIdx = Math.min(activeIdx, Math.max(0, gallery.length - 1));
  const active = gallery[clampedIdx];

  // WhatsApp CTA
  const businessPhone = business_id?.contactDetails?.phoneNumber;
  const userPhone = user_id?.phone;
  const phoneForWhatsApp = (businessPhone || userPhone || "").toString().replace(/\D/g, "");
  const waText = encodeURIComponent(
    `Hi, I'm interested in "${name}". Price: ${formatPrice(effectiveFinal, currency)}.`
  );
  const whatsappLink = phoneForWhatsApp ? `https://wa.me/${phoneForWhatsApp}?text=${waText}` : "";

  // ------ RENDER ------
  return (
    <div className="container mx-auto p-6">
      {isLoading ? (
        // Skeleton (no early return)
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-[4/3] w-full bg-gray-200 rounded-lg" />
          <div>
            <div className="h-8 w-2/3 bg-gray-200 rounded mb-4" />
            <div className="h-4 w-full bg-gray-200 rounded mb-2" />
            <div className="h-4 w-5/6 bg-gray-200 rounded mb-6" />
            <div className="h-10 w-48 bg-gray-200 rounded" />
          </div>
        </div>
      ) : !product ? (
        <div>Product not found</div>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg p-6 mb-10">
            {/* Top: Media + Info */}
            <div className="flex flex-col md:flex-row gap-8">
              {/* Media */}
              <div className="md:w-1/2">
                <div className="relative aspect-[4/3] w-full bg-gray-50 rounded-lg overflow-hidden">
                  {showDiscountUI && (
                    <span className="absolute left-3 top-3 z-10 bg-rose-600 text-white text-xs font-semibold px-2 py-1 rounded-md">
                      {Math.round(discount_percent)}% OFF
                    </span>
                  )}
                  <Image
                    src={active?.url || placeholder}
                    alt={active?.description || name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>

                {/* Thumbnails */}
                {gallery.length > 1 && (
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {gallery.map((g, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIdx(i)}
                        className={`relative aspect-[4/3] rounded-md overflow-hidden border ${
                          i === clampedIdx ? "border-blue-600" : "border-gray-200"
                        }`}
                        aria-label={`View image ${i + 1}`}
                      >
                        <Image
                          src={g.url}
                          alt={g.description || `Image ${i + 1}`}
                          fill
                          sizes="100px"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="md:w-1/2">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-3xl font-semibold text-gray-900">{name}</h1>
                  {categoryName && (
                    <span className="shrink-0 rounded-md bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1">
                      {categoryName}
                    </span>
                  )}
                </div>

                {description && <p className="text-gray-700 mt-3">{description}</p>}

                {/* Price block */}
                <div className="mt-5">
                  <div className="flex items-end gap-3">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(effectiveFinal, currency)}
                    </span>
                    {showDiscountUI && (
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(price, currency)}
                      </span>
                    )}
                  </div>
                  {showDiscountUI && (
                    <div className="mt-1 text-sm text-rose-600">
                      You save {formatPrice(savings, currency)} ({Math.round(discount_percent)}%)
                    </div>
                  )}
                  <div className="text-[11px] text-gray-500 mt-1 uppercase tracking-wide">
                    {currency}
                  </div>
                </div>

                {/* Seller / Business */}
                <div className="mt-6 text-gray-800 border-t border-gray-200 pt-4 space-y-1">
                  {user_id?.name && (
                    <p>
                      <strong>Seller:</strong> {user_id.name}
                    </p>
                  )}
                  {business_id && (
                    <>
                      {business_id.businessName && (
                        <p>
                          <strong>Business:</strong> {business_id.businessName}
                        </p>
                      )}
                      {(business_id.locations?.address ||
                        business_id.locations?.city ||
                        business_id.locations?.country) && (
                        <p>
                          <strong>Location:</strong>{" "}
                          {[business_id.locations?.address, business_id.locations?.city, business_id.locations?.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                      {business_id.contactDetails?.phoneNumber && (
                        <p>
                          <strong>Phone:</strong> {business_id.contactDetails.phoneNumber}
                        </p>
                      )}
                      {business_id.contactDetails?.email && (
                        <p>
                          <strong>Email:</strong> {business_id.contactDetails.email}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {whatsappLink ? (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center bg-green-600 text-white py-3 px-6 rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-300 border"
                    >
                      Buy on WhatsApp
                    </a>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center justify-center bg-gray-300 text-gray-600 py-3 px-6 rounded-lg cursor-not-allowed"
                      title="No WhatsApp number available"
                    >
                      WhatsApp Unavailable
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Gallery grid (with descriptions) */}
          {images?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Product Images</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {images.map((image: any, index: number) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow">
                      <Image
                        src={image.url || placeholder}
                        alt={image.description || `Gallery Image ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    {image.description && (
                      <p className="text-center mt-2 text-sm text-gray-600">{image.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductDetails;

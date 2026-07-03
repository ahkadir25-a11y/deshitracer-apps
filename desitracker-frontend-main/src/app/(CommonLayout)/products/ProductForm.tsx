/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { useAppSelector } from "@/app/redux/hoook";
import { useAddProductMutation } from "@/app/redux/services/products.services";
import { useGetAllBusinessQuery } from "@/app/redux/services/business.services";
import { useUploadImagesMutation } from "@/app/redux/services/upload-images.service";

import FilesUpload from "@/components/shears/file-upload/FilesUpload";
import SingleFileUpload from "@/components/shears/file-upload/SingleFileUpload";
import CurrencySelect from "@/components/common/CurrencySelect";
import ProductCategorySelect from "./ProductCategorySelect";
import ProductOptionSelector from "./ProductOptionSelector";


// Convert "YYYY-MM-DDTHH:mm" (local) -> ISO string
function fromLocalInputValue(v?: string): string | null {
  if (!v) return null;
  const dt = new Date(v);
  return isNaN(dt.getTime()) ? null : dt.toISOString();
}

type ImageObj = { url: string; description: string };

interface FormValues {
  name: string;
  price: number | string;
  description: string;
  discount_percent?: number | string;

  // NEW: UI fields for scheduling
  discount_schedule_enabled?: boolean;
  discount_start_local?: string; // "YYYY-MM-DDTHH:mm"
  discount_end_local?: string;   // "YYYY-MM-DDTHH:mm"

  thumbnail?: string;
  media: {
    images: ImageObj[];
  };
  product_options_ids?: string[];

}

const ProductForm: React.FC = () => {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth) as { user: { id: string } };
  const [addProduct] = useAddProductMutation();
  const [uploadImages] = useUploadImagesMutation();
  const { data: businessData } = useGetAllBusinessQuery({ owner: user?.id || "" });

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      discount_percent: 0,
      discount_schedule_enabled: false,
      discount_start_local: "",
      discount_end_local: "",
      media: { images: [] }, // ✅
      product_options_ids: [], // ✅ add
    },
  });

  // Local UI state
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [media, setMedia] = useState<{ images: ImageObj[] }>({ images: [] });
  const [currency, setCurrency] = useState<string>("USD");
  const [productCategory, setProductCategory] = useState<string | null>(null);

  const [thumbUploading, setThumbUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live computed final price
  const price = Number(watch("price") || 0);
  const discount = Math.min(100, Math.max(0, Number(watch("discount_percent") || 0)));
  const finalPrice = useMemo(() => {
    const p = Number.isFinite(price) ? price : 0;
    const d = Number.isFinite(discount) ? discount : 0;
    return +(p * (1 - d / 100)).toFixed(2);
  }, [price, discount]);

  // Live schedule preview
  const scheduleEnabled = watch("discount_schedule_enabled");
  const startLocal = watch("discount_start_local");
  const endLocal = watch("discount_end_local");
  const schedulePreview = useMemo(() => {
    if (!scheduleEnabled || !discount || discount <= 0) return { label: "No scheduled discount", ok: false };
    const now = new Date();
    const startISO = fromLocalInputValue(startLocal);
    const endISO = fromLocalInputValue(endLocal);
    const start = startISO ? new Date(startISO) : null;
    const end = endISO ? new Date(endISO) : null;

    const notStarted = start && now < start;
    const ended = end && now > end;
    const active =
      discount > 0 &&
      (!start || now >= start) &&
      (!end || now <= end);

    if (active) return { label: "Discount will be ACTIVE now", ok: true };
    if (notStarted) return { label: "Discount will start in the future", ok: false };
    if (ended) return { label: "Discount window has ended", ok: false };
    return { label: "Unlimited until you set a window", ok: false };
  }, [scheduleEnabled, discount, startLocal, endLocal]);

  // Upload handler
  const handleUpload = async (id: "thumbnail" | "images", files: File[]) => {
    const formData = new FormData();
    const maxSize = 15 * 1024 * 1024; // 15MB
    for (const file of files) {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} exceeds the maximum size of 15MB.`);
        return;
      }
      formData.append("file", file);
    }
    try {
      if (id === "thumbnail") setThumbUploading(true);
      if (id === "images") setImageUploading(true);

      const response = await uploadImages({ formData }).unwrap();
      if (!response?.data?.length) {
        toast.error("Upload failed, please try again.");
        return;
      }

      if (id === "thumbnail") {
        const url = response.data[0];
        setThumbnailUrl(url);
        setValue("thumbnail", url as any);
        setThumbUploading(false);
      }

      if (id === "images") {
        const uploaded: ImageObj[] = response.data.map((url: string) => ({
          url,
          description: "imageDescription",
        }));
        // When uploading gallery images
        setMedia((prev) => {
          const next = { images: [...prev.images, ...uploaded] };
          setValue("media.images", next.images); // ✅ no 'never'
          return next;
        });


        setImageUploading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while uploading files.");
      setThumbUploading(false);
      setImageUploading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const businessId = businessData?.data?.[0]?._id;
      if (!businessId) {
        toast.error("No business found. Please create a business first.");
        setIsSubmitting(false);
        return;
      }

      // Prepare discount window
      const usingWindow = !!data.discount_schedule_enabled;
      const startISO = usingWindow ? fromLocalInputValue(data.discount_start_local) : null;
      const endISO = usingWindow ? fromLocalInputValue(data.discount_end_local) : null;

      // Client-side validations
      const priceNum = Number(data.price);
      const discountNum = Number(data.discount_percent ?? 0);
      if (priceNum <= 0) {
        toast.error("Price must be greater than 0.");
        setIsSubmitting(false);
        return;
      }
      if (discountNum < 0 || discountNum > 100) {
        toast.error("Discount must be between 0 and 100.");
        setIsSubmitting(false);
        return;
      }
      if (usingWindow) {
        // allow open-ended windows (start only or end only)
        if (startISO && endISO) {
          if (new Date(endISO) < new Date(startISO)) {
            toast.error("Discount end time must be after the start time.");
            setIsSubmitting(false);
            return;
          }
        }
      }
      const imagesPayload =
        (data.media?.images ?? media.images ?? []).map((it) => ({
          url: it.url,
          description: it.description || "imageDescription",
        }));
      const payload = {
        name: data.name,
        price: priceNum,
        description: data.description,
        images: imagesPayload,         // ✅
        thumbnail: thumbnailUrl || "",
        user_id: user?.id,
        business_id: businessId,
        currency,
        product_category_id: productCategory ?? undefined,
        discount_percent: discountNum,

        // NEW: send ISO strings or nulls to backend
        discount_start: usingWindow ? startISO : null,
        discount_end: usingWindow ? endISO : null,
        product_options_ids: (data.product_options_ids ?? [])
          .map((x: any) => (typeof x === "string" ? x : x?._id))
          .filter(Boolean),
      };

      await addProduct(payload).unwrap();
      toast.success("Product added successfully!");
      reset();
      setThumbnailUrl(null);
      setMedia({ images: [] });
      setCurrency("USD");
      setProductCategory(null);
      router.push("/profile/my-products");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 bg-white"
    >
      <h2 className="text-3xl font-semibold text-left mb-6 text-gray-700">Add New Product</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-left text-gray-600">
            Product Name
          </label>
          <Controller
            name="name"
            control={control}
            rules={{ required: "Product name is required" }}
            render={({ field }) => (
              <input
                type="text"
                placeholder="Enter product name"
                {...field}
                className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                required
              />
            )}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{String(errors.name.message)}</p>
          )}
        </div>

        {/* Category */}
        <ProductCategorySelect
          onChange={(id) => setProductCategory(id)}
          businessId={businessData?.data?.[0]?._id}
          label="Select Category"
          userId={user?.id}
        />

        {/* Price & Discount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-left text-gray-600">
              Price
            </label>
            <Controller
              name="price"
              control={control}
              rules={{
                required: "Price is required",
                min: { value: 1, message: "Price must be greater than 0" },
              }}
              render={({ field }) => (
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="Enter price"
                  {...field}
                  className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  required
                />
              )}
            />
            {errors.price && (
              <p className="text-sm text-red-500 mt-1">{String(errors.price.message)}</p>
            )}
          </div>

          <div>
            <label htmlFor="discount_percent" className="block text-left text-gray-600">
              Discount (%)
            </label>
            <Controller
              name="discount_percent"
              control={control}
              rules={{
                min: { value: 0, message: "Min 0%" },
                max: { value: 100, message: "Max 100%" },
              }}
              render={({ field }) => (
                <input
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min={0}
                  max={100}
                  placeholder="0"
                  {...field}
                  className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              )}
            />
            {errors.discount_percent && (
              <p className="text-sm text-red-500 mt-1">
                {String(errors.discount_percent.message)}
              </p>
            )}
          </div>
        </div>

        <ProductOptionSelector control={control} name="product_options_ids" />

        {/* NEW: schedule toggle */}
        <div className="flex items-center gap-3">
          <Controller
            name="discount_schedule_enabled"
            control={control}
            render={({ field }) => (
              <input
                id="schedule-toggle"
                type="checkbox"
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            )}
          />
          <label htmlFor="schedule-toggle" className="text-gray-700">
            Schedule discount (set start/end time)
          </label>
        </div>

        {/* NEW: discount window inputs */}
        {scheduleEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-left text-gray-600">Start (optional)</label>
              <Controller
                name="discount_start_local"
                control={control}
                render={({ field }) => (
                  <input
                    type="datetime-local"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                )}
              />
            </div>
            <div>
              <label className="block text-left text-gray-600">End (optional)</label>
              <Controller
                name="discount_end_local"
                control={control}
                render={({ field }) => (
                  <input
                    type="datetime-local"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                )}
              />
            </div>
            <p className={`md:col-span-2 text-sm ${schedulePreview.ok ? "text-green-600" : "text-gray-600"}`}>
              {schedulePreview.label}
            </p>
          </div>
        )}

        {/* Currency */}
        <CurrencySelect currency={currency} setCurrency={setCurrency} />

        {/* Final price preview */}
        <div className="text-sm text-gray-700">
          You’ll charge: <span className="font-semibold">{currency} {finalPrice}</span>
          {scheduleEnabled && (
            <span className="ml-2 text-xs text-gray-500">
              (discount may apply only within the scheduled window)
            </span>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-left text-gray-600">
            Description
          </label>
          <Controller
            name="description"
            control={control}
            rules={{ required: "Description is required" }}
            render={({ field }) => (
              <textarea
                placeholder="Enter product description"
                {...field}
                className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                required
              />
            )}
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">{String(errors.description.message)}</p>
          )}
        </div>

        {/* Thumbnail */}
        <div>
          <label htmlFor="thumbnail" className="block text-left text-gray-600">
            Product Thumbnail
          </label>
          <Controller
            name="thumbnail"
            control={control}
            render={() => (
              <SingleFileUpload
                onChange={(file: File | undefined) => file && handleUpload("thumbnail", [file])}
                imageUrl={thumbnailUrl ?? undefined}
                setImageUrl={setThumbnailUrl}
                name="thumbnail"
                fileUploadLoading={thumbUploading}
              />
            )}
          />
        </div>

        {/* Gallery Images */}
        <div>
          <label htmlFor="media.images" className="block text-left text-gray-600">
            Product Images
          </label>
          <Controller
            name="media.images"
            control={control}
            render={() => (
              <FilesUpload
                id="images"
                onChange={(files: File[]) => handleUpload("images", files)}
                accept="image"
                media={media}
                setRemove={setMedia}
                fileUploadLoading={imageUploading}
              />
            )}
          />
        </div>

        <motion.button
          type="submit"
          disabled={isSubmitting || thumbUploading || imageUploading}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
        >
          {isSubmitting ? "Adding..." : "Add Product"}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ProductForm;

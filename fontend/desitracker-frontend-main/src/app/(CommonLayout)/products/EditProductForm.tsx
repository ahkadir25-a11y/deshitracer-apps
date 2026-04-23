

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";

import { useAppSelector } from "@/app/redux/hoook";
import {
  useEditProductMutation,
  useGetProductByIdQuery,
} from "@/app/redux/services/products.services";
import { useUploadImagesMutation } from "@/app/redux/services/upload-images.service";
import { useGetAllBusinessQuery } from "@/app/redux/services/business.services";

import FilesUpload from "@/components/shears/file-upload/FilesUpload";
import SingleFileUpload from "@/components/shears/file-upload/SingleFileUpload";
import CurrencySelect from "@/components/common/CurrencySelect";
import ProductCategorySelect from "./ProductCategorySelect";
import ProductOptionSelector from "./ProductOptionSelector";

type ImageObj = { url: string; description: string };

/** Helpers: datetime-local <-> ISO */
function toLocalInputValue(d?: Date | null): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
function fromLocalInputValue(v?: string): string | null {
  if (!v) return null;
  const dt = new Date(v);
  return isNaN(dt.getTime()) ? null : dt.toISOString();
}

interface FormValues {
  name: string;
  price: number | string;
  description: string;
  discount_percent?: number | string;

  // NEW: window fields for UI
  discount_schedule_enabled?: boolean;
  discount_start_local?: string; // "YYYY-MM-DDTHH:mm"
  discount_end_local?: string;   // "YYYY-MM-DDTHH:mm"

  thumbnail?: string;
  media?: {
    images: ImageObj[];
  };
  product_options_ids?: string[];

}

const EditProductForm: React.FC = () => {
  const { id } = useParams();
  const { user } = useAppSelector((s) => s.auth) as { user: { id: string } };

  const { data: productData, isLoading: isProductLoading } =
    useGetProductByIdQuery(id as string);

  const [uploadImages] = useUploadImagesMutation();
  const [editProduct] = useEditProductMutation();

  // Local UI state
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [media, setMedia] = useState<{ images: ImageObj[] }>({ images: [] });
  const [currency, setCurrency] = useState<string>("USD");
  const [productCategory, setProductCategory] = useState<string | null>(null);

  // Loading / submit state
  const [thumbUploading, setThumbUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      product_options_ids: [], // ✅
    },
  });

  // Business query only for category select’s props
  const { data: businessData } = useGetAllBusinessQuery({ owner: user?.id || "" });

  // Populate form with current product
  useEffect(() => {
    if (!productData) return;

    setThumbnailUrl(productData.thumbnail || null);
    setValue("thumbnail", productData.thumbnail || "");
    setValue("name", productData.name);
    setValue("price", productData.price);
    setValue("description", productData.description || "");
    setValue("discount_percent", productData.discount_percent ?? 0);

    setCurrency(productData.currency || "USD");
    setProductCategory(productData.product_category_id || null);

    // Prefill discount window
    const startISO: string | undefined = (productData as any)?.discount_start;
    const endISO: string | undefined = (productData as any)?.discount_end;
    const startLocal = startISO ? toLocalInputValue(new Date(startISO)) : "";
    const endLocal = endISO ? toLocalInputValue(new Date(endISO)) : "";
    setValue("discount_schedule_enabled", !!(startISO || endISO));
    setValue("discount_start_local", startLocal);
    setValue("discount_end_local", endLocal);

    const imgs: ImageObj[] = (productData.images || []).map((i: any) => ({
      url: i.url,
      description: i.description || "imageDescription",
    }));
    setMedia({ images: imgs });
    setValue("media.images", imgs);
    const optionIds = ((productData as any)?.product_options_ids ?? []).map((x: any) =>
      typeof x === "string" ? x : x?._id
    ).filter(Boolean);

    setValue("product_options_ids", optionIds as any);
  }, [productData, setValue]);

  // Live final price preview
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
    if (!scheduleEnabled || !discount || discount <= 0)
      return { label: "No scheduled discount", ok: false };
    const now = new Date();
    const startISO = fromLocalInputValue(startLocal);
    const endISO = fromLocalInputValue(endLocal);
    const start = startISO ? new Date(startISO) : null;
    const end = endISO ? new Date(endISO) : null;

    const active =
      discount > 0 &&
      (!start || now >= start) &&
      (!end || now <= end);

    if (active) return { label: "Discount is ACTIVE now", ok: true };
    if (start && now < start) return { label: "Discount will start in the future", ok: false };
    if (end && now > end) return { label: "Discount window has ended", ok: false };
    return { label: "Unlimited until you set a window", ok: false };
  }, [scheduleEnabled, discount, startLocal, endLocal]);

  // Upload handler
  const handleUpload = async (kind: "thumbnail" | "images", files: File[]) => {
    const formData = new FormData();
    const maxSize = 15 * 1024 * 1024;

    for (const f of files) {
      if (f.size > maxSize) {
        toast.error(`File ${f.name} exceeds the maximum size of 15MB.`);
        return;
      }
      formData.append("file", f);
    }

    try {
      if (kind === "thumbnail") setThumbUploading(true);
      if (kind === "images") setImageUploading(true);

      const res = await uploadImages({ formData }).unwrap();
      if (!res?.data?.length) {
        toast.error("Upload failed, please try again.");
        return;
      }

      if (kind === "thumbnail") {
        const url = res.data[0];
        setThumbnailUrl(url);
        setValue("thumbnail", url as any);
        setThumbUploading(false);
      } else {
        const uploaded: ImageObj[] = res.data.map((url: string) => ({
          url,
          description: "imageDescription",
        }));
        setMedia((prev) => {
          const next = { images: [...prev.images, ...uploaded] };
          setValue("media.images", next.images as any);
          return next;
        });
        setImageUploading(false);
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while uploading files.");
      setThumbUploading(false);
      setImageUploading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      // Prepare discount window
      const usingWindow = !!data.discount_schedule_enabled;
      const startISO = usingWindow ? fromLocalInputValue(data.discount_start_local) : null;
      const endISO = usingWindow ? fromLocalInputValue(data.discount_end_local) : null;

      // quick guards
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
      if (usingWindow && startISO && endISO && new Date(endISO) < new Date(startISO)) {
        toast.error("Discount end time must be after the start time.");
        setIsSubmitting(false);
        return;
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
        thumbnail: thumbnailUrl || "",
        currency,
        product_category_id: productCategory ?? undefined,
        discount_percent: discountNum,
        images: imagesPayload,
        // NEW: send window fields
        discount_start: usingWindow ? startISO : null,
        discount_end: usingWindow ? endISO : null,
        product_options_ids: (data.product_options_ids ?? [])
          .map((x: any) => (typeof x === "string" ? x : x?._id))
          .filter(Boolean),

      };

      await editProduct({ productId: id as string, updateData: payload }).unwrap();
      toast.success("Product updated successfully!");
      // Keep user on the page; call reset to sync RHF with latest values:
      reset({ ...data });
    } catch (error) {
      console.log(error);
      toast.error("Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isProductLoading) return <div>Loading product...</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 bg-white"
    >
      <h2 className="text-3xl font-semibold text-left mb-6 text-gray-700">Edit Product</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-left text-gray-600">Product Name</label>
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
          {errors.name && <p className="text-sm text-red-500 mt-1">{String(errors.name.message)}</p>}
        </div>

        {/* Category */}
        <ProductCategorySelect
          onChange={(val) => setProductCategory(val)}
          value={productCategory || undefined}
          businessId={businessData?.data?.[0]?._id}
          label="Select Category"
          userId={user?.id}
        />

        {/* Price & Discount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-left text-gray-600">Price</label>
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
            {errors.price && <p className="text-sm text-red-500 mt-1">{String(errors.price.message)}</p>}
          </div>

          <div>
            <label htmlFor="discount_percent" className="block text-left text-gray-600">Discount (%)</label>
            <Controller
              name="discount_percent"
              control={control}
              rules={{ min: { value: 0, message: "Min 0%" }, max: { value: 100, message: "Max 100%" } }}
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

        <ProductOptionSelector
          control={control}
          name="product_options_ids"
        />
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
        {watch("discount_schedule_enabled") && (
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
          {watch("discount_schedule_enabled") && (
            <span className="ml-2 text-xs text-gray-500">
              (discount may apply only within the scheduled window)
            </span>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-left text-gray-600">Description</label>
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
          <label htmlFor="thumbnail" className="block text-left text-gray-600">Product Thumbnail</label>
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
          <label htmlFor="media.images" className="block text-left text-gray-600">Product Images</label>
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
          {isSubmitting ? "Updating..." : "Update Product"}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default EditProductForm;

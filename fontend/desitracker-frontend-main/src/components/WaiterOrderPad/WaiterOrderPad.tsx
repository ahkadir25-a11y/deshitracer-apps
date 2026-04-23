/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import {
  useGetProductsCategoryByUserAndBusinessQuery,
  useGetProductsByCategoryQuery,
  useGetActiveTodayDayOfferQuery,
} from "@/app/redux/services/products.services";
import { useDispatch, useSelector } from "react-redux";
import {
  addProduct,
  clearOrder,
  decrement,
  increment,
  remove,
  selectWaiterItemsArray,
  selectWaiterTotals,
  setNotes,
  setOrderContext,
  setTableNo,
} from "@/app/redux/waiterOrderSlice";
import { FaCheckCircle } from "react-icons/fa";
import { useCreateOrderMutation } from "@/app/redux/services/orders.service";

interface WaiterOrderPadProps {
  userId: string;
  businessId: string;
  businessName?: string;
}

type ProductOptionGroup = {
  _id: string;
  name: string;
  options: string[];
};

type SelectedOption = {
  optionGroupId: string;
  optionGroupName: string;
  value: string;
};

const CategorySkeleton = () => (
  <div className="h-24 rounded-2xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
);

const ProductSkeleton = () => (
  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
    <div className="h-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
    <div className="p-4 space-y-2">
      <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
      <div className="h-10 w-full rounded-xl bg-gray-200 animate-pulse" />
    </div>
  </div>
);

function currencySymbol(cur?: string) {
  const c = (cur || "").toUpperCase();
  if (c === "BDT") return "৳";
  if (c === "USD") return "$";
  if (c === "EUR") return "€";
  if (c === "GBP") return "£";
  if (c === "INR") return "₹";
  if (c === "AED") return "د.إ";
  if (c === "SAR") return "﷼";
  if (c === "QAR") return "ر.ق";
  return c ? `${c} ` : "";
}

function formatMoney(amount?: number, currency?: string) {
  if (typeof amount !== "number") return "";
  const sym = currencySymbol(currency);
  return `${sym}${amount.toFixed(2)}`;
}

function getProductCurrency(p: any, fallback = "USD") {
  return (p?.currency || fallback) as string;
}

function normalizeSelectedOptions(selectedOptions: SelectedOption[]) {
  return [...selectedOptions]
    .sort((a, b) => a.optionGroupId.localeCompare(b.optionGroupId))
    .map((x) => ({
      optionGroupId: x.optionGroupId,
      optionGroupName: x.optionGroupName,
      value: x.value,
    }));
}

function buildLineId(productId: string, selectedOptions: SelectedOption[]) {
  const normalized = normalizeSelectedOptions(selectedOptions);
  return `${productId}__${JSON.stringify(normalized)}`;
}

function getCategoryIdFromProduct(product: any) {
  return typeof product?.product_category_id === "string"
    ? product?.product_category_id
    : product?.product_category_id?._id || "";
}

const WaiterOrderPad: React.FC<WaiterOrderPadProps> = ({
  userId,
  businessId,
  businessName,
}) => {
  const dispatch = useDispatch();

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);

  const [applyMembershipDiscount, setApplyMembershipDiscount] = useState(false);
  const [orderCurrency, setOrderCurrency] = useState<string>("USD");

  const [optionModalOpen, setOptionModalOpen] = useState(false);
  const [productForOptions, setProductForOptions] = useState<any | null>(null);
  const [selectedOptionValues, setSelectedOptionValues] = useState<Record<string, string>>({});

  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();

  useEffect(() => {
    dispatch(setOrderContext({ businessId, userId }));
  }, [businessId, userId, dispatch]);

  const {
    data: categories,
    isLoading: categoriesLoading,
    isFetching: categoriesFetching,
    error: categoriesError,
    refetch: refetchCategories,
  } = useGetProductsCategoryByUserAndBusinessQuery({
    user_id: userId,
    business_id: businessId,
  });

  const {
    data: products,
    isLoading: productsLoading,
    isFetching: productsFetching,
    error: productsError,
    refetch: refetchProducts,
  } = useGetProductsByCategoryQuery(
    {
      categoryId: (activeCategoryId ?? "") as string,
      user_id: userId,
      business_id: businessId,
    },
    { skip: !activeCategoryId }
  );

  const {
    data: activeTodayOffer,
    isLoading: offerLoading,
    isFetching: offerFetching,
    refetch: refetchOffer,
  } = useGetActiveTodayDayOfferQuery(
    { business_id: businessId, user_id: userId },
    { skip: !businessId }
  );

  const offerIsActive = !!activeTodayOffer?.active && !!activeTodayOffer?.offer;
  const offerPct = offerIsActive
    ? Number(activeTodayOffer?.offer?.discount_percent || 0)
    : 0;

  useEffect(() => {
    if (!offerIsActive) setApplyMembershipDiscount(false);
  }, [offerIsActive]);

  const loadError = categoriesError || productsError;

  const items = useSelector(selectWaiterItemsArray);
  const totals = useSelector(selectWaiterTotals);
  const notes = useSelector((s: any) => s.waiterOrder.notes);
  const tableNo = useSelector((s: any) => s.waiterOrder.tableNo);

  useEffect(() => {
    const first = items?.[0];
    if (first?.currency) setOrderCurrency(first.currency);
  }, [items]);

  const activeCategory = useMemo(() => {
    if (!activeCategoryId) return null;
    return (categories ?? []).find((c: any) => c?._id === activeCategoryId) ?? null;
  }, [activeCategoryId, categories]);

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories ?? [];
    return (categories ?? []).filter((c: any) => {
      const name = (c?.name ?? "").toLowerCase();
      const desc = (c?.description ?? "").toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [categories, query]);

  const filteredProducts = useMemo(() => {
    const list = products ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p: any) => {
      const name = (p?.name ?? "").toLowerCase();
      const desc = (p?.description ?? "").toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [products, query]);

  const isLoadingCategories = categoriesLoading || categoriesFetching;
  const isLoadingProducts = productsLoading || productsFetching;

  const handleRetry = () => {
    refetchCategories();
    if (activeCategoryId) refetchProducts();
    refetchOffer();
  };

  const getCategoryTypeFromProduct = (product: any) => {
    const categoryId = getCategoryIdFromProduct(product);
    const matchedCategory = (categories ?? []).find((c: any) => c?._id === categoryId);
    return String(matchedCategory?.foodOrDrink || "").toLowerCase();
  };

  const summary = useMemo(() => {
    const baseSubtotal = Number(totals?.subtotal || 0);
    const shouldApply = applyMembershipDiscount && offerIsActive && offerPct > 0;

    const eligibleSubtotal = (items ?? []).reduce((sum: number, item: any) => {
      const categoryType = String(item?.product_category_type || "").toLowerCase();
      const isDrinkCategory = categoryType === "drink";

      const lineTotal =
        typeof item?.price === "number"
          ? Number(item.price) * Number(item.quantity || 0)
          : 0;

      return isDrinkCategory ? sum : sum + lineTotal;
    }, 0);

    const discountAmount = shouldApply
      ? +(eligibleSubtotal * (offerPct / 100)).toFixed(2)
      : 0;

    const payable = +(baseSubtotal - discountAmount).toFixed(2);

    return {
      baseSubtotal,
      eligibleSubtotal,
      shouldApply,
      discountAmount,
      payable,
    };
  }, [totals?.subtotal, items, applyMembershipDiscount, offerIsActive, offerPct]);

  const buildOrderPayload = () => {
    return {
      business_id: businessId,
      user_id: userId,
      businessName:
        businessName || filteredProducts?.[0]?.business_id?.businessName || "",
      tableNo: tableNo || "",
      notes: notes || "",
      items: (items ?? []).map((item: any) => ({
        lineId: item.lineId,
        productId: item.productId,
        name: item.name,
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 0),
        currency: item.currency || orderCurrency,
        product_category_id: item.product_category_id,
        product_category_type: item.product_category_type,
        selectedOptions: Array.isArray(item.selectedOptions) ? item.selectedOptions : [],
      })),
      totals: {
        totalQty: Number(totals?.totalQty || 0),
        subtotal: Number(totals?.subtotal || 0),
      },
      membershipDiscount: {
        applied: summary.shouldApply,
        percent: summary.shouldApply ? offerPct : 0,
        discountAmount: summary.discountAmount,
        payable: summary.payable,
        offer: activeTodayOffer?.offer ?? null,
      },
      currency: orderCurrency,
      status: "pending" as const,
    };
  };

  const buildReceiptPayload = () => {
    return {
      createdAt: new Date().toISOString(),
      businessId,
      userId,
      businessName:
        businessName || filteredProducts?.[0]?.business_id?.businessName || "",
      tableNo,
      notes,
      items,
      totals,
      membershipDiscount: {
        applied: summary.shouldApply,
        percent: summary.shouldApply ? offerPct : 0,
        discountAmount: summary.discountAmount,
        payable: summary.payable,
        offer: activeTodayOffer?.offer ?? null,
      },
      currency: orderCurrency,
    };
  };

  const openPrintPage = () => {
    const payload = buildReceiptPayload();
    const key = `waiter_receipt_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(payload));
    window.open(
      `/generate-receipt?key=${encodeURIComponent(key)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleCreateOrderAndPrint = async () => {
    if (items.length === 0 || isCreatingOrder) return;

    try {
      const payload = buildOrderPayload();
      await createOrder(payload).unwrap();
      openPrintPage();
      dispatch(clearOrder());
      setOrderDrawerOpen(false);
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("Failed to create order. Please try again.");
    }
  };

  useEffect(() => {
    if (items.length === 0) setOrderDrawerOpen(false);
  }, [items.length]);

  const categoryCountMap = useMemo(() => {
    const map: Record<string, number> = {};

    for (const item of items ?? []) {
      const categoryId = item?.product_category_id;
      if (!categoryId) continue;
      map[categoryId] = (map[categoryId] || 0) + Number(item?.quantity || 0);
    }

    return map;
  }, [items]);

  const openOptionSelector = (product: any) => {
    const optionGroups: ProductOptionGroup[] = Array.isArray(product?.product_options_ids)
      ? product.product_options_ids
      : [];

    if (!optionGroups.length) {
      dispatch(
        addProduct({
          lineId: buildLineId(product?._id, []),
          productId: product?._id,
          name: product?.name ?? "Unnamed product",
          price: product?.price,
          currency: getProductCurrency(product, orderCurrency),
          product_options_ids: [],
          selectedOptions: [],
          product_category_id: getCategoryIdFromProduct(product),
          product_category_type: getCategoryTypeFromProduct(product),
        })
      );
      return;
    }

    const initialSelections: Record<string, string> = {};
    optionGroups.forEach((group) => {
      initialSelections[group._id] = "";
    });

    setSelectedOptionValues(initialSelections);
    setProductForOptions(product);
    setOptionModalOpen(true);
  };

  const confirmAddProductWithOptions = () => {
    if (!productForOptions) return;

    const optionGroups: ProductOptionGroup[] = Array.isArray(
      productForOptions?.product_options_ids
    )
      ? productForOptions.product_options_ids
      : [];

    const selectedOptions: SelectedOption[] = optionGroups
      .map((group) => ({
        optionGroupId: group._id,
        optionGroupName: group.name,
        value: selectedOptionValues[group._id] || "",
      }))
      .filter((x) => x.value.trim() !== "");

    const normalizedOptions = normalizeSelectedOptions(selectedOptions);

    dispatch(
      addProduct({
        lineId: buildLineId(productForOptions?._id, normalizedOptions),
        productId: productForOptions?._id,
        name: productForOptions?.name ?? "Unnamed product",
        price: productForOptions?.price,
        currency: getProductCurrency(productForOptions, orderCurrency),
        product_options_ids: productForOptions?.product_options_ids ?? [],
        selectedOptions: normalizedOptions,
        product_category_id: getCategoryIdFromProduct(productForOptions),
        product_category_type: getCategoryTypeFromProduct(productForOptions),
      })
    );

    setOptionModalOpen(false);
    setProductForOptions(null);
    setSelectedOptionValues({});
  };

  if (loadError) {
    return (
      <div className="min-h-screen w-full bg-gray-50 px-4 py-10">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-red-200 bg-gradient-to-b from-red-50 to-white p-6 shadow-sm">
          <p className="text-lg font-semibold text-red-800">Failed to load menu data</p>
          <p className="mt-1 text-sm text-red-700/80">Check connection and try again.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleRetry}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition"
            >
              Try again
            </button>
            <button
              onClick={() => {
                setActiveCategoryId(null);
                setQuery("");
              }}
              className="rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 transition"
            >
              Reset view
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto w-full px-4 py-3">
          <div className="flex items-center gap-3">
            {activeCategoryId ? (
              <button
                onClick={() => {
                  setActiveCategoryId(null);
                  setQuery("");
                }}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
              >
                ← Categories
              </button>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900">
                Waiter Pad
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
                <span className="text-gray-400">🔎</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={activeCategoryId ? "Search products…" : "Search categories…"}
                  className="w-full bg-transparent text-sm outline-none"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="rounded-lg px-2 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <input
                value={tableNo}
                onChange={(e) => dispatch(setTableNo(e.target.value))}
                placeholder="Table #"
                className="w-[110px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => dispatch(clearOrder())}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
              >
                Clear
              </button>
              <button
                onClick={handleCreateOrderAndPrint}
                disabled={items.length === 0 || isCreatingOrder}
                className={[
                  "rounded-xl px-3 py-2 text-sm font-semibold text-white transition",
                  items.length === 0 || isCreatingOrder
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
                ].join(" ")}
              >
                {isCreatingOrder ? "Saving..." : "Create Order + Print"}
              </button>
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-600">
            {activeCategoryId ? (
              <>
                <span className="font-medium">Category:</span> {activeCategory?.name ?? "Category"}
              </>
            ) : (
              <>
                <span className="font-medium">Tip:</span> Tap a category tile to open products.
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full px-4 py-5 pb-24 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <section className="lg:col-span-8 xl:col-span-9">
            {!activeCategoryId ? (
              <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-gray-200">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Categories</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Big tiles for quick selection. Search above to find faster.
                  </p>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {isLoadingCategories
                      ? Array.from({ length: 12 }).map((_, i) => <CategorySkeleton key={i} />)
                      : (filteredCategories ?? []).map((cat: any) => {
                          const count = categoryCountMap[cat?._id] || 0;

                          return (
                            <button
                              key={cat?._id}
                              onClick={() => {
                                setActiveCategoryId(cat?._id);
                                setQuery("");
                              }}
                              className="group relative rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 transition active:scale-[0.99]"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-base font-bold text-gray-900 truncate">
                                    {cat?.name ?? "Unnamed"}
                                  </p>
                                  <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                                    {cat?.description ?? "Tap to open"}
                                  </p>
                                </div>

                                <div className="flex flex-col items-end gap-2 shrink-0">
                                  <span className="rounded-xl bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                                    Open →
                                  </span>

                                  {count > 0 && (
                                    <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-extrabold text-white">
                                      {count} added
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="mt-4 h-1.5 w-16 rounded-full bg-gray-200 group-hover:bg-blue-500 transition" />
                            </button>
                          );
                        })}
                  </div>

                  {!isLoadingCategories && (filteredCategories?.length ?? 0) === 0 && (
                    <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
                      <p className="font-semibold text-gray-900">No matching categories</p>
                      <p className="mt-1 text-sm text-gray-600">Try a different search.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-gray-200 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {activeCategory?.name ?? "Products"}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Tap a product to add. If it has options, choose them first.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveCategoryId(null)}
                    className="inline-flex items-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black transition"
                  >
                    Categories
                  </button>
                </div>

                <div className="p-5 sm:p-6">
                  {isLoadingProducts ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <ProductSkeleton key={i} />
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {(filteredProducts ?? []).map((p: any) => {
                          const hasOptions =
                            Array.isArray(p?.product_options_ids) &&
                            p.product_options_ids.length > 0;

                          return (
                            <button
                              key={p?._id}
                              onClick={() => openOptionSelector(p)}
                              className="group rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 transition active:scale-[0.99]"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <p className="min-w-0 text-sm font-bold text-gray-900 line-clamp-2">
                                  {p?.name ?? "Unnamed"}
                                </p>
                                <span className="shrink-0 rounded-xl bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                                  + Add
                                </span>
                              </div>

                              <p className="mt-2 text-xs text-gray-600 line-clamp-2">
                                {p?.description ?? "Tap to add to order"}
                              </p>

                              <div className="mt-4 flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-700">
                                  {typeof p?.price === "number"
                                    ? formatMoney(p.price, getProductCurrency(p, orderCurrency))
                                    : ""}
                                </span>
                                <span className="text-[11px] font-semibold text-gray-500">
                                  {hasOptions ? "Choose options" : "Tap anywhere"}
                                </span>
                              </div>

                              {hasOptions && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                                    Has options ({p.product_options_ids.length})
                                  </span>
                                  {p.product_options_ids.map((group: any) => (
                                    <span
                                      key={group?._id}
                                      className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700"
                                    >
                                      {group?.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {!isLoadingProducts && (filteredProducts?.length ?? 0) === 0 && (
                        <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
                          <p className="font-semibold text-gray-900">No matching products</p>
                          <p className="mt-1 text-sm text-gray-600">
                            Try a different search or go back to categories.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </section>

          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="sticky top-[88px] rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-gray-900">Order</h3>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-800">
                    {totals.totalQty} items
                  </span>
                </div>

                <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-gray-900">Membership discount</p>
                      <p className="mt-1 text-xs text-gray-600">
                        {offerLoading || offerFetching
                          ? "Checking today's offer…"
                          : offerIsActive
                          ? `Active today: ${offerPct}% (${activeTodayOffer?.day})`
                          : "No active offer for today"}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={!offerIsActive}
                      onClick={() => setApplyMembershipDiscount((v) => !v)}
                      className={[
                        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition",
                        !offerIsActive
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : applyMembershipDiscount
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-white border border-gray-200 text-gray-800 hover:bg-gray-100",
                      ].join(" ")}
                    >
                      <FaCheckCircle />
                      {applyMembershipDiscount ? "Applied" : "Apply"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <input
                    value={tableNo}
                    onChange={(e) => dispatch(setTableNo(e.target.value))}
                    placeholder="Table #"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => dispatch(clearOrder())}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
                  >
                    Clear
                  </button>
                </div>

                <textarea
                  value={notes}
                  onChange={(e) => dispatch(setNotes(e.target.value))}
                  placeholder="Notes (extra spicy, no onion...)"
                  className="mt-3 w-full min-h-[90px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-6 space-y-3 max-h-[52vh] overflow-auto">
                {items.length === 0 ? (
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
                    <p className="text-sm font-bold text-gray-900">No items yet</p>
                    <p className="mt-1 text-xs text-gray-600">Tap products to add.</p>
                  </div>
                ) : (
                  items.map((it: any) => {
                    const lineBase =
                      typeof it.price === "number" ? it.price * it.quantity : 0;

                    const categoryType = String(it?.product_category_type || "").toLowerCase();
                    const isDrinkCategory = categoryType === "drink";

                    const lineDiscounted =
                      summary.shouldApply && offerPct > 0 && !isDrinkCategory
                        ? +(lineBase * (1 - offerPct / 100)).toFixed(2)
                        : lineBase;

                    return (
                      <div key={it.lineId} className="rounded-2xl border border-gray-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {it.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-600">
                              Qty: {it.quantity}
                              {typeof it.price === "number"
                                ? ` • ${formatMoney(it.price, it.currency || orderCurrency)}`
                                : ""}
                            </p>

                            {Array.isArray(it.selectedOptions) &&
                              it.selectedOptions.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {it.selectedOptions.map((opt: any) => (
                                    <span
                                      key={`${opt.optionGroupId}_${opt.value}`}
                                      className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700"
                                    >
                                      {opt.optionGroupName}: {opt.value}
                                    </span>
                                  ))}
                                </div>
                              )}

                            {isDrinkCategory && (
                              <p className="mt-2 text-[11px] font-semibold text-amber-700">
                                Membership discount not applicable
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => dispatch(remove({ lineId: it.lineId }))}
                            className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => dispatch(decrement({ lineId: it.lineId }))}
                            className="h-10 w-10 rounded-xl border border-gray-200 text-lg font-black text-gray-800 hover:bg-gray-50 transition"
                          >
                            −
                          </button>
                          <button
                            onClick={() => dispatch(increment({ lineId: it.lineId }))}
                            className="h-10 w-10 rounded-xl border border-gray-200 text-lg font-black text-gray-800 hover:bg-gray-50 transition"
                          >
                            +
                          </button>

                          <div className="ml-auto text-right">
                            {summary.shouldApply && offerPct > 0 && !isDrinkCategory ? (
                              <>
                                <div className="text-xs text-gray-500 line-through">
                                  {formatMoney(lineBase, it.currency || orderCurrency)}
                                </div>
                                <div className="text-sm font-bold text-gray-900">
                                  {formatMoney(lineDiscounted, it.currency || orderCurrency)}
                                </div>
                              </>
                            ) : (
                              <div className="text-sm font-bold text-gray-900">
                                {formatMoney(lineBase, it.currency || orderCurrency)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-6 border-t border-gray-200">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900">
                      {formatMoney(summary.baseSubtotal, orderCurrency)}
                    </span>
                  </div>

                  {summary.shouldApply && (
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Discount eligible subtotal</span>
                      <span className="font-bold text-gray-900">
                        {formatMoney(summary.eligibleSubtotal, orderCurrency)}
                      </span>
                    </div>
                  )}

                  {summary.shouldApply && offerPct > 0 && (
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Membership discount ({offerPct}%)</span>
                      <span className="font-bold text-green-700">
                        - {formatMoney(summary.discountAmount, orderCurrency)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-gray-700">
                    <span className="font-semibold">Payable</span>
                    <span className="font-extrabold text-gray-900">
                      {formatMoney(
                        summary.shouldApply ? summary.payable : summary.baseSubtotal,
                        orderCurrency
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCreateOrderAndPrint}
                  disabled={items.length === 0 || isCreatingOrder}
                  className={[
                    "mt-4 w-full rounded-2xl px-5 py-3 text-sm font-extrabold text-white transition",
                    items.length === 0 || isCreatingOrder
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
                  ].join(" ")}
                >
                  {isCreatingOrder ? "Saving order..." : "Create Order / Print / Save as PDF"}
                </button>

                <p className="mt-2 text-xs text-gray-500">
                  First saves order in DB, then opens print dialog.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOrderDrawerOpen(true)}
              className="flex-1 rounded-2xl bg-gray-900 px-4 py-3 text-sm font-extrabold text-white"
            >
              View Order ({totals.totalQty})
            </button>

            <button
              onClick={handleCreateOrderAndPrint}
              disabled={items.length === 0 || isCreatingOrder}
              className={[
                "rounded-2xl px-4 py-3 text-sm font-extrabold text-white transition",
                items.length === 0 || isCreatingOrder ? "bg-gray-300" : "bg-blue-600",
              ].join(" ")}
            >
              {isCreatingOrder ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div
        className={[
          "lg:hidden fixed inset-0 z-50 transition",
          orderDrawerOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        aria-hidden={!orderDrawerOpen}
      >
        <div
          onClick={() => setOrderDrawerOpen(false)}
          className={[
            "absolute inset-0 bg-black/40 transition-opacity",
            orderDrawerOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />

        <div
          className={[
            "absolute bottom-0 left-0 right-0 max-h-[88vh] rounded-t-3xl bg-white shadow-2xl transition-transform",
            orderDrawerOpen ? "translate-y-0" : "translate-y-full",
          ].join(" ")}
        >
          <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-extrabold text-gray-900">Order</p>
              <p className="text-xs text-gray-600">{totals.totalQty} total items</p>
            </div>
            <button
              onClick={() => setOrderDrawerOpen(false)}
              className="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-800"
            >
              Close
            </button>
          </div>

          <div className="p-4 space-y-3 overflow-auto max-h-[58vh]">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-gray-900">Membership discount</p>
                  <p className="mt-1 text-xs text-gray-600">
                    {offerLoading || offerFetching
                      ? "Checking today's offer…"
                      : offerIsActive
                      ? `Active today: ${offerPct}% (${activeTodayOffer?.day})`
                      : "No active offer for today"}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!offerIsActive}
                  onClick={() => setApplyMembershipDiscount((v) => !v)}
                  className={[
                    "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition",
                    !offerIsActive
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : applyMembershipDiscount
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-white border border-gray-200 text-gray-800 hover:bg-gray-100",
                  ].join(" ")}
                >
                  <FaCheckCircle />
                  {applyMembershipDiscount ? "Applied" : "Apply"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                value={tableNo}
                onChange={(e) => dispatch(setTableNo(e.target.value))}
                placeholder="Table #"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => dispatch(clearOrder())}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-800"
              >
                Clear
              </button>
            </div>

            <textarea
              value={notes}
              onChange={(e) => dispatch(setNotes(e.target.value))}
              placeholder="Notes"
              className="w-full min-h-[70px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />

            {items.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
                <p className="font-bold text-gray-900">No items yet</p>
                <p className="mt-1 text-sm text-gray-600">Add products from the menu.</p>
              </div>
            ) : (
              items.map((it: any) => {
                const lineBase =
                  typeof it.price === "number" ? it.price * it.quantity : 0;

                const categoryType = String(it?.product_category_type || "").toLowerCase();
                const isDrinkCategory = categoryType === "drink";

                const lineDiscounted =
                  summary.shouldApply && offerPct > 0 && !isDrinkCategory
                    ? +(lineBase * (1 - offerPct / 100)).toFixed(2)
                    : lineBase;

                return (
                  <div key={it.lineId} className="rounded-2xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-gray-900 truncate">
                          {it.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                          Qty: {it.quantity}
                          {typeof it.price === "number"
                            ? ` • ${formatMoney(it.price, it.currency || orderCurrency)}`
                            : ""}
                        </p>

                        {Array.isArray(it.selectedOptions) &&
                          it.selectedOptions.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {it.selectedOptions.map((opt: any) => (
                                <span
                                  key={`${opt.optionGroupId}_${opt.value}`}
                                  className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700"
                                >
                                  {opt.optionGroupName}: {opt.value}
                                </span>
                              ))}
                            </div>
                          )}

                        {isDrinkCategory && (
                          <p className="mt-2 text-[11px] font-semibold text-amber-700">
                            Membership discount not applicable
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => dispatch(remove({ lineId: it.lineId }))}
                        className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => dispatch(decrement({ lineId: it.lineId }))}
                        className="h-11 w-11 rounded-2xl border border-gray-200 text-xl font-black"
                      >
                        −
                      </button>
                      <button
                        onClick={() => dispatch(increment({ lineId: it.lineId }))}
                        className="h-11 w-11 rounded-2xl border border-gray-200 text-xl font-black"
                      >
                        +
                      </button>

                      <div className="ml-auto text-right">
                        {summary.shouldApply && offerPct > 0 && !isDrinkCategory ? (
                          <>
                            <div className="text-xs text-gray-500 line-through">
                              {formatMoney(lineBase, it.currency || orderCurrency)}
                            </div>
                            <div className="text-sm font-extrabold text-gray-900">
                              {formatMoney(lineDiscounted, it.currency || orderCurrency)}
                            </div>
                          </>
                        ) : (
                          <div className="text-sm font-extrabold text-gray-900">
                            {formatMoney(lineBase, it.currency || orderCurrency)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-gray-700">
                <span>Subtotal</span>
                <span className="font-extrabold text-gray-900">
                  {formatMoney(summary.baseSubtotal, orderCurrency)}
                </span>
              </div>

              {summary.shouldApply && (
                <div className="flex items-center justify-between text-gray-700">
                  <span>Discount eligible subtotal</span>
                  <span className="font-extrabold text-gray-900">
                    {formatMoney(summary.eligibleSubtotal, orderCurrency)}
                  </span>
                </div>
              )}

              {summary.shouldApply && offerPct > 0 && (
                <div className="flex items-center justify-between text-gray-700">
                  <span>Membership discount ({offerPct}%)</span>
                  <span className="font-extrabold text-green-700">
                    - {formatMoney(summary.discountAmount, orderCurrency)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-gray-700">
                <span className="font-semibold">Payable</span>
                <span className="font-extrabold text-gray-900">
                  {formatMoney(
                    summary.shouldApply ? summary.payable : summary.baseSubtotal,
                    orderCurrency
                  )}
                </span>
              </div>
            </div>

            <button
              onClick={handleCreateOrderAndPrint}
              disabled={items.length === 0 || isCreatingOrder}
              className={[
                "mt-3 w-full rounded-2xl px-5 py-3 text-sm font-extrabold text-white transition",
                items.length === 0 || isCreatingOrder
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
              ].join(" ")}
            >
              {isCreatingOrder ? "Saving order..." : "Create Order / Print / Save as PDF"}
            </button>

            <p className="mt-2 text-xs text-gray-500 text-center">
              First saves order in DB, then opens print dialog.
            </p>
          </div>
        </div>
      </div>

      <div
        className={[
          "fixed inset-0 z-[70] transition",
          optionModalOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      >
        <div
          onClick={() => {
            setOptionModalOpen(false);
            setProductForOptions(null);
            setSelectedOptionValues({});
          }}
          className={[
            "absolute inset-0 bg-black/50 transition-opacity",
            optionModalOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />

        <div
          className={[
            "absolute left-1/2 top-1/2 w-[94%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white shadow-2xl transition",
            optionModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0",
          ].join(" ")}
        >
          <div className="border-b border-gray-200 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">Choose options</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {productForOptions?.name ?? "Product"}
                </p>
              </div>

              <button
                onClick={() => {
                  setOptionModalOpen(false);
                  setProductForOptions(null);
                  setSelectedOptionValues({});
                }}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-auto p-5 sm:p-6 space-y-5">
            {Array.isArray(productForOptions?.product_options_ids) &&
              productForOptions.product_options_ids.map((group: ProductOptionGroup) => (
                <div key={group._id} className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm font-extrabold text-gray-900">{group.name}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Optional — choose one if needed
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.options?.map((opt) => {
                      const active = selectedOptionValues[group._id] === opt;

                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            setSelectedOptionValues((prev) => ({
                              ...prev,
                              [group._id]: opt,
                            }))
                          }
                          className={[
                            "rounded-2xl border px-4 py-2 text-sm font-semibold transition",
                            active
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50",
                          ].join(" ")}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>

          <div className="border-t border-gray-200 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600">
                Price:{" "}
                <span className="font-extrabold text-gray-900">
                  {formatMoney(
                    productForOptions?.price,
                    getProductCurrency(productForOptions, orderCurrency)
                  )}
                </span>
              </div>

              <button
                onClick={confirmAddProductWithOptions}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-700 active:bg-blue-800 transition"
              >
                Add to order
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          header,
          main,
          .fixed,
          .lg\\:hidden {
            display: none !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WaiterOrderPad;
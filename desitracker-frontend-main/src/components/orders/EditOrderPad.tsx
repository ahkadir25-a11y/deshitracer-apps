/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import {
  useGetProductsCategoryByUserAndBusinessQuery,
  useGetProductsByCategoryQuery,
  useGetActiveTodayDayOfferQuery,
} from "@/app/redux/services/products.services";
import {
  useGetOrderByIdQuery,
  useUpdateOrderMutation,
} from "@/app/redux/services/orders.service";
import { useDispatch, useSelector } from "react-redux";
import {
  addProduct,
  clearOrder,
  decrement,
  increment,
  loadExistingOrder,
  remove,
  selectWaiterItemsArray,
  selectWaiterTotals,
  setNotes,
  setOrderContext,
  setTableNo,
} from "@/app/redux/waiterOrderSlice";
import { FaCheckCircle } from "react-icons/fa";

interface EditOrderPadProps {
  orderId: string;
  userId: string;
  businessId: string;
  businessName?: string;
  onUpdated?: () => void;
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

const EditOrderPad: React.FC<EditOrderPadProps> = ({
  orderId,
  userId,
  businessId,
  businessName,
  onUpdated,
}) => {
  const dispatch = useDispatch();

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [applyMembershipDiscount, setApplyMembershipDiscount] = useState(false);
  const [orderCurrency, setOrderCurrency] = useState<string>("USD");

  const [optionModalOpen, setOptionModalOpen] = useState(false);
  const [productForOptions, setProductForOptions] = useState<any | null>(null);
  const [selectedOptionValues, setSelectedOptionValues] = useState<Record<string, string>>({});

  const { data: orderData, isLoading: orderLoading } = useGetOrderByIdQuery({
    id: orderId,
    business_id: businessId,
  });

  const [updateOrder, { isLoading: isUpdatingOrder }] = useUpdateOrderMutation();

  useEffect(() => {
    dispatch(setOrderContext({ businessId, userId }));
  }, [businessId, userId, dispatch]);

  const {
    data: categories,
    isLoading: categoriesLoading,
  } = useGetProductsCategoryByUserAndBusinessQuery({
    user_id: userId,
    business_id: businessId,
  });

  const {
    data: products,
    isLoading: productsLoading,
  } = useGetProductsByCategoryQuery(
    {
      categoryId: activeCategoryId ?? "",
      user_id: userId,
      business_id: businessId,
    },
    { skip: !activeCategoryId }
  );

  const { data: activeTodayOffer } = useGetActiveTodayDayOfferQuery(
    { business_id: businessId, user_id: userId },
    { skip: !businessId }
  );

  const items = useSelector(selectWaiterItemsArray);
  const totals = useSelector(selectWaiterTotals);
  const notes = useSelector((s: any) => s.waiterOrder.notes);
  const tableNo = useSelector((s: any) => s.waiterOrder.tableNo);

  const offerIsActive = !!activeTodayOffer?.active && !!activeTodayOffer?.offer;
  const offerPct = offerIsActive
    ? Number(activeTodayOffer?.offer?.discount_percent || 0)
    : 0;

  useEffect(() => {
    if (!orderData) return;

    dispatch(
      loadExistingOrder({
        businessId: orderData.business_id,
        userId: orderData.user_id,
        notes: orderData.notes,
        tableNo: orderData.tableNo,
        items: (orderData.items || []).map((item: any) => ({
          lineId: item.lineId,
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          currency: item.currency,
          selectedOptions: item.selectedOptions ?? [],
          product_options_ids: item.product_options_ids ?? [],
          product_category_id: item.product_category_id,
          product_category_type: item.product_category_type,
        })),
      })
    );

    setApplyMembershipDiscount(!!orderData.membershipDiscount?.applied);
    if (orderData.currency) setOrderCurrency(orderData.currency);
  }, [orderData, dispatch]);

  useEffect(() => {
    const first = items?.[0];
    if (first?.currency) setOrderCurrency(first.currency);
  }, [items]);

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

  const buildUpdatePayload = () => ({
    business_id: businessId,
    user_id: userId,
    businessName: businessName || orderData?.businessName || "",
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
    totalQty: Number(totals?.totalQty || 0),
    subtotal: Number(totals?.subtotal || 0),
    membershipDiscount: {
      applied: summary.shouldApply,
      percent: summary.shouldApply ? offerPct : 0,
      discountAmount: summary.discountAmount,
      payable: summary.payable,
      offer: activeTodayOffer?.offer ?? null,
    },
    currency: orderCurrency,
    status: orderData?.status || "pending",
  });

  const handleUpdateOrder = async () => {
    if (!orderId || isUpdatingOrder) return;

    try {
      await updateOrder({
        id: orderId,
        business_id: businessId,
        updates: buildUpdatePayload(),
      }).unwrap();

      alert("Order updated successfully.");
      onUpdated?.();
    } catch (error) {
      console.error("Failed to update order:", error);
      alert("Failed to update order.");
    }
  };

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

  if (orderLoading) {
    return <div className="p-6">Loading order...</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <section className="lg:col-span-8 rounded-3xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-gray-900">Edit Order</h2>
          <button
            onClick={handleUpdateOrder}
            disabled={isUpdatingOrder}
            className={`rounded-2xl px-5 py-3 text-sm font-extrabold text-white ${
              isUpdatingOrder ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isUpdatingOrder ? "Updating..." : "Update Order"}
          </button>
        </div>

        <div className="mb-4 flex gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none"
          />
          <input
            value={tableNo}
            onChange={(e) => dispatch(setTableNo(e.target.value))}
            placeholder="Table #"
            className="w-[120px] rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none"
          />
        </div>

        <div className="mb-4">
          <textarea
            value={notes}
            onChange={(e) => dispatch(setNotes(e.target.value))}
            placeholder="Notes"
            className="min-h-[90px] w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none"
          />
        </div>

        <div className="mb-4">
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
            {applyMembershipDiscount ? "Discount Applied" : "Apply Discount"}
          </button>
        </div>

        {!activeCategoryId ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {(categoriesLoading ? [] : categories ?? []).map((cat: any) => (
              <button
                key={cat._id}
                onClick={() => setActiveCategoryId(cat._id)}
                className="rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm"
              >
                <p className="font-bold text-gray-900">{cat.name}</p>
                <p className="mt-1 text-xs text-gray-600">{cat.description}</p>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setActiveCategoryId(null)}
              className="mb-4 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Back to Categories
            </button>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {(productsLoading ? [] : filteredProducts).map((p: any) => (
                <button
                  key={p._id}
                  onClick={() => openOptionSelector(p)}
                  className="rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-gray-900">{p.name}</p>
                    <span className="rounded-xl bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                      + Add
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-gray-600">{p.description}</p>
                  <p className="mt-3 text-sm font-semibold text-gray-800">
                    {formatMoney(p.price, getProductCurrency(p, orderCurrency))}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <aside className="lg:col-span-4 rounded-3xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-extrabold text-gray-900">Current Items</h3>

        <div className="mt-4 space-y-3">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
              No items
            </div>
          ) : (
            items.map((it: any) => {
              const lineBase =
                typeof it.price === "number" ? it.price * it.quantity : 0;

              return (
                <div key={it.lineId} className="rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-900">{it.name}</p>
                      <p className="mt-1 text-xs text-gray-600">
                        Qty: {it.quantity} • {formatMoney(it.price, it.currency || orderCurrency)}
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
                      className="h-10 w-10 rounded-xl border border-gray-200 text-lg font-black"
                    >
                      −
                    </button>
                    <button
                      onClick={() => dispatch(increment({ lineId: it.lineId }))}
                      className="h-10 w-10 rounded-xl border border-gray-200 text-lg font-black"
                    >
                      +
                    </button>

                    <div className="ml-auto text-right">
                      <div className="text-sm font-bold text-gray-900">
                        {formatMoney(lineBase, it.currency || orderCurrency)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-5 space-y-2 border-t border-gray-200 pt-5 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-bold">{formatMoney(summary.baseSubtotal, orderCurrency)}</span>
          </div>

          {summary.shouldApply && (
            <div className="flex justify-between">
              <span>Discount</span>
              <span className="font-bold text-green-700">
                - {formatMoney(summary.discountAmount, orderCurrency)}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="font-semibold">Payable</span>
            <span className="font-extrabold">
              {formatMoney(summary.shouldApply ? summary.payable : summary.baseSubtotal, orderCurrency)}
            </span>
          </div>
        </div>
      </aside>

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
                  <p className="mt-1 text-xs text-gray-500">Optional — choose one if needed</p>

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
            <button
              onClick={confirmAddProductWithOptions}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-700"
            >
              Add to order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditOrderPad;
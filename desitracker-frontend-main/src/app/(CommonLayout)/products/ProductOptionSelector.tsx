"use client";

import React, { useMemo, useState } from "react";
import { Controller, Control } from "react-hook-form";
import ProductOptionModal from "./ProductOptionModal";
import { FaTimes, FaPlus, FaEdit } from "react-icons/fa";
import {
  useDeleteProductOptionMutation,
  useGetProductOptionsQuery,
} from "@/app/redux/services/productOption.service";
import { useAppSelector } from "@/app/redux/hoook";
import { FaTrash } from "react-icons/fa6";

type ProductOption = {
  _id: string;
  name: string;
  options: string[];
};

type Props = {
  control: Control<any>;
  name?: string;
  onSelectedChange?: (ids: string[]) => void;
  disabled?: boolean;
};

const ProductOptionSelector: React.FC<Props> = ({
  control,
  name = "product_options_ids",
  onSelectedChange,
  disabled,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<ProductOption | null>(null);

  const { user } = useAppSelector((s) => s.auth) as { user: { id: string } };

  const {
    data: productOptions = [],
    isLoading,
    isFetching,
  } = useGetProductOptionsQuery(user?.id, {
    skip: !user?.id,
  });

  const [deleteProductOption, { isLoading: deleting }] =
    useDeleteProductOptionMutation();

  const optionsMap = useMemo(() => {
    const map = new Map<string, ProductOption>();
    productOptions.forEach((o) => map.set(o._id, o));
    return map;
  }, [productOptions]);

  const openCreate = () => {
    setEditingOption(null);
    setModalOpen(true);
  };

  const openEdit = (opt: ProductOption) => {
    setEditingOption(opt);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingOption(null);
  };

  const handleDelete = async (
    optId: string,
    selectedIds: string[],
    setValue: (v: string[]) => void
  ) => {
    if (!user?.id) {
      alert("User not found.");
      return;
    }

    if (!confirm("Delete this product option?")) return;

    try {
      await deleteProductOption({
        optionId: optId,
        userId: user.id,
      }).unwrap();

      if (selectedIds.includes(optId)) {
        const next = selectedIds.filter((id) => id !== optId);
        setValue(next);
        onSelectedChange?.(next);
      }
    } catch {
      alert("Failed to delete option.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block font-medium text-gray-700">
          Product Options
        </label>

        <button
          type="button"
          onClick={openCreate}
          disabled={disabled || !user?.id}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <FaPlus className="text-sm" />
          Add Option
        </button>
      </div>

      <Controller
        name={name}
        control={control}
        defaultValue={[]}
        render={({ field, fieldState }) => {
          const selectedIds: string[] = Array.isArray(field.value)
            ? field.value
                .map((x: any) => (typeof x === "string" ? x : x?._id))
                .filter(Boolean)
            : [];

          const setSelectedIds = (next: string[]) => {
            field.onChange(next);
            onSelectedChange?.(next);
          };

          const selectedOptions = selectedIds
            .map((id) => optionsMap.get(id))
            .filter(Boolean) as ProductOption[];

          const availableOptions = productOptions.filter(
            (opt) => !selectedIds.includes(opt._id)
          );

          return (
            <>
              <select
                value=""
                onChange={(e) => {
                  const chosenId = e.target.value;
                  if (!chosenId) return;
                  if (selectedIds.includes(chosenId)) return;

                  setSelectedIds([...selectedIds, chosenId]);
                }}
                disabled={disabled || isLoading || isFetching || !user?.id}
                className="w-full rounded-md border p-2 disabled:opacity-60"
              >
                <option value="" disabled>
                  {!user?.id
                    ? "User not found"
                    : isLoading
                    ? "Loading options..."
                    : "Select an option to add"}
                </option>

                {availableOptions.map((opt) => (
                  <option key={opt._id} value={opt._id}>
                    {opt.name}
                  </option>
                ))}
              </select>

              {fieldState.error?.message ? (
                <p className="text-sm text-red-600">{fieldState.error.message}</p>
              ) : null}

              <div className="mt-2">
                <p className="mb-2 text-sm text-gray-600">Selected:</p>

                {selectedOptions.length === 0 ? (
                  <p className="text-sm text-gray-400">No options selected.</p>
                ) : (
                  <ul className="space-y-2">
                    {selectedOptions.map((opt) => (
                      <li
                        key={opt._id}
                        className="flex items-center justify-between rounded-md border px-3 py-2"
                      >
                        <div>
                          <div className="font-medium text-gray-800">
                            {opt.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {opt.options?.join(", ")}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openEdit(opt)}
                            disabled={disabled || !user?.id}
                            className="text-gray-600 hover:text-gray-900 disabled:opacity-60"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const next = selectedIds.filter(
                                (id) => id !== opt._id
                              );
                              setSelectedIds(next);
                            }}
                            disabled={disabled}
                            className="text-red-500 hover:text-red-700 disabled:opacity-60"
                            title="Remove from selection"
                          >
                            <FaTimes />
                          </button>

                          
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(opt._id, selectedIds, setSelectedIds)
                            }
                            disabled={disabled || deleting || !user?.id}
                            className="text-red-600 hover:text-red-800 disabled:opacity-60"
                            title="Delete option"
                          >
                            <FaTrash />
                          </button>
                         
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <ProductOptionModal
                isOpen={modalOpen}
                closeModal={closeModal}
                editingOption={editingOption}
              />
            </>
          );
        }}
      />
    </div>
  );
};

export default ProductOptionSelector;
"use client";

import React, { useEffect, useState } from "react";
import {
  useCreateProductOptionMutation,
  useUpdateProductOptionMutation,
} from "@/app/redux/services/productOption.service";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import { useAppSelector } from "@/app/redux/hoook";

type ProductOption = {
  _id: string;
  name: string;
  options: string[];
};

type Props = {
  isOpen: boolean;
  closeModal: () => void;
  editingOption: ProductOption | null;
};

const ProductOptionModal: React.FC<Props> = ({
  isOpen,
  closeModal,
  editingOption,
}) => {
  const isEdit = !!editingOption;

  const [name, setName] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [newValue, setNewValue] = useState("");

  const { user } = useAppSelector((s) => s.auth) as { user: { id: string } };

  const [createOption, { isLoading: creating }] =
    useCreateProductOptionMutation();
  const [updateOption, { isLoading: updating }] =
    useUpdateProductOptionMutation();

  const busy = creating || updating;

  useEffect(() => {
    if (!isOpen) return;

    if (editingOption) {
      setName(editingOption.name ?? "");
      setOptions(
        Array.isArray(editingOption.options) ? editingOption.options : []
      );
    } else {
      setName("");
      setOptions([]);
    }
    setNewValue("");
  }, [isOpen, editingOption]);

  const addSubOption = () => {
    const v = newValue.trim();
    if (!v) return;
    if (options.includes(v)) return;
    setOptions((prev) => [...prev, v]);
    setNewValue("");
  };

  const removeSubOption = (v: string) => {
    setOptions((prev) => prev.filter((x) => x !== v));
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      alert("User not found.");
      return;
    }

    if (!name.trim()) {
      alert("Option name is required.");
      return;
    }

    if (options.length === 0) {
      alert("Please add at least one sub-option.");
      return;
    }

    try {
      if (isEdit && editingOption?._id) {
        await updateOption({
          optionId: editingOption._id,
          updateData: {
            name: name.trim(),
            options,
            userId: user.id,
          },
        }).unwrap();
      } else {
        await createOption({
          name: name.trim(),
          options,
          userId: user.id,
        }).unwrap();
      }

      closeModal();
    } catch {
      alert("Failed to save product option.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[520px] max-w-[92vw] rounded-md bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isEdit ? "Edit Product Option" : "Create Product Option"}
          </h2>

          <button
            type="button"
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-800"
          >
            <FaTimes />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-gray-600">Option Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border p-2"
              placeholder="e.g. Color"
            />
          </div>

          <div>
            <label className="mb-1 block text-gray-600">Sub-options</label>

            <div className="flex gap-2">
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="flex-1 rounded-md border p-2"
                placeholder="e.g. Red"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSubOption();
                  }
                }}
              />
              <button
                type="button"
                onClick={addSubOption}
                className="rounded-md bg-blue-600 px-3 py-2 text-white"
              >
                <FaPlus />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {options.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No sub-options added yet.
                </p>
              ) : (
                options.map((v) => (
                  <div
                    key={v}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <span className="text-gray-800">{v}</span>
                    <button
                      type="button"
                      onClick={() => removeSubOption(v)}
                      className="text-red-600 hover:text-red-800"
                      title="Remove"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeModal}
              disabled={busy}
              className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={busy}
              className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
            >
              {busy ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductOptionModal;
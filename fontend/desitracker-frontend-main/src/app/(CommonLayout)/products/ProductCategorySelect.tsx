'use client';

import React, { useEffect, useState } from 'react';
import {
  useGetCategoriesQuery,
  type Category,
} from '@/app/redux/services/category.service';

type Props = {
  value?: string | null;                         // controlled value from parent
  onChange: (id: string | null, cat?: Category) => void;
  userId?: string;
  businessId?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export default function ProductCategorySelect({
  value,
  onChange,
  userId,
  businessId,
  label = 'Category',
  placeholder = 'Select a category',
  disabled = false,
  className = '',
}: Props) {
  /* ──────────────────────────────────────────
     Local state keeps the UI responsive even
     if the parent forgets to lift state up.
  ─────────────────────────────────────────── */
  const [selectedId, setSelectedId] = useState<string>('');

  // keep local state in sync if parent controls it
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setSelectedId(String(value));
    }
  }, [value]);

  const { data, isLoading, isError, refetch } = useGetCategoriesQuery({
    user_id: userId,
    business_id: businessId,
  });

  const categories = data ?? [];

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value || null;           // '' ➜ null for “All / none”
    const cat = categories.find((c) => String(c._id) === id);
    setSelectedId(id ?? '');                     // update local UI
    onChange(id, cat);                           // notify parent
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}

      <div className="flex items-center gap-2">
        <select
          value={selectedId}
          onChange={handleSelect}
          disabled={disabled || isLoading || isError}
          className={[
            'w-full border border-gray-300 rounded px-3 py-2 bg-white',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500',
            disabled ? 'opacity-60 cursor-not-allowed' : '',
            className,
          ].join(' ')}
        >
          {/* placeholder option */}
          <option value="" disabled hidden>
            {isLoading ? 'Loading…' : placeholder}
          </option>

          {!isLoading &&
            categories.map((c) => (
              <option key={c._id} value={String(c._id)}>
                {c.name}
              </option>
            ))}
        </select>

        {/* retry button on error */}
        {isError && (
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-2 text-sm border border-gray-300 rounded"
          >
            Retry
          </button>
        )}
      </div>

      {!isLoading && !isError && categories.length === 0 && (
        <p className="mt-1 text-xs text-gray-500">No categories found.</p>
      )}
    </div>
  );
}

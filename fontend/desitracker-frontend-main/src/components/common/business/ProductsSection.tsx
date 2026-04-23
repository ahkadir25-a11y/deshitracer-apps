// /* eslint-disable @typescript-eslint/no-explicit-any */

// import React, { useEffect, useState } from 'react';
// import {
//   useGetProductsByUserAndBusinessQuery,
//   useGetProductsCategoryByUserAndBusinessQuery,
//   useGetProductsByCategoryQuery,
// } from '@/app/redux/services/products.services';
// import ProductCard from '@/components/ProductCard/ProductCard';
// import { setBusinessId } from '@/app/redux/cartSlice';
// import { useDispatch } from 'react-redux';

// /* ────────────────────────────────────────────
//  *  Props
//  * ──────────────────────────────────────────── */
// interface ProductsSectionProps {
//   userId: string;
//   businessId: string;
// }

// /* ────────────────────────────────────────────
//  *  Skeleton UI (lightweight, no extra deps)
//  * ──────────────────────────────────────────── */
// const CategoryPillSkeleton: React.FC = () => (
//   <li className="h-9 min-w-[90px] rounded-md bg-gray-200 animate-pulse" />
// );

// const ProductCardSkeleton: React.FC = () => (
//   <div className="rounded-lg border border-gray-200 overflow-hidden">
//     <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
//     <div className="p-3 space-y-2">
//       <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
//       <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
//       <div className="h-8 w-full bg-gray-200 rounded animate-pulse" />
//     </div>
//   </div>
// );

// const ProductsSection: React.FC<ProductsSectionProps> = ({ userId, businessId }) => {
//   /* ── LOCAL STATE ────────────────────────── */
//   const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

//   /* ── DATA FETCH ─────────────────────────── */
//   const {
//     data: allProducts,
//     isLoading: allLoading,
//     isFetching: allFetching,
//     error: allError,
//     refetch: refetchAll,
//   } = useGetProductsByUserAndBusinessQuery(
//     { user_id: userId, business_id: businessId },
//     { skip: !!activeCategoryId }
//   );

//   const {
//     data: categoryProducts,
//     isLoading: catProdLoading,
//     isFetching: catProdFetching,
//     error: catProdError,
//     refetch: refetchCategoryProducts,
//   } = useGetProductsByCategoryQuery(
//     {
//       categoryId: (activeCategoryId ?? '') as string,
//       user_id: userId,
//       business_id: businessId,
//     },
//     { skip: !activeCategoryId }
//   );

//   const {
//     data: categories,
//     isLoading: categoriesLoading,
//     isFetching: categoriesFetching,
//     error: categoriesError,
//     refetch: refetchCategories,
//   } = useGetProductsCategoryByUserAndBusinessQuery({
//     user_id: userId,
//     business_id: businessId,
//   });

//   /* ── SIDE-EFFECTS ───────────────────────── */
//   const dispatch = useDispatch();
//   useEffect(() => {
//     dispatch(setBusinessId(businessId));
//   }, [businessId, dispatch]);

//   /* ── AGGREGATED STATUS ──────────────────── */
//   const isLoading =
//     categoriesLoading ||
//     (activeCategoryId ? catProdLoading : allLoading) ||
//     categoriesFetching ||
//     (activeCategoryId ? catProdFetching : allFetching);

//   const loadError = categoriesError || (activeCategoryId ? catProdError : allError);

//   const productsToShow = activeCategoryId ? categoryProducts : allProducts;

//   const handleRetry = () => {
//     refetchCategories();
//     if (activeCategoryId) {
//       refetchCategoryProducts();
//     } else {
//       refetchAll();
//     }
//   };


//   /* ── EARLY STATES ───────────────────────── */
//   if (loadError) {
//     return (
//       <div className="py-10 p-4">
//         <div className="mx-auto max-w-3xl rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
//           <p className="font-semibold">Failed to load products or categories.</p>
//           <p className="mt-1 text-sm opacity-90">
//             Please check your connection and try again.
//           </p>
//           <button
//             onClick={handleRetry}
//             className="mt-3 inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
//           >
//             Try again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   /* ── RENDER ─────────────────────────────── */
//   return (
//     <div id="products-section" className="py-10 p-4">
//       {/* ========= CATEGORY LIST ========= */}
//       <section className="mb-8">
//         <div className="flex items-center justify-between gap-3 mb-4">
//           <h3 className="text-2xl font-semibold text-gray-800">Product Categories</h3>
//         </div>

//         {/* Loading skeleton for categories */}
//         {isLoading && (
//           <ul
//             aria-busy="true"
//             className="flex gap-3 overflow-x-auto pb-1"
//           >
//             {Array.from({ length: 8 }).map((_, i) => (
//               <CategoryPillSkeleton key={i} />
//             ))}
//           </ul>
//         )}

//         {/* Real categories */}
//         {!isLoading && (
//           <ul className="flex flex-wrap gap-3 overflow-x-auto pb-1">
//             {/* All-products pill */}
//             <li
//               key="all"
//               className={`px-4 py-2 rounded-md cursor-pointer transition shadow-sm ${!activeCategoryId
//                   ? 'bg-blue-600 text-white ring-1 ring-blue-500'
//                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                 }`}
//               onClick={() => setActiveCategoryId(null)}
//               role="button"
//               aria-pressed={!activeCategoryId}
//             >
//               All
//             </li>

//             {/* Real categories */}
//             {(categories ?? []).map((cat: any) => {
//               const id = cat?._id as string;
//               const selected = id === activeCategoryId;
//               return (
//                 <li
//                   key={id}
//                   className={`px-4 py-2 rounded-md cursor-pointer transition shadow-sm ${selected
//                       ? 'bg-blue-600 text-white ring-1 ring-blue-500'
//                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                     }`}
//                   onClick={() => setActiveCategoryId(selected ? null : id)}
//                   role="button"
//                   aria-pressed={selected}
//                   title={cat?.description ?? cat?.name}
//                 >
//                   <span className="font-medium">{cat?.name ?? 'Unnamed'}</span>
//                   {cat?.description && !selected && (
//                     <span className="ml-1 text-sm text-gray-500">– {cat.description}</span>
//                   )}
//                 </li>
//               );
//             })}
//           </ul>
//         )}
//       </section>

//       {/* ========= PRODUCTS GRID ========= */}
//       <section>
//         <h3 className="text-2xl font-semibold text-gray-800 mb-4">
//           {activeCategoryId ? 'Products in Category' : 'Our Products'}
//         </h3>

//         {/* Products skeleton grid */}
//         {isLoading && (
//           <div
//             aria-busy="true"
//             className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6"
//           >
//             {Array.from({ length: 12 }).map((_, i) => (
//               <ProductCardSkeleton key={i} />
//             ))}
//           </div>
//         )}

//         {/* Real products */}
//         {!isLoading && (
//           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
//             {productsToShow && productsToShow.length > 0 ? (
//               productsToShow.map((product: any) => (
//                 <ProductCard
//                   key={product._id}
//                   product={product}
//                   isAdmin={false}
//                   businessId={businessId}
//                 />
//               ))
//             ) : (
//               <div className="col-span-full">
//                 <div className="mx-auto max-w-xl rounded-md border border-gray-200 bg-white p-6 text-center">
//                   <p className="text-gray-800 font-medium">
//                     {activeCategoryId
//                       ? 'No products in this category.'
//                       : 'No products for this business.'}
//                   </p>
//                   {activeCategoryId && (
//                     <button
//                       onClick={() => setActiveCategoryId(null)}
//                       className="mt-3 inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black transition"
//                     >
//                       View all products
//                     </button>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </section>
//     </div>
//   );
// };

// export default ProductsSection;


/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import {
  useGetProductsByUserAndBusinessQuery,
  useGetProductsCategoryByUserAndBusinessQuery,
  useGetProductsByCategoryQuery,
} from '@/app/redux/services/products.services';
import ProductCard from '@/components/ProductCard/ProductCard';
import { setBusinessId } from '@/app/redux/cartSlice';
import { useDispatch } from 'react-redux';

interface ProductsSectionProps {
  userId: string;
  businessId: string;
}

/* ────────────────────────────────────────────
 * Skeletons (same idea, more polished)
 * ──────────────────────────────────────────── */
const CategoryPillSkeleton: React.FC = () => (
  <li className="h-10 w-[120px] shrink-0 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
);

const ProductCardSkeleton: React.FC = () => (
  <div className="group overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm">
    <div className="aspect-[4/3] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
    <div className="p-4 space-y-3">
      <div className="h-4 w-4/5 rounded bg-gray-200 animate-pulse" />
      <div className="h-3 w-2/5 rounded bg-gray-200 animate-pulse" />
      <div className="h-10 w-full rounded-xl bg-gray-200 animate-pulse" />
    </div>
  </div>
);

const ProductsSection: React.FC<ProductsSectionProps> = ({ userId, businessId }) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const {
    data: allProducts,
    isLoading: allLoading,
    isFetching: allFetching,
    error: allError,
    refetch: refetchAll,
  } = useGetProductsByUserAndBusinessQuery(
    { user_id: userId, business_id: businessId },
    { skip: !!activeCategoryId }
  );

  const {
    data: categoryProducts,
    isLoading: catProdLoading,
    isFetching: catProdFetching,
    error: catProdError,
    refetch: refetchCategoryProducts,
  } = useGetProductsByCategoryQuery(
    {
      categoryId: (activeCategoryId ?? '') as string,
      user_id: userId,
      business_id: businessId,
    },
    { skip: !activeCategoryId }
  );

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

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setBusinessId(businessId));
  }, [businessId, dispatch]);

  const isLoading =
    categoriesLoading ||
    (activeCategoryId ? catProdLoading : allLoading) ||
    categoriesFetching ||
    (activeCategoryId ? catProdFetching : allFetching);

  const loadError = categoriesError || (activeCategoryId ? catProdError : allError);
  const productsToShow = activeCategoryId ? categoryProducts : allProducts;

  const handleRetry = () => {
    refetchCategories();
    if (activeCategoryId) refetchCategoryProducts();
    else refetchAll();
  };

  /* ────────────────────────────────────────────
   * Error state (same behavior, nicer UI)
   * ──────────────────────────────────────────── */
  if (loadError) {
    return (
      <div className="py-12 px-4">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-b from-red-50 to-white shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="mt-1 grid h-10 w-10 place-items-center rounded-xl bg-red-100 text-red-700">
                {/* simple icon */}
                <span className="text-lg">!</span>
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-red-800">
                  Failed to load products or categories
                </p>
                <p className="mt-1 text-sm text-red-700/80">
                  Please check your connection and try again.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 active:bg-red-800 transition"
                  >
                    Try again
                  </button>

                  <button
                    onClick={() => setActiveCategoryId(null)}
                    className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 transition"
                  >
                    Reset filter
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-red-200 via-red-400 to-red-200" />
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────
   * Main UI (same functionality, upgraded design)
   * ──────────────────────────────────────────── */
  return (
    <div id="products-section" className="py-12 px-4">
      <div className="mx-auto space-y-10">
        {/* ========= HEADER / CATEGORIES ========= */}
        <section className="rounded-3xl border border-gray-200/70 bg-white/70 backdrop-blur shadow-sm">
          <div className="px-5 py-5 sm:px-7 sm:py-6 border-b border-gray-200/60">
            <div className="flex flex-col gap-1">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                Product Categories
              </h3>
              <p className="text-sm text-gray-600">
                Browse by category or view everything at once.
              </p>
            </div>
          </div>

          {/* Pills */}
          <div className="px-5 py-4 sm:px-7 sm:py-5">
            {isLoading ? (
              <ul aria-busy="true" className="flex flex-wrap gap-3  pb-2  ">
                {Array.from({ length: 8 }).map((_, i) => (
                  <CategoryPillSkeleton key={i} />
                ))}
              </ul>
            ) : (
              <ul className="flex gap-3 flex flex-wrap pb-2 ">
                {/* All */}
                <li
                  key="all"
                  role="button"
                  aria-pressed={!activeCategoryId}
                  onClick={() => setActiveCategoryId(null)}
                  className={[
                    'shrink-0 cursor-pointer select-none rounded-full px-4 py-2 text-sm font-semibold transition',
                    'border shadow-sm',
                    !activeCategoryId
                      ? 'border-blue-200 bg-blue-600 text-white shadow-blue-100'
                      : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50',
                  ].join(' ')}
                >
                  All
                </li>

                {(categories ?? []).map((cat: any) => {
                  const id = cat?._id as string;
                  const selected = id === activeCategoryId;

                  return (
                    <li
                      key={id}
                      role="button"
                      aria-pressed={selected}
                      title={cat?.description ?? cat?.name}
                      onClick={() => setActiveCategoryId(selected ? null : id)}
                      className={[
                        'shrink-0 cursor-pointer select-none rounded-full px-4 py-2 text-sm font-semibold transition',
                        'border shadow-sm',
                        selected
                          ? 'border-blue-200 bg-blue-600 text-white shadow-blue-100'
                          : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50',
                      ].join(' ')}
                    >
                      <span>{cat?.name ?? 'Unnamed'}</span>
                      {cat?.description && !selected && (
                        <span className="ml-2 text-xs font-medium text-gray-500">
                          • {cat.description}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {/* ========= PRODUCTS GRID ========= */}
        <section className="rounded-3xl border border-gray-200/70 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-5 sm:px-7 sm:py-6 border-b border-gray-200/60">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                  {activeCategoryId ? 'Products in Category' : 'Our Products'}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {activeCategoryId
                    ? 'Showing items from the selected category.'
                    : 'Showing all items available for this business.'}
                </p>
              </div>

              {activeCategoryId && (
                <button
                  onClick={() => setActiveCategoryId(null)}
                  className="hidden sm:inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>

          <div className="px-5 py-6 sm:px-7 sm:py-7">
            {isLoading ? (
              <div aria-busy="true" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                {productsToShow && productsToShow.length > 0 ? (
                  productsToShow.map((product: any) => (
                    <div key={product._id} className="transition hover:-translate-y-0.5 hover:shadow-md">
                      <ProductCard product={product} isAdmin={false} businessId={businessId} />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full">
                    <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-8 text-center">
                      <p className="text-lg font-semibold text-gray-900">
                        {activeCategoryId
                          ? 'No products found in this category.'
                          : 'No products found for this business.'}
                      </p>
                      <p className="mt-2 text-sm text-gray-600">
                        Try selecting a different category or come back later.
                      </p>

                      {activeCategoryId && (
                        <button
                          onClick={() => setActiveCategoryId(null)}
                          className="mt-5 inline-flex items-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-black transition"
                        >
                          View all products
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductsSection;

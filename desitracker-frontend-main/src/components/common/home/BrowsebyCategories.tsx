// "use client";

// import { useGetAllCategoriesQuery } from "@/app/redux/services/categories.services";
// import Link from "next/link";
// import React from "react";

// interface Category {
//   icon: string;
//   name: string;
//   slug: string;
// }

// const BrowseByCategories = () => {
//   const { data: categoryData } = useGetAllCategoriesQuery({
//     page: 1,
//     limit: 100,
//     sort: JSON.stringify({ sort: "name" }),
//   });

//   const sortedCategories = categoryData?.data?.slice()?.sort((a: Category, b: Category) =>
//     a.name.localeCompare(b.name)
//   );

//   if (!sortedCategories?.length) return null;

//   const loopedCategories = [...sortedCategories, ...sortedCategories]; // Doubled for seamless loop

//   return (
//     <section className="px-4 overflow-hidden relative md:max-w-6xl max-w-3xl">
//       <div className="marquee-wrapper">
//         <div className="marquee-content">
//           {loopedCategories.map((category, index) => (
//             <Link
//               href={`/business?category=${category?.slug}`}
//               key={`${category.slug}-${index}`}
//               className="category-item"
//             >
//               {category.name}
//             </Link>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default BrowseByCategories;


"use client";

import { useGetAllCategoriesQuery } from "@/app/redux/services/categories.services";
import Link from "next/link";
import React, { useRef, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

interface Category {
  icon: string;
  name: string;
  slug: string;
  _id: string;
}

const BrowseByCategories = () => {
  const { data: categoryData } = useGetAllCategoriesQuery({
    page: 1,
    limit: 2000,
  });

  const sortedCategories = categoryData?.data?.slice()?.sort((a: Category, b: Category) =>
    a.name.localeCompare(b.name)
  );

  const autoplay = useRef(
    Autoplay({
      delay: 1000,
      stopOnInteraction: false,
      stopOnMouseEnter: true, // ✅ This pauses on hover (what you want)
    })
  );



  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      skipSnaps: false,
      dragFree: false,
    },
    [autoplay.current]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!sortedCategories?.length) return null;

  return (
    <section className="relative md:max-w-6xl -z-10 max-w-3xl mx-auto">
      {/* Arrows */}
      <div className="flex items-center  md:w-full  mb-5 mt-3 md:max-w-4xl max-w-xl md:justify-between justify-start px-2  md:mr-auto gap-2">
        <button
          onClick={scrollPrev}
          className=" z-40 hover:bg-black  hover:border-black  border rounded-full md:w-8 w-7 md:h-8 h-7 shadow-md flex items-center justify-center  cursor-pointer"
        >
          <MdKeyboardArrowLeft />
        </button>
        <button
          onClick={scrollNext}
          className=" z-40 hover:bg-black hover:border-black border rounded-full md:w-8 w-7 md:h-8 h-7 shadow-md flex items-center justify-center cursor-pointer"
        >
          <MdKeyboardArrowRight />

        </button>
      </div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {sortedCategories.map((category: Category, index: number) => (
            <div
              key={`${category.slug}-${index}`}
              className="min-w-[180px] flex-shrink-0 px-2"
            >
              <Link
                href={`/business?category=${category._id}`}
                className="block bg-white hover:bg-black transition-all duration-300 px-4 py-2 font-semibold text-xs rounded-sm text-black hover:text-white text-center whitespace-nowrap"
              >
                {category.name}
              </Link>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};

export default BrowseByCategories;

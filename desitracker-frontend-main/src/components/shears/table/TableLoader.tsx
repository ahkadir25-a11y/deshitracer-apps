import React from "react";

const TableLoader = () => {
  return (
    <div className="w-full h-full flex flex-col gap-y-4 animate-pulse">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
        <div className="flex flex-wrap justify-start gap-3 w-full lg:w-auto">
          {/* Add Button */}
          <div className="h-10 w-full sm:w-32 bg-gray-200 rounded-md"></div>
          {/* Bulk Action */}
          <div className="h-10 w-full sm:w-32 bg-gray-200 rounded-md"></div>
        </div>

        <div className="flex flex-wrap justify-start lg:justify-end gap-2 w-full lg:w-auto">
          {/* Filter Buttons */}
          <div className="h-10 w-full sm:w-24 bg-gray-200 rounded-md"></div>
          <div className="h-10 w-full sm:w-24 bg-gray-200 rounded-md"></div>
          <div className="h-10 w-full sm:w-24 bg-gray-200 rounded-md"></div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1  rounded-lg overflow-x-auto">
        {/* Table Header */}
        <div className="bg-gray-50 -b min-w-[768px]">
          <div className="grid grid-cols-8 gap-4 px-4 py-3">
            <div className="h-6 w-6 bg-gray-200 rounded"></div>
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>

        {/* Table Body */}
        <div className="min-w-[768px]">
          {[...Array(5)].map((_, rowIndex) => (
            <div key={rowIndex} className="-b">
              <div className="grid grid-cols-8 gap-4 px-4 py-4">
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
                {[...Array(7)].map((_, colIndex) => (
                  <div key={colIndex} className="h-5 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="w-full p-2 sm: rounded flex flex-col sm:flex-row justify-between items-center gap-4 py-3">
        <div className="h-8 w-full sm:w-32 bg-gray-200 rounded"></div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="h-8 w-full sm:w-24 bg-gray-200 rounded"></div>
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 w-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableLoader;

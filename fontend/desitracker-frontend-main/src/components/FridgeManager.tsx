"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  useCreateFridgeMutation,
  useGetFridgesQuery,
} from "@/app/redux/services/fridge.service";
import { useAppSelector } from "@/app/redux/hoook";
import { skipToken } from "@reduxjs/toolkit/query";

const FridgeManager = () => {
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth) as { user?: { id: string } };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fridgeName, setFridgeName] = useState("");
  const [fridgeLocation, setFridgeLocation] = useState("");
  const [formError, setFormError] = useState("");

  const userId = user?.id;
  const { data: fridges = [], isLoading } =
    useGetFridgesQuery(userId ?? skipToken);

  const [createFridge, { isLoading: isCreating }] = useCreateFridgeMutation();

  const openModal = () => {
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError("");
    setFridgeName("");
    setFridgeLocation("");
  };

  const handleCreateFridge = async () => {
    setFormError("");
    if (!userId) return;
    if (!fridgeName.trim()) return setFormError("Fridge name is required.");
    if (!fridgeLocation.trim()) return setFormError("Fridge location is required.");

    try {
      await createFridge({
        userId: userId?.toString(),
        fridgeName: fridgeName.trim(),
        fridgeLocation: fridgeLocation.trim(),
      }).unwrap?.();

      closeModal();
    } catch {
      setFormError("Failed to create fridge. Please try again.");
    }
  };

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Fridge Management</h1>
          <p className="text-gray-500 mt-1">
            Create fridges and track temperature logs easily.
          </p>
        </div>

        <button
          onClick={openModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-sm hover:bg-blue-700"
        >
          + Add New Fridge
        </button>
      </div>

      {/* Fridges List */}
      {isLoading ? (
        <div className="text-gray-600">Loading...</div>
      ) : fridges.length === 0 ? (
        <div className="border rounded-sm p-6 bg-white">
          <h2 className="text-lg font-semibold">No fridges yet</h2>
          <p className="text-gray-500 mt-1">
            Create your first fridge to start adding temperature records.
          </p>
          <button
            onClick={openModal}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-sm hover:bg-blue-700"
          >
            Create First Fridge
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {fridges.map((fridge) => (
            <motion.div
              key={fridge._id}
              className="bg-white border rounded-sm p-5 shadow-sm hover:shadow-md cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => router.push(`/profile/fridge/${fridge._id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold">{fridge.fridgeName}</h3>
                  <p className="text-gray-500">{fridge.fridgeLocation}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/profile/fridge/${fridge._id}`);
                  }}
                  className="text-sm border px-3 py-1.5 rounded-sm hover:bg-gray-50"
                >
                  Open →
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Click to manage temperature records
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={closeModal}
            />

            {/* Modal */}
            <motion.div
              className="relative bg-white w-full max-w-md rounded-sm p-5 shadow-lg"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Add New Fridge</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Give it a name and location so you can find it quickly.
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  className="px-2 py-1 rounded-sm hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="mt-3 p-2 rounded-sm border bg-red-50 text-red-700 text-sm">
                  {formError}
                </div>
              )}

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Fridge Name</label>
                  <input
                    type="text"
                    className="mt-1 w-full border rounded-sm px-3 py-2"
                    placeholder="e.g., Main Kitchen"
                    value={fridgeName}
                    onChange={(e) => setFridgeName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Location</label>
                  <input
                    type="text"
                    className="mt-1 w-full border rounded-sm px-3 py-2"
                    placeholder="e.g., Restaurant floor 1"
                    value={fridgeLocation}
                    onChange={(e) => setFridgeLocation(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleCreateFridge}
                  disabled={isCreating}
                  className="w-full bg-blue-600 text-white py-2 rounded-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  {isCreating ? "Creating..." : "Create Fridge"}
                </button>

                <button
                  onClick={closeModal}
                  className="w-full border py-2 rounded-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FridgeManager;
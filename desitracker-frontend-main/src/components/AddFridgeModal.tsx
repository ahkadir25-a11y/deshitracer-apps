"use client"

import React, { useState } from "react";
import { useCreateFridgeMutation } from "@/app/redux/services/fridge.service";

const AddFridgeModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [fridgeName, setFridgeName] = useState("");
  const [fridgeLocation, setFridgeLocation] = useState("");

  const [createFridge] = useCreateFridgeMutation();

  const handleSubmit = async () => {
    if (fridgeName && fridgeLocation) {
      // Make the API call to create a fridge
      await createFridge({ userId: "userId", fridgeName, fridgeLocation });
      onClose(); // Close the modal after fridge is created
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-md max-w-lg w-full">
        <h3 className="text-2xl mb-4">Create a New Fridge</h3>
        <input
          type="text"
          placeholder="Fridge Name"
          value={fridgeName}
          onChange={(e) => setFridgeName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md mb-4"
        />
        <input
          type="text"
          placeholder="Fridge Location"
          value={fridgeLocation}
          onChange={(e) => setFridgeLocation(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md mb-6"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600"
        >
          Create Fridge
        </button>
        <button
          onClick={onClose}
          className="w-full mt-4 text-gray-500 p-3 rounded-md border border-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddFridgeModal;

"use client";

import React, { useState, FormEvent } from 'react';

const TrackingTagsForm = () => {
  // Set default values for GTM ID and Facebook Pixel ID
  const defaultGtmId = 'GTM-XXXXXX';  // Example default value for Google Tag Manager
  const defaultFacebookPixelId = '1234567890';  // Example default value for Facebook Pixel

  // Initialize state with default values
  const [gtmId, setGtmId] = useState<string>(defaultGtmId);
  const [facebookPixelId, setFacebookPixelId] = useState<string>(defaultFacebookPixelId);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log(gtmId, facebookPixelId);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Card container */}
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add Tracking Tags</h2>

        {/* Form container */}
        <form onSubmit={handleSubmit}>
          {/* Google Tag Manager */}
          <div className="mb-4">
            <label htmlFor="gtm" className="block text-sm font-medium text-gray-700">Google Tag Manager ID</label>
            <textarea
              id="gtm"
              name="gtm"
              value={gtmId}
              onChange={(e) => setGtmId(e.target.value)}
              placeholder="Enter GTM ID"
              className="mt-1 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-"
            />
          </div>

          {/* Facebook Pixel */}
          <div className="mb-4">
            <label htmlFor="facebook-pixel" className="block text-sm font-medium text-gray-700">Facebook Pixel ID</label>
            <textarea
              id="facebook-pixel"
              name="facebook-pixel"
              value={facebookPixelId}
              onChange={(e) => setFacebookPixelId(e.target.value)}
              placeholder="Enter Facebook Pixel ID"
              className="mt-1 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-[#222] focus:outline-none focus:ring-2 focus:ring-"
          >
            Save Tags
          </button>
        </form>
      </div>
    </div>
  );
};

export default TrackingTagsForm;

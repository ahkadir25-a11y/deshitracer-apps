import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

interface MediaItem {
  url: string;
  description: string;
  _id: string;
}

interface BusinessMediaGalleryProps {
  images?: MediaItem[];
  videos?: MediaItem[];
}

const BusinessMediaGallery: React.FC<BusinessMediaGalleryProps> = ({ images = [], videos = [] }) => {
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);

  if (!images.length && !videos.length) return null;

  return (
    <motion.div
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full max-w-5xl mx-auto space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Gallery</h2>
        {images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, i) => (
              <motion.div
                key={img._id}
                className="rounded-md overflow-hidden border cursor-pointer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedImage(img)}
              >
                <Image
                  src={img.url}
                  alt={img.description || `Image ${i + 1}`}
                  width={500}
                  height={300}
                  className="w-full h-48 object-cover"
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No images available.</p>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full p-4">
            <Image
              src={selectedImage.url}
              alt={selectedImage.description || "Selected image"}
              width={1200}
              height={800}
              className="w-full h-auto max-h-screen object-contain rounded-lg"
            />
            <button
              className="absolute top-4 right-4 text-white text-2xl font-bold"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BusinessMediaGallery;

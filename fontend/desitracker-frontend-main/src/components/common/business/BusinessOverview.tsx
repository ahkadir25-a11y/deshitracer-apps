/* eslint-disable @typescript-eslint/no-explicit-any */

import GroupCardSlider from "@/components/shears/slider/GroupCardSlider";
import BusinessMediaGallery from "./BusinessMediaGallery";


const BusinessOverview = ({ business }: { business: any }) => {
  return (
    <div className="w-full md:w-[70%] space-y-6">
      {/* Main card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
         {/* About section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            About <strong>{business?.businessName}</strong>
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed mt-2">
            {business.about}
          </p>
        </div>

        {/* Description */}
        {business?.description && (
          <p className="text-gray-600 text-sm leading-relaxed">
            {business.description}
          </p>
        )}

      

        {/* Video Preview */}
        {business?.media?.videos?.[0]?.url && (
          <video
            src={business.media.videos[0].url}
            className="w-full rounded-lg mt-4"
            controls
            muted
          />
        )}

        {/* Multiple Locations */}
        {business?.locations?.isMultipleLocation && (
          <div className="mt-6">
            <GroupCardSlider branches={business.locations.branches} />
          </div>
        )}
      </div>

      {/* Full Media Gallery */}
      {(business?.media?.images?.length > 0 || business?.media?.videos?.length > 1) && (
        <BusinessMediaGallery
          images={business.media.images}
          videos={business.media.videos.slice(1)} // skip the first if shown above
        />
      )}
    </div>
  );
};

export default BusinessOverview;

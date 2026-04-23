"use client";
import React from "react";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import { useGetSiteAnalyticsQuery } from "@/app/redux/services/siteAnylatics";

const StatsSection = () => {
  const { data, error, isLoading } = useGetSiteAnalyticsQuery();
  console.log(data);

  if (isLoading) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1 }}
        className="bg-gray-500 h-[50vh] flex justify-center text-black py-12"
      >
        <div className="flex justify-around items-center container mx-auto gap-12 flex-wrap">
          <div>Loading...</div>
        </div>
      </motion.section>
    );
  }

  if (error) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1 }}
        className="bg-gray-500 h-[50vh] flex justify-center text-black py-12"
      >
        <div className="flex justify-around items-center container mx-auto gap-12 flex-wrap">
          <div>Error loading stats</div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1 }}
      className="bg-gray-300 relative states_bg h-[60vh] flex justify-center text-white py-12"
    >
      <div className="flex justify-around text-black items-center container mx-auto gap-12 flex-wrap">
        <div className="text-center bg-[#222]  border-white border-2 hover:scale-110 transition-all duration-300 text-white md:w-48 w-32 flex items-center justify-center flex-col word-break md:h-48 h-32 rounded-full">
          <p className="md:text-5xl text-xl text-white font-normal">
            <CountUp
              start={0}
              end={data?.totalUserCount || 0} // Dynamic data for active users
              duration={2}
              suffix="+"
              enableScrollSpy
              scrollSpyDelay={100}
            />
          </p>
          <p className="md:text-md text-sm md:mt-5 mt-2">Active Users</p>
        </div>

        <div className="text-center bg-[#222]  border-white border-2 hover:scale-110 transition-all duration-300 text-white md:w-48 w-32 flex items-center justify-center flex-col word-break md:h-48 h-32 rounded-full">
          <p className="md:text-5xl text-xl text-white font-normal">
            <CountUp
              start={0}
              end={data?.totalBusinessCount || 0} // Dynamic data for total listings
              duration={2}
              suffix="+"
              enableScrollSpy
              scrollSpyDelay={100}
            />
          </p>
          <p className="md:text-md text-sm md:mt-5 mt-2">Total Listings</p>
        </div>

        <div className="text-center bg-[#222]  border-white border-2 hover:scale-110 transition-all duration-300 text-white md:w-48 w-32 flex items-center justify-center flex-col word-break md:h-48 h-32 rounded-full">
          <p className="md:text-5xl text-xl text-white font-normal">
            <CountUp
              start={0}
              end={data?.uniqueCountries || 0} // Dynamic data for cities covered (unique countries)
              duration={2}
              suffix="+"
              enableScrollSpy
              scrollSpyDelay={100}
            />
          </p>
          <p className="md:text-md text-sm md:mt-5 mt-2">Cities Covered</p>
        </div>

        <div className="text-center bg-[#222]  border-white border-2 hover:scale-110 transition-all duration-300 text-white md:w-48 w-32 flex items-center justify-center flex-col word-break md:h-48 h-32 rounded-full">
          <p className="md:text-5xl text-xl text-white font-normal">
            <CountUp
              start={0}
              end={data?.totalBusinessCount ?? 0}
              duration={2}
              scrollSpyDelay={100}
            />
          </p>
          <p className="md:text-md text-sm md:mt-5 mt-2">Active Businesses</p>
        </div>
        {/* <Image src={builds} alt="builds" className="absolute bottom-0 bg-repeat bg-contain w-full" width={400} height={400}/> */}
      </div>
    </motion.section>
  );
};

export default StatsSection;

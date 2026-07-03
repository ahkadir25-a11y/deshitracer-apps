import HeroBanner from "@/components/common/home/HeroBanner";
import StatsSection from "@/components/common/home/StatsSection";
import TopRatedBusinesses from "@/components/common/home/TopRatedBusinesses";
import WhatsAppFloatingButton from "./products/WhatsAppFloatingButton";

const Home = () => {
  return (
    <div className=" space-y-2 h-full">
      <HeroBanner />
      {/* <div className="md:hidden block">
        <HowItWorks />
      </div> */}
      {/* <BrowsebyCategories /> */}
      <div className=" h-full">
        <TopRatedBusinesses />
      </div>
      {/* <StatsSection /> */}
      <WhatsAppFloatingButton/>
    </div>
  );
};

export default Home;

import CommonUserRep from "@/components/common/CommonUserRep";
import Footer from "@/components/common/home/Footer";
import Navbar from "@/components/common/home/Navbar";

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <CommonUserRep>
      <Navbar />
      <main className="h-full ">{children}</main>
      <Footer />
    </CommonUserRep>
  );
};

export default CommonLayout;

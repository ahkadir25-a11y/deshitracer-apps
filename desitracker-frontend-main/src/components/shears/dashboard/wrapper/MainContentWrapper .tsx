// components/common/layout/MainContentWrapper.tsx


const MainContentWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <aside className="h-full flex-grow overflow-auto bg-[#fbfbfb] flex flex-col transition-all duration-500 ease-in-out">
      {/* <LayoutHeader /> */}
      <section className="h-full w-full overflow-y-auto px-5 py-4">
        {children}
      </section>
    </aside>
  );
};

export default MainContentWrapper;

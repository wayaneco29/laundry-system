import { SidebarContextProvider } from "@/app/context";
import Image from "next/image";

export default function GlobalNotFound() {
  return (
    <SidebarContextProvider>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-500px)] px-4">
        <div className="w-40 h-40 lg:w-80 lg:h-80 relative">
          <Image
            className=""
            src="/assets/images/under-construction.png"
            fill
            alt="Under Contruction Icon"
          />
        </div>
        <div className="text-gray-700 text-3xl md:text-4xl lg:text-6xl font-bold mt-4">
          Under Construction
        </div>
        <div className="text-gray-500 font-medium text-center px-4 xl:px-60 text-base xl:text-lg md:text-xl mt-4 xl:mt-10">
          This page is under construction, we are working very hard to give you
          the best experience. Thank you for understanding
        </div>
      </div>
    </SidebarContextProvider>
  );
}

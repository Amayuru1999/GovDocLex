import React from "react";
import footerback from "../../assets/images/footerback.png";

const FooterSection: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <footer className="bg-[#0a1117] text-white py-16 px-4  relative">
      <div className="max-w-[1920px] mx-auto flex flex-col md:justify-center">
        <div className="flex-1 flex justify-center">
          <div className="text-sm lg:text-lg flex gap-6 sm:gap-10 lg:gap-20 w-full justify-center sm:pb-4 lg:pb-6 z-50">
            <button 
              onClick={() => scrollToSection('home')} 
              className="hover:underline cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('about')} 
              className="hover:underline cursor-pointer"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('features')} 
              className="hover:underline cursor-pointer"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('explore')} 
              className="hover:underline cursor-pointer"
            >
              Explore
            </button>
            <button 
              onClick={() => scrollToSection('team')} 
              className="hover:underline cursor-pointer"
            >
              Team
            </button>
          </div>
        </div>

        <div className="w-full flex flex-col sm:flex-row sm:justify-between items-center mt-6 md:mt-0  md:text-lg ">
          <div className="md:w-full text-left mb-0 md:mb-0 text-sm ">
            Copyright {new Date().getFullYear()} |{" "}
            <a href="#" className="text-[#41B7FC] hover:underline">
              GocDoccLex
            </a>{" "}
            | All Rights Reserved
          </div>

          <div className="md:w-1/3 flex flex-col sm:flex-row md:justify-end justify-center items-center gap-6 text-sm mb-0 md:mt-0 mt-5 sm:mt-0">
            <a href="#" className="hover:underline">
              Terms & Conditions
            </a>
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
          </div>
        </div>

        <img
          src={footerback}
          alt="greenball"
          className="hidden sm:block absolute z-0 w-[400px] lg:w-[600px] xl:w-[1800px] 
             left-1/2 bottom-0 transform -translate-x-1/2    "
        />
      </div>
    </footer>
  );
};

export default FooterSection;

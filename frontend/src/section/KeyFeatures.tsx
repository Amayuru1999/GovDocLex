import React, { useEffect, useRef } from "react";
import KeyFeaturesCard from "../components/Cards/KeyFeaturesCard";
import iconimg from "../assets/images/icon.png";

import gsap from "gsap";

const KeyFeaturesSection: React.FC = () => {
  const textRef = useRef(null);

  useEffect(() => {
    gsap.to(textRef.current, {
      "--glow-pos": "100%",
      repeat: -1,
      duration: 3,
      ease: "linear",
      yoyo: true,
    });
  }, []);

  return (
    <section
      className="py-10  flex flex-col justify-center items-center   relative "
      // style={{
      //   background: 'radial-gradient(circle, black 0%, #065f46 50%, black 100%)',
      // }}
    >
      <div className="max-w-[1920px] mx-auto px-4  ">
        <button className="bg-[#1AD3FF1A] hover:opacity-80 text-[#1AD3FF] text-lg hover:font-medium font-gilroy font-semibold px-4 py-1.5 rounded-full hover:scale-105 transition-all duration-300 ease-in-out mb-4"
        data-aos="fade-down">
          Key Features
        </button>
        <h2
          ref={textRef}
          data-aos="fade-up"
          className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] to-[#FFFFFF]/50 text-4xl md:text-6xl font-semibold mb-6 "
          // className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] to-[#FFFFFF]/50 font-sfpro font-semibold text-4xl md:text-6xl px-4"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(0,255,255,0.2) 0%, rgba(255,255,255,1) var(--glow-pos, 0%), rgba(0,255,255,0.2) 100%)",
            backgroundSize: "200% 100%",
          }}
        >
          Beyond Extraction: Smart Analysis for <br />{" "}
          <span className="text-cyan-400">Legal Documents</span>
        </h2>



        <div className="  items-center  flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2  gap-10 p-4  ">
            <KeyFeaturesCard
              title="Automated Document Extraction"
              description="Precisely extracts structured data from unstructured government documents"
              icon={iconimg}
              dataAos="fade-down-right"
            />
            <KeyFeaturesCard
              title="AI-Powered Legal Reasoning"
              description="Uses advanced AI reasoning to interpret extracted legal content, drawing logical connections and insights to support informed decision-making"
              icon={iconimg}
              dataAos="fade-down-left"
            />
            <KeyFeaturesCard
              title="Sri Lanka-Optimized"
              description="Custom-trained on local government document structures"
              icon={iconimg}
              dataAos="fade-up-right"
            />
            <KeyFeaturesCard
              title="Interactive Knowledge Graph"
              description="Visualizes relationships between ministries, laws, and policies"
              icon={iconimg}
              dataAos="fade-up-left"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default KeyFeaturesSection;

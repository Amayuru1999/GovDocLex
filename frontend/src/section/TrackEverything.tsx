// src/components/FeatureHighlightSection.tsx
import { useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import whytheseimg from "../assets/images/search.gif";

import AOS from "aos";
import "aos/dist/aos.css";

const FeatureHighlightSection = () => {
  useEffect(() => {
    AOS.init({
      duration: 800, 
      once: false,   
      offset: 100,   
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    <section
      className="py-16 px-4 text-white flex flex-col justify-center items-center relative"
    >
      


      <div className="relative z-10 mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Left Column */}
        <div
          className="space-y-6"
          data-aos="fade-right"
          data-aos-delay="100"
        >
          <button
            className="bg-[#1AD3FF1A] text-[#1AD3FF] text-lg font-medium
                       px-4 py-1.5 rounded-full"
            data-aos="zoom-in"
            data-aos-delay="150"
          >
            Why These Matter
          </button>

          <h2
            className="text-4xl md:text-6xl font-bold leading-tight"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Track Everything, Anytime,
            <br />
            Anywhere
          </h2>

          <ul className="space-y-3 text-[#B3B8C5] text-lg">
            {[
              "Faster legal research",
              "Error-proof compliance tracking",
              "Transparent decision-making with AI explanations",
              "Future-ready system that scales with new document types",
            ].map((txt, i) => (
              <li
                key={txt}
                className="flex items-center gap-2"
                data-aos="fade-left"
                data-aos-delay={300 + i * 100}
              >
                <FaCheckCircle className="text-[#1AD3FF] shrink-0" />
                {txt}
              </li>
            ))}
          </ul>

          <button
            className="mt-6 bg-[#1AD3FF] hover:bg-[#0fcce6] text-[#0B0F14]
                       font-bold px-6 py-2.5 rounded-full transition duration-300"
            data-aos="zoom-in"
            data-aos-delay="700"
          >
            Explore GovDocxLen
          </button>
        </div>

        {/* Right Column */}
        <div
          className="flex justify-center"
          data-aos="fade-left"
          data-aos-delay="250"
        >
          <img
            src={whytheseimg}
            alt="Feature Illustration"
            className="rounded-2xl max-w-[300px] sm:w-full md:max-w-sm
                       hover:scale-105 hover:rotate-1 transition-transform duration-500"
          />
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlightSection;

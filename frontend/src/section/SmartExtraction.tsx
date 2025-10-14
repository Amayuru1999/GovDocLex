// src/components/GovDocLexFeatures.tsx
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import extractimg from "../assets/images/electricity-unscreen.gif";

type Feature = {
  title: string;
  description: React.ReactNode;
  icon: JSX.Element;
  glow: string;
};

const features: Feature[] = [
  {
    title: "Smart Extraction",
    description: (
      <>
        Uses LayoutLM and Mistral OCR to read scanned/textual documents while
        preserving their original layout (headings, tables).
        <br />
        Identifies key entities (ministries, laws, dates) via custom BERT
        models.
      </>
    ),
    icon: (
      <span className="inline-block w-6 h-6 bg-gradient-to-tr from-green-400 to-blue-500 rounded-full mr-2" />
    ),
    glow: "shadow-[0_0_25px_rgba(34,197,94,0.4)]",
  },
  {
    title: "Contextual Reasoning",
    description: "Provides AI-generated explanations for connections",
    icon: (
      <span className="inline-block w-6 h-6 bg-gradient-to-tr from-cyan-400 to-blue-400 rounded-full mr-2" />
    ),
    glow: "shadow-[0_0_25px_rgba(34,211,238,0.4)]",
  },
  {
    title: "Interactive Exploration",
    description: (
      <>
        Users query in natural language.
        <br />
        Results include visual graphs and cited sources for transparency.
      </>
    ),
    icon: (
      <span className="inline-block w-6 h-6 bg-gradient-to-tr from-blue-400 to-purple-400 rounded-full mr-2" />
    ),
    glow: "shadow-[0_0_25px_rgba(96,165,250,0.4)]",
  },
];

export default function GovDocLexFeatures() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: false, // set true if you want animation only once
    });
  }, []);

  const feature = features[0];

  return (
    <div className="bg-[radial-gradient(circle,_#1f2937_1px,_transparent_1px)] [background-size:20px_20px] bg-[#0b0f14] flex flex-col justify-center items-center px-5">
      <div className="text-white font-sans px-4 py-10 grid grid-cols-1 md:grid-cols-[30%_70%] mx-auto items-center max-w-[1920px] gap-5">
        {/* Left Feature Card */}
        <div
          className="w-full"
          data-aos="fade-right"
          data-aos-offset="200"
          data-aos-delay="100"
        >
          {feature && (
            <div
              key={feature.title}
              className={`flex-1 rounded-2xl p-6 h-full 
                bg-[#0E2324]/20 backdrop-blur-md ${feature.glow} 
                hover:shadow-[0_0_40px_rgba(9,204,244,0.5)] 
                transition-all duration-300 ease-in-out`}
            >
              <div className="flex items-center mb-3">
                {feature.icon}
                <span className="font-semibold text-2xl">{feature.title}</span>
              </div>

              <div className="text-gray-300 text-lg">{feature.description}</div>

              <div
                className="flex justify-center mt-4 max-w-xs items-center mx-auto cursor-pointer"
                data-aos="zoom-in"
                data-aos-delay="200"
              >
                <img
                  src={extractimg}
                  alt="Feature Illustration"
                  className="rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="h-full">
          {/* Top feature cards */}
          <div className="flex flex-col md:flex-row gap-6 mb-10 w-full">
            {features.slice(1).map((f, i) => (
              <div
                key={f.title}
                data-aos="fade-left"
                data-aos-delay={200 + i * 150}
                className={`flex-1 rounded-2xl p-6 
                  bg-[#0E2324]/20 backdrop-blur-md ${f.glow} 
                  hover:shadow-[0_0_40px_rgba(9,204,244,0.5)] 
                  transition-all duration-300 ease-in-out`}
              >
                <div className="flex items-center mb-3">
                  {f.icon}
                  <span className="font-semibold text-2xl">{f.title}</span>
                </div>
                <div className="text-gray-300 text-lg">{f.description}</div>
              </div>
            ))}
          </div>

          {/* Title Section */}
          <div
            className="mb-4"
            data-aos="fade-up"
            data-aos-delay="150"
            data-aos-offset="150"
          >
            <span className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-lg px-3 py-1 rounded-full mb-2">
              Our Features
            </span>
            <h2 className="text-3xl md:text-6xl font-bold text-white mb-2">
              Why <span className="text-cyan-400">GovDocLex?</span> It&apos;s
              Faster, Smarter and Stronger
            </h2>
          </div>

          {/* Bullet Points */}
          <div
            data-aos="fade-up"
            data-aos-delay="250"
            className="bg-[#0E2324]/20 backdrop-blur-md border border-white/20 
            rounded-2xl shadow-[0_0_25px_rgba(9,204,244,0.2)] p-6 w-full text-lg 
            transition-all duration-300 hover:shadow-[0_0_40px_rgba(9,204,244,0.4)]"
          >
            <ul className="list-disc list-inside space-y-2 text-gray-200">
              {[
                <>
                  <span className="font-bold text-cyan-400">
                    For Legal Professionals:
                  </span>{" "}
                  Trace policy evolution across decades of Gazettes in minutes.
                </>,
                <>
                  <span className="font-bold text-cyan-400">
                    For Government:
                  </span>{" "}
                  Audit regulatory compliance by mapping circulars to parent Acts.
                </>,
                <>
                  <span className="font-bold text-cyan-400">
                    For Researchers:
                  </span>{" "}
                  Discover hidden relationships between policies with AI-assisted
                  analysis.
                </>,
              ].map((node, i) => (
                <li key={i} data-aos="fade-right" data-aos-delay={200 + i * 100}>
                  {node}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Court from "../../assets/images/rotatingimg.png";
import Banner from "/assets/images/hero/hero-banner.png";
import AOS from "aos";
import "aos/dist/aos.css";

function Hero() {
  const textRef = useRef(null);

  useEffect(() => {
    AOS.init({ duration: 2000 });
  }, []);

  useEffect(() => {
    gsap.to("#rotating-element", {
      rotateY: 360,
      duration: 4,
      ease: "power1.inOut",
      repeat: -1,
    });
  }, []);

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
    <div>
      <div>
        <img
          src={Banner}
          alt="Banner"
          className="w-full h-[400px] rounded-3xl"
          data-aos="zoom-in"
        />
      </div>
      <div className="flex max-w-[1920px] mx-auto mt-10 md:mt-0">
        <div className="flex flex-col justify-center gap-3 lg:gap-4 lg:w-3/4">
          <h1
            ref={textRef}
            className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] to-[#FFFFFF]/50 font-sfpro font-semibold text-4xl md:text-6xl px-4"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(0,255,255,0.2) 0%, rgba(255,255,255,1) var(--glow-pos, 0%), rgba(0,255,255,0.2) 100%)",
              backgroundSize: "200% 100%",
            }}
            data-aos="fade-right"
            // data-aos-delay={800}
          >
            AI-Powered Extraction & Reasoning for <br />
            <span className="text-cyan-400">
              Sri Lankan Government Documents
            </span>
          </h1>
          <p
            className="text-white/80 font-sfpro text-sm lg:text-xl px-4"
            data-aos="fade-right"
          >
            Transform unstructured Gazettes, Acts, and Bills into searchable,
            explainable, and actionable knowledge.
          </p>
        </div>
        <div className="hidden sm:block" data-aos="fade-left">
          <div
            className="w-64 h-64 rounded-lg  mx-auto my-8
                 flex items-center justify-center
                 [transform-style:preserve-3d] [perspective:800px]"
            id="rotating-element"
          >
            <img src={Court} alt="court" className="w-[360px] hover:scale-105 transition-all duration-300 ease-in-out" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;

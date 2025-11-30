import { useEffect, useRef } from "react";
import greenball from "/assets/images/background/green_ball.png";
import gsap from "gsap";

function About() {
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
    <div className="py-4 xsm:p-6 sm:p-12 md:p-20 relative max-w-[1920px] mx-auto mt-10 md:mt-0">
      <img
        src={greenball}
        alt="greenball"
        className="hidden sm:block absolute z-0 bottom-20 xl:bottom-0 left-1/4 w-[400px] lg:w-[600px] xl:w-[800px] opacity-20"
      />
      {/* Dark themed container */}
      <div
        ref={textRef}
        className="relative z-10 p-6 sm:p-8 md:p-12 xl:p-24
                      bg-[#0E2324]/20 backdrop-blur-md border border-white/20 
                      rounded-3xl text-center flex flex-col items-center gap-4
                      hover:shadow-[0_4px_30px_rgba(0,0,0,0.1)] shadow-[0_0_25px_rgba(9,204,244,0.4)] transition-all duration-300 ease-in-out
                      "
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(0,255,255,0) 0%, rgba(0,255,255,0.3) var(--glow-pos, 0%), rgba(0,255,255,0) 100%)",
          backgroundSize: "200% 100%",
        }}
        data-aos="zoom-in"
      >
        {/* Label */}
        {/* <CommonLabel text={"What is GovDocLex"} /> */}

        {/* Heading */}
        <h1
          className="text-transparent bg-clip-text bg-gradient-to-r font-semibold
                       from-white to-white/70 font-sfpro text-4xl md:text-6xl"
        >
          Built for Innovators, Loved by Everyone
        </h1>

        {/* Description */}
        <p className="text-white/80 font-sfpro text-sm lg:text-xl max-w-3xl">
          GovDocLex is an AI-powered platform designed to extract, analyze, and
          explain complex information from Sri Lankan government documents—such
          as Gazettes, Acts, Bills, and Circulars—transforming them into
          structured, interconnected knowledge.
        </p>
      </div>
    </div>
  );
}

export default About;

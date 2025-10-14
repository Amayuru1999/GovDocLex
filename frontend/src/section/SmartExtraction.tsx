// src/components/GovDocLexFeatures.tsx
import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import extractimg from "../assets/images/smartextraction.png";

gsap.registerPlugin(ScrollTrigger);

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

const feature = features[0];

export default function GovDocLexFeatures() {
  // ---------- Strongly typed refs (no 'never[]') ----------
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const leftCardRef = useRef<HTMLDivElement | null>(null);
  const rightCardsRef = useRef<HTMLDivElement[]>([]);
  const pillRef = useRef<HTMLSpanElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const bulletsRef = useRef<HTMLLIElement[]>([]);
  const mainImgWrapRef = useRef<HTMLDivElement | null>(null);
  const mainImgRef = useRef<HTMLImageElement | null>(null);

  const setRightCardRef = (el: HTMLDivElement | null, i: number) => {
    if (el) rightCardsRef.current[i] = el;
  };
  const setBulletRef = (el: HTMLLIElement | null, i: number) => {
    if (el) bulletsRef.current[i] = el;
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // ---------------- No reduced motion ----------------
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Prevent initial flash when using .from
        gsap.set(
          [
            leftCardRef.current,
            ...rightCardsRef.current,
            pillRef.current,
            titleRef.current,
            ...bulletsRef.current,
          ],
          { autoAlpha: 1 }
        );

        // Left main card — slide from left (repeats on scroll)
        gsap.from(leftCardRef.current, {
          x: -60,
          autoAlpha: 0,
          duration: 0.7,
          ease: "power3.out",
          force3D: true,
          immediateRender: false,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play reverse play reverse",
          },
        });

        // Right cards — slide from right with stagger (repeats)
        gsap.from(rightCardsRef.current, {
          x: 60,
          autoAlpha: 0,
          duration: 0.6,
          ease: "power3.out",
          force3D: true,
          immediateRender: false,
          stagger: 0.12,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play reverse play reverse",
          },
        });

        // Pill + Title — fade/slide up
        gsap.from([pillRef.current, titleRef.current], {
          y: 20,
          autoAlpha: 0,
          duration: 0.5,
          ease: "power3.out",
          force3D: true,
          immediateRender: false,
          stagger: 0.08,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 72%",
            toggleActions: "play reverse play reverse",
          },
        });

        // Bullets — stagger from left
        gsap.from(bulletsRef.current, {
          x: -24,
          autoAlpha: 0,
          duration: 0.4,
          ease: "power3.out",
          force3D: true,
          immediateRender: false,
          stagger: 0.08,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 68%",
            toggleActions: "play reverse play reverse",
          },
        });

        // --------- Hover effects (GPU-only transforms) ---------
        const enterImg = () =>
          gsap.to(mainImgRef.current, {
            y: -8,
            x: 8,
            scale: 1.02,
            duration: 0.3,
            ease: "power3.out",
          });
        const leaveImg = () =>
          gsap.to(mainImgRef.current, {
            y: 0,
            x: 0,
            scale: 1,
            duration: 0.3,
            ease: "power3.out",
          });

        mainImgWrapRef.current?.addEventListener("mouseenter", enterImg);
        mainImgWrapRef.current?.addEventListener("mouseleave", leaveImg);

        // Card lift on hover (left + right cards)
        const addCardHover = (el: HTMLDivElement) => {
          const onEnter = () =>
            gsap.to(el, { y: -6, scale: 1.01, duration: 0.25, ease: "power3.out" });
          const onLeave = () =>
            gsap.to(el, { y: 0, scale: 1, duration: 0.25, ease: "power3.out" });
          el.addEventListener("mouseenter", onEnter);
          el.addEventListener("mouseleave", onLeave);
          // cleanup
          return () => {
            el.removeEventListener("mouseenter", onEnter);
            el.removeEventListener("mouseleave", onLeave);
          };
        };

        const cleanups: Array<() => void> = [
          ...(leftCardRef.current ? [addCardHover(leftCardRef.current)] : []),
          ...rightCardsRef.current.filter(Boolean).map((el) => addCardHover(el)),
        ];

        // Return a cleanup just for this media query branch
        return () => {
          mainImgWrapRef.current?.removeEventListener("mouseenter", enterImg);
          mainImgWrapRef.current?.removeEventListener("mouseleave", leaveImg);
          cleanups.forEach((fn) => fn && fn());
        };
      });

      // ---------------- Reduced motion ----------------
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            leftCardRef.current,
            ...rightCardsRef.current,
            pillRef.current,
            titleRef.current,
            ...bulletsRef.current,
            mainImgRef.current,
          ],
          { autoAlpha: 1, x: 0, y: 0, clearProps: "transform" }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="bg-[radial-gradient(circle,_#1f2937_1px,_transparent_1px)] [background-size:20px_20px] bg-[#0b0f14] flex flex-col justify-center items-center px-5">
      <div className="text-white font-sans px-4 py-10 grid grid-cols-1 md:grid-cols-[30%_70%] mx-auto items-center max-w-[1920px] gap-5">
        {/* Left Side Main Feature Card */}
        <div className="w-full">
          {feature && (
            <div
              ref={leftCardRef}
              key={feature.title}
              className={`flex-1 rounded-2xl p-6 h-full 
                bg-[#0E2324]/20  backdrop-blur-md 
                ${feature.glow} hover:shadow-[0_0_40px_rgba(9,204,244,0.5)]
                transition-all duration-300 ease-in-out will-change-transform`}
            >
              <div className="flex items-center mb-3">
                {feature.icon}
                <span className="font-semibold text-2xl">{feature.title}</span>
              </div>

              <div className="text-gray-300 text-lg">{feature.description}</div>

              <div ref={mainImgWrapRef} className="flex justify-center mt-4 will-change-transform">
                <img
                  ref={mainImgRef}
                  src={extractimg}
                  alt="Feature Illustration"
                  className="rounded-2xl w-full shadow-lg will-change-transform"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Side Content */}
        <div className="h-full">
          {/* Two Feature Cards */}
          <div className="flex flex-col md:flex-row gap-6 mb-10 w-full">
            {features.slice(1).map((f, i) => (
              <div
                ref={(el) => setRightCardRef(el, i)}
                key={f.title}
                className={`flex-1 rounded-2xl p-6 
                  bg-[#0E2324]/20  backdrop-blur-md ${f.glow} 
                  hover:shadow-[0_0_40px_rgba(9,204,244,0.5)]
                  transition-all duration-300 ease-in-out will-change-transform`}
              >
                <div className="flex items-center mb-3">
                  {f.icon}
                  <span className="font-semibold text-2xl">{f.title}</span>
                </div>
                <div className="text-gray-300 text-lg">{f.description}</div>
              </div>
            ))}
          </div>

          {/* Main Title Section */}
          <div className="mb-4">
            <span
              ref={pillRef}
              className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-lg px-3 py-1 rounded-full mb-2 will-change-transform"
            >
              Our Features
            </span>
            <h2
              ref={titleRef}
              className="text-3xl md:text-6xl font-bold text-white mb-2 will-change-transform"
            >
              Why <span className="text-cyan-400">GovDocLex?</span> It&apos;s
              Faster, Smarter and Stronger
            </h2>
          </div>

          {/* Bullet Points Section */}
          <div
            className="bg-[#0E2324]/20 backdrop-blur-md  border border-white/20 
            rounded-2xl shadow-[0_0_25px_rgba(9,204,244,0.2)] p-6 w-full text-lg transition-all duration-300 hover:shadow-[0_0_40px_rgba(9,204,244,0.4)]"
          >
            <ul className="list-disc list-inside space-y-2 text-gray-200">
              {[
                <>
                  <span className="font-bold text-cyan-400">For Legal Professionals:</span>{" "}
                  Trace policy evolution across decades of Gazettes in minutes.
                </>,
                <>
                  <span className="font-bold text-cyan-400">For Government:</span>{" "}
                  Audit regulatory compliance by mapping circulars to parent Acts.
                </>,
                <>
                  <span className="font-bold text-cyan-400">For Researchers:</span>{" "}
                  Discover hidden relationships between policies with AI-assisted analysis.
                </>,
              ].map((node, i) => (
                <li
                  key={i}
                  ref={(el) => setBulletRef(el, i)}
                  className="will-change-transform"
                >
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

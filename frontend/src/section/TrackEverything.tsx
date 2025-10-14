import { useLayoutEffect, useRef } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import whytheseimg from "../assets/images/search.gif";
import squareback from "../assets/images/squareback.png";

gsap.registerPlugin(ScrollTrigger);

const FeatureHighlightSection = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const badgeRef = useRef<HTMLButtonElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const listItemRefs = useRef<HTMLLIElement[]>([]);
  const ctaRef = useRef<HTMLButtonElement | null>(null);
  const rightImgRef = useRef<HTMLImageElement | null>(null);
  const rightWrapRef = useRef<HTMLDivElement | null>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);

  const setListItemRef = (el: HTMLLIElement | null, i: number) => {
    if (el) listItemRefs.current[i] = el;
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // initial states — LEFT column comes from left, RIGHT image from right
        gsap.set([badgeRef.current, titleRef.current, ...listItemRefs.current, ctaRef.current], {
          autoAlpha: 0,
          x: -40,
          willChange: "transform, opacity",
          force3D: true,
        });
        gsap.set(rightImgRef.current, { autoAlpha: 0, x: 40, willChange: "transform, opacity", force3D: true });

        // entrance timeline for the left column (from left)
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        });

        tl.to(badgeRef.current, { autoAlpha: 1, x: 0, duration: 0.35 })
          .to(titleRef.current, { autoAlpha: 1, x: 0, duration: 0.5 }, "-=0.1")
          .to(listItemRefs.current, { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.08 }, "-=0.2")
          .to(ctaRef.current, { autoAlpha: 1, x: 0, duration: 0.35 }, "-=0.15");

        // right image slide-in (from right)
        gsap.to(rightImgRef.current, {
          autoAlpha: 1,
          x: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
        });

        // parallax background
        gsap.to(bgImgRef.current, {
          yPercent: -12,
          ease: "none",
          force3D: true,
          scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: 0.4 },
        });

        // hover animations (GPU-only transforms)
        const enterImg = () =>
          gsap.to(rightImgRef.current, { x: 12, y: -12, scale: 1.02, rotation: 0.001, duration: 0.35, ease: "power3.out" });
        const leaveImg = () =>
          gsap.to(rightImgRef.current, { x: 0, y: 0, scale: 1, duration: 0.35, ease: "power3.out" });

        rightWrapRef.current?.addEventListener("mouseenter", enterImg);
        rightWrapRef.current?.addEventListener("mouseleave", leaveImg);

        const enterCTA = () =>
          gsap.to(ctaRef.current, { y: -3, scale: 1.03, duration: 0.25, ease: "power3.out" });
        const leaveCTA = () =>
          gsap.to(ctaRef.current, { y: 0, scale: 1, duration: 0.25, ease: "power3.out" });

        ctaRef.current?.addEventListener("mouseenter", enterCTA);
        ctaRef.current?.addEventListener("mouseleave", leaveCTA);

        return () => {
          rightWrapRef.current?.removeEventListener("mouseenter", enterImg);
          rightWrapRef.current?.removeEventListener("mouseleave", leaveImg);
          ctaRef.current?.removeEventListener("mouseenter", enterCTA);
          ctaRef.current?.removeEventListener("mouseleave", leaveCTA);
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([badgeRef.current, titleRef.current, ...listItemRefs.current, ctaRef.current, rightImgRef.current], {
          autoAlpha: 1,
          x: 0,
          y: 0,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-[radial-gradient(circle,_#1f2937_1px,_transparent_1px)] [background-size:20px_20px] bg-[#0b0f14] py-16 px-4 text-white flex flex-col justify-center items-center relative overflow-hidden"
    >
      {/* big background kept as-is */}
      <img
        ref={bgImgRef}
        src={squareback}
        alt="squareback"
        aria-hidden
        className="hidden sm:block absolute z-0 w-[400px] lg:w-[600px] xl:w-[1800px]
                   left-1/2 top-[72%] -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-60"
      />

      {/* no max-width clamp */}
      <div className="relative z-10 mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Left Content (slides in from left) */}
        <div className="space-y-6">
          <button
            ref={badgeRef}
            className="bg-[#1AD3FF1A] text-[#1AD3FF] text-lg font-medium px-4 py-1.5 rounded-full will-change-transform"
          >
            Why These Matter
          </button>

          <h2 ref={titleRef} className="text-4xl md:text-6xl font-bold leading-tight will-change-transform">
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
                ref={(el) => setListItemRef(el, i)}
                className="flex items-center gap-2 will-change-transform"
              >
                <FaCheckCircle className="text-[#1AD3FF] shrink-0" />
                {txt}
              </li>
            ))}
          </ul>

          <button
            ref={ctaRef}
            className="mt-6 bg-[#1AD3FF] hover:bg-[#0fcce6] text-[#0B0F14] font-bold px-6 py-2.5 rounded-full transition duration-300 will-change-transform"
          >
            Explore GovDocxLen
          </button>
        </div>

        {/* Right Image/Graphic (slides in from right, hovers) */}
        <div ref={rightWrapRef} className="flex justify-center ">
          <img
            ref={rightImgRef}
            src={whytheseimg}
            alt="Feature Illustration"
            className="rounded-2xl max-w-[300px] sm:w-full md:max-w-sm will-change-transform "
          />
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlightSection;

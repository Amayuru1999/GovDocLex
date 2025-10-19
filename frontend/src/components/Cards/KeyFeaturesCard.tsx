import gsap from "gsap";
import React, { useEffect, useRef } from "react";

interface KeyFeaturesCardProps {
  title: string;
  description: string;
  icon?: string | React.ReactNode;
  dataAos?: string;
}

const KeyFeaturesCard: React.FC<KeyFeaturesCardProps> = ({
  title,
  description,
  icon,
  dataAos,
}) => {
  const textRef = useRef<HTMLDivElement | null>(null);

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
    <div
      ref={textRef}
      data-aos={dataAos}
      className="relative w-full mx-auto p-6 min-h-52 rounded-2xl flex flex-col justify-center items-start border border-white/20
      bg-[#0E2324]/20 backdrop-blur-md hover:shadow-[0_0_40px_rgba(9,204,244,0.4)] 
      shadow-[0_0_25px_rgba(9,204,244,0.4)] hover:scale-110 transition-all duration-300 ease-in-out"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(0,255,255,0) 0%, rgba(0,255,255,0.3) var(--glow-pos, 0%), rgba(0,255,255,0) 100%)",
        backgroundSize: "200% 100%",
      }}
    >
      <div className="flex items-center mb-3 space-x-3">
        {icon &&
          (typeof icon === "string" ? (
            // <img src={icon} alt="icon" className="w-8 h-8" />
            <span className="inline-block w-6 h-6 bg-gradient-to-tr from-green-400 to-blue-500 rounded-full mr-2" />
          ) : (
            <span className="text-light-blue text-2xl">{icon}</span>
          ))}
        <h3 className="text-2xl font-semibold text-white drop-shadow-sm">
          {title}
        </h3>
      </div>

      <p className="text-lg text-gray-300">{description}</p>
    </div>
  );
};

export default KeyFeaturesCard;

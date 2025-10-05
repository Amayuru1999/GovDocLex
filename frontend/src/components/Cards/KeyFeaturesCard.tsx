
import React from "react";

interface KeyFeaturesCardProps {
  title: string;
  description: string;
  icon?: string | React.ReactNode;
}

const KeyFeaturesCard: React.FC<KeyFeaturesCardProps> = ({
  title,
  description,
  icon,
}) => {
  return (
    <div className="relative w-full mx-auto p-6 min-h-52 rounded-2xl flex flex-col justify-center items-start border border-white/20
      bg-[#0E2324]/20 backdrop-blur-md  shadow-[0_4px_30px_rgba(0,0,0,0.1)] 
      hover:shadow-[0_0_25px_rgba(9,204,244,0.4)] transition-all duration-300 ease-in-out">
      
      <div className="flex items-center mb-3 space-x-3">
        {icon &&
          (typeof icon === "string" ? (
            <img src={icon} alt="icon" className="w-8 h-8" />
          ) : (
            <span className="text-light-blue text-2xl">{icon}</span>
          ))}
        <h3 className="text-2xl font-semibold text-white drop-shadow-sm">{title}</h3>
      </div>

      <p className="text-lg text-gray-300">{description}</p>
    </div>
  );
};

export default KeyFeaturesCard;

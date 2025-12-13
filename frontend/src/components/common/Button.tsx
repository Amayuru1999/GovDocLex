import { useNavigate } from "react-router-dom";

interface CommonButtonProps {
  text: string;
  link: string;
}

const CommonButton = ({ text, link }: CommonButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(link);
  };

  return (
    <button
      onClick={handleClick}
      className="
        relative
        bg-gradient-to-r from-[#41B7FC] via-[#44B5FB] to-[#46F1FA]
        text-black font-gilroy font-semibold
        text-xs md:text-sm lg:text-base
        w-[130px] md:w-[175px]
        px-4 py-2 md:py-2.5
        rounded-2xl md:rounded-3xl
        border border-transparent
        overflow-hidden bg-clip-padding
        shadow-md
        transition-all duration-300 ease-in-out
        hover:text-[#0A1D33] hover:scale-105
        hover:from-[#78D1FD] hover:via-[#7DD9FE] hover:to-[#8AF9FA]
        focus:outline-none focus:ring-2 focus:ring-[#41B7FC] focus:ring-offset-2
        cursor-pointer
      "
    >
      {text}
    </button>
  );
};

export const StartedBtn = () => (
  <CommonButton text="Get Started" link="/signin" />
);
export const TryNowBtn = () => <CommonButton text="Try Now" link="/signin" />;

export default CommonButton;

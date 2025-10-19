import { teamData } from "@/constants/teamData.constants";
import TeamCard from "./TeamCard";
import box from "/assets/images/team/blue_box.webp";

interface CardPosition {
  top: string;
  left: string;
}

const cardPositions: CardPosition[] = [
  { top: "0%", left: "-30%" },
  { top: "35%", left: "-30%" },
  { top: "70%", left: "-30%" },
  { top: "0%", left: "90%" },
  { top: "35%", left: "90%" },
  { top: "70%", left: "90%" },
];

const profilePositions: CardPosition[] = [
  { top: "0%", left: "15%" },
  { top: "35%", left: "15%" },
  { top: "70%", left: "15%" },
  { top: "0%", left: "60%" },
  { top: "35%", left: "60%" },
  { top: "70%", left: "60%" },
];

function TeamBox() {
  return (
    <div className="relative py-6 flex items-center justify-center">
      {/* Background Image */}
      <img
        src={box}
        alt="box"
        className="sm:w-[350px] md:w-[400px] lg:w-[500px] object-cover"
      />

      {/* Cards */}
      {cardPositions.map((pos, index) => {
        const member = teamData[index];
        if (!member) return null;

        return (
          <div
            key={index}
            className="absolute hover:scale-105 transition-all duration-300 ease-in-out"
            style={{ top: pos.top, left: pos.left }}
          >
            <TeamCard name={member.name} description={member.description} />
          </div>
        );
      })}

      {profilePositions.map((pos, index) => {
        const member = teamData[index];
        if (!member || !member.profileImage) return null;

        return (
          <div
            key={`profile-${index}`}
            className="hidden sm:block absolute flex items-center justify-center"
            style={{ top: pos.top, left: pos.left }}
          >
            {/* Layered Fire Rings */}
            <div className="fire-ring-base"></div>
            <div className="fire-ring-mid"></div>
            <div className="fire-ring-inner"></div>

            {/* Profile Image */}
            <img
              src={member.profileImage}
              alt={`${member.name}-profile`}
              className="relative w-20 lg:w-28 h-20 lg:h-28 object-cover rounded-full border-2 border-white z-40 hover:scale-110 transition-all duration-300 ease-in-out hover:shadow-lg"
            />
          </div>
        );
      })}
    </div>
  );
}

export default TeamBox;

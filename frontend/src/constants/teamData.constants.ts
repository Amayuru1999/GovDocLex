export interface TeamMember {
  name: string;
  description: string;
  profileImage: string;
}

export const teamData: TeamMember[] = [
  {
      name: "Dr. Kushan Sudheera",
      description: "Supervisor",
      profileImage: "/assets/images/kushansir.jpg"
  },
  {
      name: "Dr. Vibhatha Abeykon",
      description: "Co-Supervisor",
      profileImage: "/assets/images/vibathasir.jpg"
  },
  {
      name: "Nisal De Zoysa",
      description: "AI & Software Engineer",
      profileImage: "/assets/images/nisal.jpg"
  },
  {
      name: "Amayuru Amarasinghe",
      description: "AI & Software Engineer",
      profileImage: "../assets/images/amauru.png"
  },
  {
      name: "Hiruna De Silva",
      description: "AI & Software Engineer",
      profileImage: "/assets/images/hiruna.jpg"
  },
  {
      name: "Kavindu Dilshan",
      description: "AI & Software Engineer",
      profileImage: "/assets/images/kavindur.jpg"
  },
];

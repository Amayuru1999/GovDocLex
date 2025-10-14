'use client';

import { useEffect, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import CommonLabel from '@/components/common/Label';
import greenball from '/assets/images/green_ball.png';
import TeamBox from '@/components/team/TeamBox';
import { TryNowBtn } from '@/components/common/Button';
import confetti from "canvas-confetti";

function Team() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const duration = 15 * 1000; // total confetti duration
    const animationEnd = Date.now() + duration;
    let skew = 1;

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    function frame() {
      const timeLeft = animationEnd - Date.now();
      const ticks = Math.max(200, 500 * (timeLeft / duration));
      skew = Math.max(0.8, skew - 0.001);

      // Add a low probability for confetti to appear (sparse effect)
      if (Math.random() < 0.2) { // 10% chance per frame
        confetti({
          particleCount: 1,
          startVelocity: 0,
          ticks,
          origin: {
            x: Math.random(),
            y: Math.random() * skew - 0.2,
          },
          colors: ["#ffffff"],
          shapes: ["circle"],
          gravity: randomInRange(0.4, 0.6),
          scalar: randomInRange(0.4, 1),
          drift: randomInRange(-0.4, 0.4),
        });
      }

      if (timeLeft > 0) {
        requestAnimationFrame(frame);
      }
    }

    frame();
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 1000, // default animation duration (ms)
      easing: 'ease-out-cubic',
      once: true, // whether animation should happen only once
    });
  }, []);

  return (
    <div
      ref={rootRef}
      className="py-4 xsm:p-6 sm:p-12 md:p-20 xl:p-24 relative max-w-[1920px] mx-auto bg-[radial-gradient(circle,#1f2937_1px,transparent_1px)] [background-size:20px_20px] bg-[#0b0f14]"
    >
      {/* Section Label */}
      <div data-aos="fade-down" className="flex justify-center">
        <CommonLabel text="Team" />
      </div>

      {/* Floating Green Ball */}
      <img
        src={greenball}
        alt="greenball"
        className="hidden sm:block absolute z-0 bottom-20 xl:bottom-0 left-1/4 w-[400px] lg:w-[600px] xl:w-[800px] will-change-transform pointer-events-none select-none"
        data-aos="zoom-in"
        data-aos-delay="200"
      />

      {/* Intro Card */}
      <div
        className="p-4 sm:p-6 bg-[#0E2324]/20 rounded-3xl text-center flex flex-col items-center gap-2 relative z-[1] backdrop-blur-[2px]"
        data-aos="fade-up"
        data-aos-delay="300"
      >
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] to-[#FFFFFF]/50 font-sfpro text-xl sm:text-2xl md:text-3xl lg:text-4xl">
          The Minds Behind GovDocLex
        </h1>
        <p className="text-white/80 font-sfpro text-xs sm:text-sm md:text-base max-w-2xl">
          A multidisciplinary team from the University of Ruhuna, combining AI expertise with legal domain knowledge
        </p>
      </div>

      {/* Team Grid */}
      <div className="flex justify-center relative z-[1]" data-aos="fade-up" data-aos-delay="400">
        <TeamBox />
      </div>

      {/* CTA Button */}
      <div className="justify-center flex relative z-[1]" data-aos="zoom-in" data-aos-delay="500">
        <TryNowBtn />
      </div>
    </div>
  );
}

export default Team;

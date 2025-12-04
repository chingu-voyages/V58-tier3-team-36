"use client";
import Image from "next/image";
import { useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Map, List, TrendingUp } from 'lucide-react';
gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const wrapper = document.querySelector("#heroWrapper");
      const img = document.querySelector("#heroImage");

      if (!wrapper || !img) return;

      ScrollTrigger.create({
        trigger: "#heroWrapper",
        start: "bottom center", // when bottom of wrapper hits center of viewport
        onEnter: () => {
          // Switch to row layout
          gsap.to(wrapper, {
            flexDirection: "row",
            gap: "3rem",
            duration: 0.5,
            ease: "power2.out",
          });
          // Shrink image
          gsap.to(img, {
            scale: 0.6,
            duration: 0.5,
            ease: "power2.out",
          });
        },
        onLeaveBack: () => {
          // Back to column layout
          gsap.to(wrapper, {
            flexDirection: "column",
            gap: "1.5rem",
            duration: 0.5,
            ease: "power2.out",
          });
          // Restore image size
          gsap.to(img, {
            scale: 1,
            duration: 0.5,
            ease: "power2.out",
          });
        },
      });
    });

    return () => mm.revert();
  }, []);

  const filters = [
    "Gender",
    "Role",
    "Role Type",
    "Voyage tier",
    "Voyage",
    "Year of Join",
  ];

  return (
    <section id="heroSection" className="min-h-screen text-center space-y-3.5">
      <div
        id="heroWrapper"
        className="flex flex-col lg:items-center items-center justify-center min-h-screen gap-6 px-6"
      >
        <div className="space-y-3 text-center lg:text-left">
          <h1 className="sm:text-5xl text-3xl font-bold text-[#079669]">
            Discover your Global Chingu Community!
          </h1>
          <h2 className="sm:text-3xl text-xl font-bold text-[#079669]/60">
            a global map of Chingu talent
          </h2>
          <h3 className="sm:text-2xl text-lg font-normal text-[#76808e]">
            See where Chingu lives, what they do and how they collaborate across
            timezones
          </h3>
        </div>

        <div className="pt-6 shrink-0">
          <Image
            id="heroImage"
            src="/images/globe.png"
            width={400}
            height={400}
            alt="globe"
            className="rounded-lg"
          />
        </div>
      </div>

      <div className="translate-y-10 flex gap-6 my-8 justify-center">
        <Link href='/map' className="px-8 py-4 bg-[#079669] text-white font-semibold rounded-full hover:bg-[#068055] transition shadow-lg cursor-pointer">
          View Map
        </Link>
        <Link href='/list' className="px-8 py-4 border-2 border-[#079669] text-[#079669] font-semibold rounded-full hover:bg-emerald-50 transition cursor-pointer">
          View List
        </Link>
      </div>

      <div className="p-6 space-y-16">
        <div className="space-y-4 place-items-center">
          <h1 className="text-4xl font-bold ">
            See your global community come to life.
          </h1>
          <h3 className="text-xl text-[#76808e]">
            Meet the Chingus who make up our global developer village.
            <br /> Explore where they live, what roles they play, and how
            diverse our community really is.
          </h3>
          <Image
            src={"/images/community.png"}
            width={400}
            height={400}
            alt="community"
            className="object-cover bg-white-500"
          />
        </div>

        <div className="space-y-4 place-items-center">
          <h1 className="text-4xl font-bold text-[#079669]">
            Understand the Chingu ecosystem at a glance!
          </h1>
          <h3 className="text-xl text-[#76808e]">
            Get a clear picture of the skills, tiers, and journeys of Chingus
            across the world, <br />
            from beginners to senior devs, designers, data scientists, and
            everyone in between.
          </h3>
          <Image
            src={"/images/logo.png"}
            width={200}
            height={200}
            className="animate-spin animation-duration-2000"
            alt="logo"
          />
        </div>
        <div className="space-y-4 place-items-center">
          <h1 className="text-4xl font-bold">Search smarter!</h1>
          <h3 className="text-xl text-[#76808e]">
            Use powerful filters to explore
          </h3>
          <div className="flex justify-around gap-3 flex-wrap">
            {filters.map((item, idx) => (
              <div key={idx} className="flex items-center gap-x-3">
                <span className="w-4 h-4 rounded-full bg-[#079669] relative"></span>{" "}
                <span className="font-semibold text-[#76808e]">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4 place-items-center">
          <h1 className="text-4xl font-bold text-[#079669]">Map and List</h1>
          <h3 className="text-xl text-[#76808e]">
            Switch between a geographic view and a detailed list view, <br /> in
            order to explore the data the way that makes sense for you.
          </h3>
          <div className="translate-y-10 flex gap-6 my-8 justify-center">
            <Link href='/map' className="px-8 py-4 bg-[#079669] text-white font-semibold rounded-full hover:bg-[#068055] transition shadow-lg cursor-pointer">
              View Map
            </Link>
            <Link href='/list' className="px-8 py-4 border-2 border-[#079669] text-[#079669] font-semibold rounded-full hover:bg-emerald-50 transition cursor-pointer rounded-full">
              View List
            </Link>
          </div>
        </div>
        <div className="space-y-4 place-items-center">
          <h1 className="text-4xl font-bold ">AI at Your Side</h1>
          <h3 className="text-xl text-[#76808e]">
            A built-in AI helper is ready to answer questions:
          </h3>
          <div>
            <div className="flex items-center gap-x-3">
              <span className="w-4 h-4 rounded-full bg-[#079669] relative"></span>{" "}
              <span className="font-semibold text-[#76808e]">
                Explain how filters work
              </span>
            </div>
            <div className="flex items-center gap-x-3">
              <span className="w-4 h-4 rounded-full bg-[#079669] relative"></span>{" "}
              <span className="font-semibold text-[#76808e]">
                Guide you through the app
              </span>
            </div>
            <div className="flex items-center gap-x-3">
              <span className="w-4 h-4 rounded-full bg-[#079669] relative"></span>{" "}
              <span className="font-semibold text-[#76808e]">
                Act as living documentation No manuals. No guessing. Just ask,
                and go.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

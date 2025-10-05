import React, { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import img1 from "../assets/images/safe.png"
import img2 from "../assets/images/link.png"
import img3 from "../assets/images/plan.png"

const slides = [
  {
    image: img2,
    title: "Get a link that you can share",
    description:
      "Click New meeting to get a link that you can send to people that you want to meet with.",
  },
  {
    image: img3,
    title: "Plan ahead and stay organized",
    description:
      "Schedule meetings in Google Calendar and send invites automatically to your team.",
  },
  {
    image: img1,
    title: "Your meeting is safe and secure",
    description:
      "No one can join a meeting unless invited or admitted by the host.",
  },
];

export default function WelcomeCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  const handleSlideChange = (swiper) => setActiveIndex(swiper.realIndex);

  const goToSlide = (index) => swiperRef.current?.swiper.slideToLoop(index);

  return (
    <div className="relative max-w-4xl mx-auto flex flex-col text-center items-center justify-center p-8">
      {/* Swiper Slides */}
      <Swiper
        ref={swiperRef}
        spaceBetween={50}
        slidesPerView={1}
        loop
        onSlideChange={handleSlideChange}
        className="w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide
            key={index}
            className="flex flex-col items-center text-center"
          >
            {/* Circular Image */}
            <div className="w-54 h-54 md:w-72 md:h-72 flex mx-auto items-center justify-center bg-blue-50 rounded-full mb-8">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            {/* Slide Text */}
            <h2 className="text-2xl sujoy1 md:text-4xl font-normal text-white mb-2">
              {slide.title}
            </h2>
            <p className="max-w-md mx-auto mt-2 sujoy2 text-gray-400">{slide.description}</p>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Arrows */}
      <button
        onClick={() => swiperRef.current.swiper.slidePrev()}
        className="absolute cursor-pointer left-0 md:left-38 top-1/3 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
      >
        <FiChevronLeft className="w-6 h-6 text-gray-600" />
      </button>

      <button
        onClick={() => swiperRef.current.swiper.slideNext()}
        className="absolute cursor-pointer right-0 md:right-38 top-1/3 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
      >
        <FiChevronRight className="w-6 h-6 text-gray-600" />
      </button>

      {/* Pagination Dots */}
      <div className="flex gap-2 mt-8">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              activeIndex === index
                ? "bg-blue-500"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

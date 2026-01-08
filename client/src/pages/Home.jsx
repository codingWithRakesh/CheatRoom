import React from "react";
import ContentDiv from "../components/ContentDiv";
import WelcomeCarousel from "../components/WelcomeCarousel";

const Home = () => {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between text-center items-center p-2 overflow-y-auto">
      
      <div className="w-full p-0">
      <div className="Heading-text flex flex-col mx-auto w-full md:w-2/3 text-center mt-28">
        <h2 className="text-white sujoy1 text-5xl">
          Your Secret Room — Chat Safely, Share Easily, and Stay Anonymous
        </h2>

        <p className="text-gray-300 sujoy2 w-full lg:w-2/3 mx-auto mt-6">
          Create a temporary room, invite friends, and chat without accounts.
          All messages and shared files are encrypted end-to-end. Use Gemini
          for helpful summaries, quick translations, and smart replies — 
          only you and your friend see the content.
        </p>
      </div>

      <div className="w-full h-full p-2 flex flex-col lg:flex-row gap-8 justify-center items-center mt-6">
        <ContentDiv alignment="left" />
        <ContentDiv alignment="right" />
      </div>


      <div className="p-2 w-full">
        <WelcomeCarousel />
      </div>
      </div>

      <footer className="w-full p-0 flex text-center items-center justify-center">
        <p className="sujoy2 text-gray-400">
          © 2026 <span className="text-orange-400 font-semibold">CheatRoom</span> — 
          Private, Encrypted, and Anonymous Chat.
        </p>
      </footer>
    </div>
  );
};

export default Home;

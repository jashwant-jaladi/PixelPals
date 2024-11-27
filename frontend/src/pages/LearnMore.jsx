import React from "react";
import GroupIcon from "@mui/icons-material/Group";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ExploreIcon from "@mui/icons-material/Explore";

const LearnMore = () => {
  return (
    <div className="bg-[url('/public/pixel-bg.jpg')] h-full bg-cover flex flex-col items-center p-10">
      {/* Hero Section */}
      <div className="text-center  py-10">
        <h1 className="text-5xl font-bold mb-5">Discover PixelPals</h1>
        <p className="text-lg max-w-3xl mx-auto leading-relaxed">
          Your digital playground to connect, share, and grow. Meet new people, rediscover old friendships, and bond over shared experiences.
        </p>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-6xl mt-10">
        <h2 className="text-3xl text-pink-700 font-bold text-center mb-8">
          Why Choose PixelPals?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <div className="p-6 rounded-lg glasseffect flex flex-col justify-center">
            <GroupIcon style={{ fontSize: 50, color: "#FF91A4" }} className="mx-auto mb-4" />
            <h3 className="text-xl font-bold text-pink-700 text-center mb-3">
              Seamless Connections
            </h3>
            <p className="text-center font-bold">
              Find and connect with like-minded individuals from around the globe in just a few taps.
            </p>
          </div>
          {/* Feature Card 2 */}
          <div className="p-6 rounded-lg glasseffect flex flex-col justify-center">
            <CameraAltIcon style={{ fontSize: 50, color: "#FF91A4" }} className="mx-auto mb-4" />
            <h3 className="text-xl font-bold text-pink-700 text-center mb-3">
              Share Moments
            </h3>
            <p className="text-center font-bold">
              Upload photos, stories, and memories that matter the most to you and your circle.
            </p>
          </div>
          {/* Feature Card 3 */}
          <div className="p-6 rounded-lg glasseffect flex flex-col justify-center">
            <ExploreIcon style={{ fontSize: 50, color: "#FF91A4" }} className="mx-auto mb-4" />
            <h3 className="text-xl font-bold text-pink-700 text-center mb-3">
              Discover New Interests
            </h3>
            <p className="text-center font-bold">
              Explore trending topics, join communities, and dive into content you love.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="text-center mt-16">
        <h2 className="text-4xl font-bold  mb-5">Ready to Join?</h2>
        <p className="text-lg  mb-8">
          Sign up today and be part of the growing PixelPals community.
        </p>
        <div className="flex justify-center">
          <button  className="p-3 pl-7 pr-7 border-2 border-pink-700 rounded-md glass  font-bold hover:bg-pink-700 hover:text-white transition duration-300 mx-3">
            Sign Up
          </button>
          <button className="p-3 pl-7 pr-7 border-2 border-pink-700 rounded-md glass  font-bold hover:bg-pink-700 hover:text-white transition duration-300 mx-3">
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearnMore;

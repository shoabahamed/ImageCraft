import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <div className="flex flex-col h-screen w-screen">
      <Navbar />
      <div className="flex flex-grow flex-col justify-center items-center text-center px-6 md:px-12 lg:px-24">
        <h2 className="text-4xl font-bold mb-4">StyleForge</h2>
        <p className="text-sm font-thin mb-2 italic text-slate-400">
          Forge your creativity. One pixel at a time.
        </p>
        <p className="text-xm leading-relaxed font-light mb-6 max-w-2xl">
          StyleForge brings the power of AI to your fingertips. Edit, enhance,
          stylize, and generate stunning visuals with ease. Whether you're
          refining a photo, creating breathtaking artwork, or exploring new
          styles, StyleForge empowers you to bring your vision to life.
          Seamlessly integrate powerful tools to unlock unlimited possibilities.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button className="px-6 py-3">Start Editing</Button>
          <Button className="px-6 py-3">Load Saved</Button>
        </div>
      </div>
    </div>
  );
};

export default Home;

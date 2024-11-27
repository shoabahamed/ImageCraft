import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ModeToggle } from "./ui/mode-toggle";

const Navbar = () => {
  return (
    <nav className="w-full pt-3">
      <div className="flex items-center justify-between mx-3 border-b-2 border-slate-300 pb-3">
        <div className="flex items-center space-x-2">
          <p className="text-3xl font-bold italic">StyleForge</p>
        </div>
        <div className="flex gap-5">
          <Link to="/authpage">
            <Button className="w-28">SignUp</Button>
          </Link>
          <Link to="authpage">
            <Button className="w-28">LogIn</Button>
          </Link>

          <ModeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

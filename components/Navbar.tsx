
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md py-4 px-6">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo Placeholder */}
        <div className="text-xl font-bold">
          <Link href="/">
            <Image
              src="/BDC_logo.svg"
              alt="Bergenfield Dominoes Tournament Logo"
              width={90} // Adjust width as needed
              height={50} // Adjust height as needed
            />
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex space-x-4">
          <Link href="/tournament" className="hover:text-blue-500">
            Tournament
          </Link>
          <Link href="/login" className="hover:text-blue-500">
            Login
          </Link>
          <Link href="/register" className="hover:text-blue-500">
            Registration
          </Link>
          <Link href="/dashboard" className="hover:text-blue-500">
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
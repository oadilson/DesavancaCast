import React from 'react';
import { Podcast } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Footer: React.FC = () => {
  return (
    <footer className="bg-podcast-black text-podcast-gray border-t border-podcast-border w-full">
      <div className="flex flex-col md:flex-row justify-between items-center px-4 sm:px-6 lg:px-8 py-4">
        {/* Left Section */}
        <div className="w-full md:flex-1 md:flex md:justify-start mb-4 md:mb-0">
          <Link to="/premium">
            <Button className="bg-podcast-green text-podcast-black hover:bg-opacity-90 rounded-lg w-full md:w-auto">
              <Podcast className="mr-2 h-5 w-5" />
              Assinar Premium
            </Button>
          </Link>
        </div>

        {/* Center Section */}
        <div className="w-full md:flex-1 flex justify-center items-center mb-4 md:mb-0">
          <Podcast className="h-6 w-6 text-podcast-green mr-2" />
          <p className="text-sm font-semibold text-podcast-white">
            DesavançaCast
          </p>
        </div>

        {/* Right Section */}
        <div className="w-full md:flex-1 text-center md:text-right">
          <p className="text-xs">
            DesavançaCast © • {new Date().getFullYear()} • Todos os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
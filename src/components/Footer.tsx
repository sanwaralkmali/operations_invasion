import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-4 px-6 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 md:mb-0">
          © {new Date().getFullYear()} Integer Invasion - Educational Math Game
        </div>
        <div className="flex space-x-4">
          <a 
            href="#" 
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            About
          </a>
          <a 
            href="#" 
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Privacy
          </a>
          <a 
            href="#" 
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
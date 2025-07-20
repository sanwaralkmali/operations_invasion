import { Github, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center">
      <div className="flex justify-center space-x-4">
        <a
          href="https://github.com/sanwaralkmali/operations_invasion"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github className="w-6 h-6" />
        </a>
        <a
          href="https://www.linkedin.com/in/sanwaralkmali/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Linkedin className="w-6 h-6" />
        </a>
      </div>
      <p className="mt-2">
        © {new Date().getFullYear()} Sanwar Alkmali. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;

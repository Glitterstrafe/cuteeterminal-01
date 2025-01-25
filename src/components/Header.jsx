import { Heart, Terminal } from 'lucide-react';
import { useEffect, useState } from 'react';

const Header = () => {
  const [typingEffect, setTypingEffect] = useState('');

  useEffect(() => {
    const text = "_cuteeterminal_";
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setTypingEffect((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <h1 className="text-4xl font-bold mb-6 text-primary text-glow flex items-center justify-center">
      <Heart className="mr-2 text-pink-500" />
      <Terminal className="mr-2" />
      {typingEffect}<span className="animate-pulse">_</span>
      <Heart className="ml-2 text-pink-500" />
    </h1>
  );
};

export default Header;
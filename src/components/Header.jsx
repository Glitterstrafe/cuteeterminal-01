import { Heart, Terminal } from 'lucide-react';
import { useEffect, useState } from 'react';

const Header = () => {
  const [typingEffect, setTypingEffect] = useState('');
  const text = "Cuteeterminal";

  useEffect(() => {
    let currentIndex = 0;
    let typingInterval;

    const typeText = () => {
      if (currentIndex < text.length) {
        setTypingEffect(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    };

    typingInterval = setInterval(typeText, 100);

    return () => {
      clearInterval(typingInterval);
    };
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
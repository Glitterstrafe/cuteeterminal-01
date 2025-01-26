import { Heart, Terminal } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

const Header = () => {
  const [typingEffect, setTypingEffect] = useState('');
  const text = "_cuteeterminal_";

  const typeText = useCallback(() => {
    let currentIndex = 0;
    setTypingEffect(''); // Reset the text

    const typingInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setTypingEffect(prev => prev + text.charAt(currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, []);

  useEffect(() => {
    const cleanup = typeText();
    return cleanup;
  }, []); // Only run once on mount

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
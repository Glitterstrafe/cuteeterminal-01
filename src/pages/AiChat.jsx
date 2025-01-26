import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MatrixBackground from '@/components/MatrixBackground';

const AiChat = () => {
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    gemini: '',
    deepseek: ''
  });
  
  const [connectedApis, setConnectedApis] = useState({
    openai: false,
    gemini: false,
    deepseek: false
  });

  const handleConnect = (provider) => {
    if (apiKeys[provider].trim()) {
      setConnectedApis(prev => ({ ...prev, [provider]: true }));
      toast.success(`Connected to ${provider.charAt(0).toUpperCase() + provider.slice(1)} API`);
    }
  };

  const handleRemove = (provider) => {
    setApiKeys(prev => ({ ...prev, [provider]: '' }));
    setConnectedApis(prev => ({ ...prev, [provider]: false }));
    toast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API key removed`, {
      description: "The API key has been removed from the application."
    });
  };

  const FloatingHearts = () => (
    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
      {[...Array(3)].map((_, i) => (
        <Heart
          key={i}
          className={`absolute h-4 w-4 text-pink-500 animate-[float_${1 + i * 0.5}s_ease-in-out_infinite]`}
          style={{
            left: `${i * 20 - 20}px`,
            animation: `float ${1 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`
          }}
        />
      ))}
    </div>
  );

  const ApiKeyInput = ({ provider }) => (
    <div className="relative flex items-center gap-2 mb-4">
      <div className="flex-grow relative">
        {connectedApis[provider] && <FloatingHearts />}
        <Input
          type="password"
          placeholder={`Enter ${provider.charAt(0).toUpperCase() + provider.slice(1)} API Key`}
          value={apiKeys[provider]}
          onChange={(e) => setApiKeys(prev => ({ ...prev, [provider]: e.target.value }))}
          className="pr-24"
        />
      </div>
      {apiKeys[provider] ? (
        connectedApis[provider] ? (
          <Button 
            variant="destructive"
            onClick={() => handleRemove(provider)}
          >
            Remove
          </Button>
        ) : (
          <Button 
            onClick={() => handleConnect(provider)}
          >
            Connect
          </Button>
        )
      ) : null}
    </div>
  );

  return (
    <div className="container mx-auto p-4 min-h-screen bg-background/80 relative">
      <MatrixBackground />
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center mb-8">AI Chat</h1>
        
        <div className="space-y-6 bg-background/95 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Connect Your AI Providers</h2>
          <ApiKeyInput provider="openai" />
          <ApiKeyInput provider="gemini" />
          <ApiKeyInput provider="deepseek" />
        </div>

        {/* Chat interface will be implemented in the next iteration */}
        <div className="bg-background/95 p-6 rounded-lg shadow-lg">
          <p className="text-center text-muted-foreground">
            Connect an AI provider to start chatting!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
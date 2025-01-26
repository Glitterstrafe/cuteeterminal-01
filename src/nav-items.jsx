import { Newspaper, MessageSquare } from "lucide-react";
import Index from "./pages/Index.jsx";
import AiChat from "./pages/AiChat.jsx";

export const navItems = [
  {
    title: "Hacker News",
    to: "/",
    icon: <Newspaper className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "AI Chat",
    to: "/ai-chat",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <AiChat />,
  },
];
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Book, Github } from 'lucide-react';

const ContentCard = ({ item, type }) => {
  const getCardContent = () => {
    switch (type) {
      case 'hackernews':
        return (
          <>
            <CardTitle className="text-lg text-primary group-hover:text-pink-500 transition-colors duration-300">
              {item.title}
            </CardTitle>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">Upvotes: {item.points}</p>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-primary text-primary hover:bg-pink-500 hover:text-black hover:border-pink-500 transition-colors duration-300"
              >
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  Read More <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </>
        );
      case 'arxiv':
        return (
          <>
            <CardTitle className="text-lg text-primary group-hover:text-pink-500 transition-colors duration-300">
              {item.title}
            </CardTitle>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{item.summary}</p>
              <p className="text-xs text-muted-foreground mb-2">
                Published: {new Date(item.published).toLocaleDateString()}
              </p>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-primary text-primary hover:bg-pink-500 hover:text-black hover:border-pink-500 transition-colors duration-300"
              >
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  Read Paper <Book className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </>
        );
      case 'github':
        return (
          <>
            <CardTitle className="text-lg text-primary group-hover:text-pink-500 transition-colors duration-300">
              {item.name}
            </CardTitle>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
              <p className="text-xs text-muted-foreground mb-2">⭐ {item.stargazers_count.toLocaleString()}</p>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-primary text-primary hover:bg-pink-500 hover:text-black hover:border-pink-500 transition-colors duration-300"
              >
                <a href={item.html_url} target="_blank" rel="noopener noreferrer">
                  View Repository <Github className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </>
        );
      case 'huggingface':
        return (
          <>
            <CardTitle className="text-lg text-primary group-hover:text-pink-500 transition-colors duration-300">
              {item.modelId}
            </CardTitle>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {item.description || "No description available"}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                Downloads: {item.downloads?.toLocaleString() || "N/A"}
              </p>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-primary text-primary hover:bg-pink-500 hover:text-black hover:border-pink-500 transition-colors duration-300"
              >
                <a href={`https://huggingface.co/${item.modelId}`} target="_blank" rel="noopener noreferrer">
                  View Model <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="bg-card/90 border-primary hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 ease-in-out backdrop-blur-sm group">
      <CardHeader>
        {getCardContent()}
      </CardHeader>
    </Card>
  );
};

export default ContentCard;
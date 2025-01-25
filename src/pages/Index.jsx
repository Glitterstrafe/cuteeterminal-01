import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Terminal, Book, Heart, Github } from 'lucide-react';
import MatrixBackground from '@/components/MatrixBackground';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const fetchTopStories = async () => {
  const response = await fetch('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=100');
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};

const fetchArxivPapers = async () => {
  const response = await fetch('https://export.arxiv.org/api/query?search_query=all:physics&sortBy=lastUpdatedDate&sortOrder=descending&max_results=100');
  if (!response.ok) throw new Error('Network response was not ok');
  const text = await response.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, "text/xml");
  const entries = xmlDoc.getElementsByTagName("entry");
  
  return Array.from(entries).map(entry => ({
    title: entry.getElementsByTagName("title")[0]?.textContent || "",
    link: entry.getElementsByTagName("id")[0]?.textContent || "",
    summary: entry.getElementsByTagName("summary")[0]?.textContent || "",
    published: entry.getElementsByTagName("published")[0]?.textContent || "",
  }));
};

const fetchGithubRepos = async () => {
  const response = await fetch('https://api.github.com/search/repositories?q=stars:>1&sort=stars&order=desc&per_page=100');
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};

const fetchHuggingFacePosts = async () => {
  const response = await fetch('https://huggingface.co/api/models?sort=downloads&direction=-1&limit=100');
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typingEffect, setTypingEffect] = useState('');
  const [activeTab, setActiveTab] = useState('hackernews');

  const { data: hnData, isLoading: hnLoading, error: hnError } = useQuery({
    queryKey: ['topStories'],
    queryFn: fetchTopStories,
  });

  const { data: arxivData, isLoading: arxivLoading, error: arxivError } = useQuery({
    queryKey: ['arxivPapers'],
    queryFn: fetchArxivPapers,
  });

  const { data: githubData, isLoading: githubLoading, error: githubError } = useQuery({
    queryKey: ['githubRepos'],
    queryFn: fetchGithubRepos,
  });

  const { data: huggingfaceData, isLoading: huggingfaceLoading, error: huggingfaceError } = useQuery({
    queryKey: ['huggingfacePosts'],
    queryFn: fetchHuggingFacePosts,
  });

  const filteredStories = hnData?.hits?.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredPapers = arxivData?.filter(paper =>
    paper.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredRepos = githubData?.items?.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredModels = huggingfaceData?.filter(model =>
    model.modelId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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

  const renderSkeletonCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(9)].map((_, index) => (
        <Card key={index} className="animate-pulse bg-card">
          <CardHeader>
            <div className="h-6 bg-secondary rounded w-3/4"></div>
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-secondary rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-secondary rounded w-1/2"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <div className="container mx-auto p-4 bg-background/80 relative z-10 min-h-screen">
        <MatrixBackground />
        <h1 className="text-4xl font-bold mb-6 text-primary text-glow flex items-center justify-center">
          <Heart className="mr-2 text-pink-500" />
          <Terminal className="mr-2" />
          {typingEffect}<span className="animate-pulse">_</span>
          <Heart className="ml-2 text-pink-500" />
        </h1>

        <Input
          type="text"
          placeholder="Search across all platforms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 bg-input text-primary border-primary"
        />

        <Tabs defaultValue="hackernews" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hackernews">Hacker News</TabsTrigger>
            <TabsTrigger value="arxiv">Arxiv Papers</TabsTrigger>
            <TabsTrigger value="github">GitHub</TabsTrigger>
            <TabsTrigger value="huggingface">HuggingFace</TabsTrigger>
          </TabsList>

          <TabsContent value="hackernews">
            {hnLoading && renderSkeletonCards()}
            {hnError && <p className="text-destructive">Error: {hnError.message}</p>}
            {!hnLoading && !hnError && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStories.map((story) => (
                  <Card key={story.objectID} className="bg-card/90 border-primary hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 ease-in-out backdrop-blur-sm group">
                    <CardHeader>
                      <CardTitle className="text-lg text-primary group-hover:text-pink-500 transition-colors duration-300">{story.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">Upvotes: {story.points}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-primary text-primary hover:bg-pink-500 hover:text-black hover:border-pink-500 transition-colors duration-300"
                      >
                        <a href={story.url} target="_blank" rel="noopener noreferrer">
                          Read More <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="arxiv">
            {arxivLoading && renderSkeletonCards()}
            {arxivError && <p className="text-destructive">Error: {arxivError.message}</p>}
            {!arxivLoading && !arxivError && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPapers.map((paper, index) => (
                  <Card key={index} className="bg-card/90 border-primary hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 ease-in-out backdrop-blur-sm group">
                    <CardHeader>
                      <CardTitle className="text-lg text-primary group-hover:text-pink-500 transition-colors duration-300">{paper.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{paper.summary}</p>
                      <p className="text-xs text-muted-foreground mb-2">Published: {new Date(paper.published).toLocaleDateString()}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-primary text-primary hover:bg-pink-500 hover:text-black hover:border-pink-500 transition-colors duration-300"
                      >
                        <a href={paper.link} target="_blank" rel="noopener noreferrer">
                          Read Paper <Book className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="github">
            {githubLoading && renderSkeletonCards()}
            {githubError && <p className="text-destructive">Error: {githubError.message}</p>}
            {!githubLoading && !githubError && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRepos.map((repo) => (
                  <Card key={repo.id} className="bg-card/90 border-primary hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 ease-in-out backdrop-blur-sm group">
                    <CardHeader>
                      <CardTitle className="text-lg text-primary group-hover:text-pink-500 transition-colors duration-300">{repo.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{repo.description}</p>
                      <p className="text-xs text-muted-foreground mb-2">⭐ {repo.stargazers_count.toLocaleString()}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-primary text-primary hover:bg-pink-500 hover:text-black hover:border-pink-500 transition-colors duration-300"
                      >
                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                          View Repository <Github className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="huggingface">
            {huggingfaceLoading && renderSkeletonCards()}
            {huggingfaceError && <p className="text-destructive">Error: {huggingfaceError.message}</p>}
            {!huggingfaceLoading && !huggingfaceError && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredModels.map((model) => (
                  <Card key={model.modelId} className="bg-card/90 border-primary hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 ease-in-out backdrop-blur-sm group">
                    <CardHeader>
                      <CardTitle className="text-lg text-primary group-hover:text-pink-500 transition-colors duration-300">{model.modelId}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{model.description || "No description available"}</p>
                      <p className="text-xs text-muted-foreground mb-2">Downloads: {model.downloads?.toLocaleString() || "N/A"}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-primary text-primary hover:bg-pink-500 hover:text-black hover:border-pink-500 transition-colors duration-300"
                      >
                        <a href={`https://huggingface.co/${model.modelId}`} target="_blank" rel="noopener noreferrer">
                          View Model <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  );
};

export default Index;
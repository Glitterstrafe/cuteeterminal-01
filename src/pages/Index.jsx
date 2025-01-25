import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MatrixBackground from '@/components/MatrixBackground';
import Footer from '@/components/Footer';
import SearchInput from '@/components/SearchInput';
import Header from '@/components/Header';
import ContentCard from '@/components/ContentCard';

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
  const [activeTab, setActiveTab] = useState('arxiv');

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

  const renderContent = (type, data, isLoading, error) => {
    if (isLoading) return renderSkeletonCards();
    if (error) return <p className="text-destructive">Error: {error.message}</p>;

    let filteredData;
    switch (type) {
      case 'hackernews':
        filteredData = data?.hits?.filter(story =>
          story.title.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];
        break;
      case 'arxiv':
        filteredData = data?.filter(paper =>
          paper.title.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];
        break;
      case 'github':
        filteredData = data?.items?.filter(repo =>
          repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];
        break;
      case 'huggingface':
        filteredData = data?.filter(model =>
          model.modelId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          model.description?.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];
        break;
      default:
        filteredData = [];
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.map((item, index) => (
          <ContentCard key={index} item={item} type={type} />
        ))}
      </div>
    );
  };

  const renderSkeletonCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(9)].map((_, index) => (
        <ContentCard key={index} item={{ title: '', description: '' }} type="loading" />
      ))}
    </div>
  );

  return (
    <>
      <div className="container mx-auto p-4 bg-background/80 relative z-10 min-h-screen">
        <MatrixBackground />
        <Header />
        <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <Tabs defaultValue="arxiv" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="arxiv">Arxiv Papers</TabsTrigger>
            <TabsTrigger value="github">GitHub</TabsTrigger>
            <TabsTrigger value="huggingface">HuggingFace</TabsTrigger>
            <TabsTrigger value="hackernews">Hacker News</TabsTrigger>
          </TabsList>

          <TabsContent value="hackernews">
            {renderContent('hackernews', hnData, hnLoading, hnError)}
          </TabsContent>

          <TabsContent value="arxiv">
            {renderContent('arxiv', arxivData, arxivLoading, arxivError)}
          </TabsContent>

          <TabsContent value="github">
            {renderContent('github', githubData, githubLoading, githubError)}
          </TabsContent>

          <TabsContent value="huggingface">
            {renderContent('huggingface', huggingfaceData, huggingfaceLoading, huggingfaceError)}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  );
};

export default Index;
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [activeSource, setActiveSource] = useState('arxiv');

  const { data: hnData, isLoading: hnLoading, error: hnError, refetch: refetchHN } = useQuery({
    queryKey: ['topStories'],
    queryFn: fetchTopStories,
    enabled: activeSource === 'hackernews',
  });

  const { data: arxivData, isLoading: arxivLoading, error: arxivError, refetch: refetchArxiv } = useQuery({
    queryKey: ['arxivPapers'],
    queryFn: fetchArxivPapers,
    enabled: activeSource === 'arxiv',
  });

  const { data: githubData, isLoading: githubLoading, error: githubError, refetch: refetchGithub } = useQuery({
    queryKey: ['githubRepos'],
    queryFn: fetchGithubRepos,
    enabled: activeSource === 'github',
  });

  const { data: huggingfaceData, isLoading: huggingfaceLoading, error: huggingfaceError, refetch: refetchHuggingface } = useQuery({
    queryKey: ['huggingfacePosts'],
    queryFn: fetchHuggingFacePosts,
    enabled: activeSource === 'huggingface',
  });

  const handleSourceChange = (value) => {
    setActiveSource(value);
    // Refetch data for the newly selected source
    switch (value) {
      case 'hackernews':
        refetchHN();
        break;
      case 'arxiv':
        refetchArxiv();
        break;
      case 'github':
        refetchGithub();
        break;
      case 'huggingface':
        refetchHuggingface();
        break;
    }
  };

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
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="w-full md:w-3/4">
            <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>
          <div className="w-full md:w-1/4">
            <Select value={activeSource} onValueChange={handleSourceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="arxiv">Arxiv Papers</SelectItem>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="huggingface">HuggingFace</SelectItem>
                <SelectItem value="hackernews">Hacker News</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {activeSource === 'hackernews' && renderContent('hackernews', hnData, hnLoading, hnError)}
        {activeSource === 'arxiv' && renderContent('arxiv', arxivData, arxivLoading, arxivError)}
        {activeSource === 'github' && renderContent('github', githubData, githubLoading, githubError)}
        {activeSource === 'huggingface' && renderContent('huggingface', huggingfaceData, huggingfaceLoading, huggingfaceError)}
      </div>
      <Footer />
    </>
  );
};

export default Index;
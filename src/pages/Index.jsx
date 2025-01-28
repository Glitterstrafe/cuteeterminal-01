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

  // Fetch data from all sources simultaneously
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

  const handleSourceChange = (value) => {
    setActiveSource(value);
  };

  const getAllResults = () => {
    const results = [];
    
    if (hnData?.hits) {
      results.push(...hnData.hits.map(item => ({
        ...item,
        source: 'hackernews',
        date: new Date(item.created_at).getTime()
      })));
    }
    
    if (arxivData) {
      results.push(...arxivData.map(item => ({
        ...item,
        source: 'arxiv',
        date: new Date(item.published).getTime()
      })));
    }
    
    if (githubData?.items) {
      results.push(...githubData.items.map(item => ({
        ...item,
        source: 'github',
        date: new Date(item.created_at).getTime()
      })));
    }
    
    if (huggingfaceData) {
      results.push(...huggingfaceData.map(item => ({
        ...item,
        source: 'huggingface',
        date: new Date(item.lastModified || Date.now()).getTime()
      })));
    }
    
    return results.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const titleField = item.title || item.name || item.modelId || '';
      const descField = item.summary || item.description || '';
      
      return titleField.toLowerCase().includes(searchLower) ||
             descField.toLowerCase().includes(searchLower);
    });
  };

  const renderContent = () => {
    const isLoading = hnLoading || arxivLoading || githubLoading || huggingfaceLoading;
    const hasError = hnError || arxivError || githubError || huggingfaceError;
    
    if (isLoading) return renderSkeletonCards();
    if (hasError) return <p className="text-destructive">Error loading content</p>;

    let filteredData;
    if (searchTerm && activeSource === 'all') {
      filteredData = getAllResults()
        .sort((a, b) => b.date - a.date)
        .map(item => ({ item, type: item.source }));
    } else {
      switch (activeSource) {
        case 'hackernews':
          filteredData = hnData?.hits
            ?.filter(story => story.title.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(item => ({ item, type: 'hackernews' })) || [];
          break;
        case 'arxiv':
          filteredData = arxivData
            ?.filter(paper => paper.title.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(item => ({ item, type: 'arxiv' })) || [];
          break;
        case 'github':
          filteredData = githubData?.items
            ?.filter(repo => 
              repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(item => ({ item, type: 'github' })) || [];
          break;
        case 'huggingface':
          filteredData = huggingfaceData
            ?.filter(model =>
              model.modelId.toLowerCase().includes(searchTerm.toLowerCase()) ||
              model.description?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(item => ({ item, type: 'huggingface' })) || [];
          break;
        default:
          filteredData = [];
      }
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.map((data, index) => (
          <ContentCard key={index} {...data} />
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
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="arxiv">Arxiv Papers</SelectItem>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="huggingface">HuggingFace</SelectItem>
                <SelectItem value="hackernews">Hacker News</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {renderContent()}
      </div>
      <Footer />
    </>
  );
};

export default Index;
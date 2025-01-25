import { Input } from "@/components/ui/input";

const SearchInput = ({ searchTerm, setSearchTerm }) => {
  return (
    <Input
      type="text"
      placeholder="Search across all platforms..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="mb-4 bg-input text-primary border-primary"
    />
  );
};

export default SearchInput;
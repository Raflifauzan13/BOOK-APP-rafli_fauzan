import { Search, Filter, Star, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';
import BookCard from './BookCard';
import { books as dummyBooks } from '../data/dummyData';

interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  rating: number;
  pages: number;
  genre: string;
  status: 'read' | 'reading' | 'want-to-read';
}

const BrowseLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [books, setBooks] = useState<Book[]>([]);
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await api.get<Book[]>('/api/books');
        // prefer local cover files in public/cover/ named by title
        setBooks(response.data.map((b) => ({ ...b, cover: `/cover/${encodeURIComponent(b.title)}.jpg` })));
        setError(null);
      } catch (err) {
        // fallback to local dummy data so browse still works offline
        console.error('Error fetching books, falling back to dummy data:', err);
        setBooks((dummyBooks as Book[]).map((b) => ({ ...b, cover: `/cover/${encodeURIComponent(b.title)}.jpg` })));
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
    // load local myBooks (library)
    try {
      const raw = localStorage.getItem('myBooks');
      if (raw) setMyBooks(JSON.parse(raw));
    } catch (e) {}
  }, []);

  // Get unique genres from books
  const genres = ['all', ...new Set(books.map(book => book.genre))];
  
  // Normalize function to improve search matching (case-insensitive, remove punctuation, ignore leading 'the')
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, '')
      .replace(/^\s*the\s+/, '')
      .trim();

  // Filter books based on search term and selected genre
  const normalizedSearch = normalize(searchTerm);
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      !normalizedSearch ||
      normalize(book.title).includes(normalizedSearch) ||
      normalize(book.author).includes(normalizedSearch) ||
      normalize(book.genre).includes(normalizedSearch);
    const matchesGenre = selectedGenre === 'all' || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const isInLibrary = (id: number) => myBooks.some((b) => b.id === id);

const addToMyBooks = (book: Book) => {
  try {
    const raw = localStorage.getItem('myBooks');
    const existing: Book[] = raw ? JSON.parse(raw) : [];

    // cegah duplikat
    if (existing.some((b) => b.id === book.id)) return;

    const entry: Book = {
      ...book,
      status: book.status || 'want-to-read',
    };

    const updated = [...existing, entry];

    localStorage.setItem('myBooks', JSON.stringify(updated));

    // 🔥 INI YANG PALING PENTING
    window.dispatchEvent(
      new CustomEvent('myBooks:updated', { detail: updated })
    );

    // update state lokal supaya tombol + langsung hilang
    setMyBooks(updated);
  } catch (e) {
    console.error('Failed to add book to library', e);
  }
};

  

  // (add-book feature removed)

  // no cross-component sync required for removed feature

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Browse Library</h2>
        <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
          <Filter size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search books or authors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Genre Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedGenre === genre
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {genre === 'all' ? 'All Genres' : genre}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-600">
        {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} found
      </p>

      {/* Books Grid */}
      <div className="space-y-3">
        {filteredBooks.map((book) => (
          <div key={book.id} className="relative">
            <BookCard book={book} variant="discover" />
            {isInLibrary(book.id) ? (
              book.status === 'read' && (
                <div className="absolute top-4 right-4 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                  Read
                </div>
              )
            ) : (
              <button
                onClick={() => addToMyBooks(book)}
                className="absolute top-3 right-3 bg-blue-500 text-white p-2 rounded-full shadow-md hover:bg-blue-600 transition-colors"
                title="Add to My Books"
              >
                <Plus size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No books found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default BrowseLibrary;

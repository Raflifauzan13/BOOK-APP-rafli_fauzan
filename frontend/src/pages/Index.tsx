import { useState, useEffect } from 'react';
import { Book, Search, User, TrendingUp, Plus, Library, Star } from 'lucide-react';
import BookCard from '../components/BookCard';
import ProgressCard from '../components/ProgressCard';
import BottomNav from '../components/BottomNav';
import HeaderNav from '../components/HeaderNav';
import BrowseLibrary from '../components/BrowseLibrary';
import { books, currentlyReading, readingStats } from '../data/dummyData';

type BookType = {
  id: number;
  title: string;
  author: string;
  genre: string;
  cover: string;
  rating: number;
  pages: number;
  status: 'read' | 'reading' | 'want-to-read';
};

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [libraryView, setLibraryView] = useState('my-books');

  const [bookList, setBookList] = useState<BookType[]>(() => {
    try {
      const raw = localStorage.getItem('myBooks');
      return raw ? (JSON.parse(raw) as BookType[]) : [];
    } catch (e) {
      return [];
    }
  });
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [overlaySearch, setOverlaySearch] = useState('');
  const [overlaySelectedGenre, setOverlaySelectedGenre] = useState('all');

  useEffect(() => {
    try {
      localStorage.setItem('myBooks', JSON.stringify(bookList));
    } catch (e) {}
  }, [bookList]);

  // listen for library updates from other components (same-window custom event or storage)
  useEffect(() => {
    const handler = (e: any) => {
      try {
        const payload = e && e.detail !== undefined ? e.detail : JSON.parse(localStorage.getItem('myBooks') || '[]');
        setBookList(Array.isArray(payload) ? payload : []);
      } catch (err) {}
    };

    const storageHandler = (e: StorageEvent) => {
      if (e.key === 'myBooks') {
        try {
          const val = e.newValue ? JSON.parse(e.newValue) : [];
          setBookList(Array.isArray(val) ? val : []);
        } catch (err) {}
      }
    };

    window.addEventListener('myBooks:updated', handler as EventListener);
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener('myBooks:updated', handler as EventListener);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, '')
      .replace(/^\s*the\s+/, '')
      .trim();

        const allBooks: BookType[] = books;

  const normalizedQuery = normalize(search);
  const filteredBooks = allBooks.filter((b) => {
    if (!normalizedQuery) return true;
    return [b.title, b.author, b.genre].some((f) => normalize(f).includes(normalizedQuery));
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'library':
        return (
          <div className="space-y-4">
            {/* Library Navigation */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setLibraryView('my-books')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  libraryView === 'my-books'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Book size={16} />
                <span>My Books</span>
              </button>
              <button
                onClick={() => setLibraryView('browse')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  libraryView === 'browse'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Library size={16} />
                <span>Browse</span>
              </button>
            </div>

            {/* Content based on selected view */}
            {libraryView === 'my-books' ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">My Library</h2>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setLibraryView('browse')}
                      className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {bookList.map((book) => (
                    <BookCard key={book.id} book={book} variant="library" />
                  ))}
                </div>
              </div>
            ) : (
              <BrowseLibrary />
            )}
          </div>
        );
      case 'discover':
        return (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search books..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Trending Now</h2>
            <div className="space-y-3">
              {filteredBooks.slice(0, 8).map((book) => (
                <BookCard key={book.id} book={book} variant="discover" />
              ))}
              {filteredBooks.length === 0 && (
                <div className="text-center text-sm text-gray-500">No books found.</div>
              )}
            </div>
          </div>
        );
      case 'reading':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Currently Reading</h2>
            <div className="space-y-4">
              {currentlyReading.map((book) => (
                <ProgressCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="text-white" size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Book Lover</h2>
              <p className="text-gray-600">Reading enthusiast since 2020</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{readingStats.totalBooks}</div>
                <div className="text-sm text-gray-600">Books Read</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{readingStats.currentStreak}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">{readingStats.avgRating}</div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>
            
            {/* Favorite Books (starred) - grid like Library */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Favorite Books</h3>
              {bookList.filter((b) => b.rating >= 4.5).length === 0 ? (
                <div className="text-sm text-gray-500">No favorite books yet.</div>
              ) : (
                <div className="max-h-64 overflow-auto pr-2">
                  <div className="grid grid-cols-2 gap-4">
                    {bookList
                      .filter((b) => b.rating >= 4.5)
                        .map((book) => (
                        <div key={book.id} className="relative">
                          <div className="absolute -top-2 -left-2 bg-yellow-100 text-yellow-700 rounded-full p-1 shadow z-20">
                            <Star size={14} />
                          </div>
                          <div className="relative z-10">
                            <BookCard book={book} variant="library" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">

            {normalizedQuery ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Search Results</h3>
                <div className="space-y-3">
                  {filteredBooks.slice(0, 8).map((book) => (
                    <BookCard key={book.id} book={book} variant="discover" />
                  ))}
                  {filteredBooks.length === 0 && (
                    <div className="text-center text-sm text-gray-500">No books found.</div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
                  <h2 className="text-xl font-bold mb-2">Welcome back!</h2>
                  <p className="opacity-90">You've read {readingStats.pagesThisWeek} pages this week</p>
                  <div className="mt-4 bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2 w-3/4"></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Continue Reading</h3>
                  <div className="space-y-3">
                    {currentlyReading.slice(0, 2).map((book) => (
                      <ProgressCard key={book.id} book={book} />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Recommended for You</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {allBooks.slice(0, 4).map((book) => (
                      <BookCard key={book.id} book={book} variant="compact" />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <HeaderNav activeTab={activeTab} onSearchClick={() => setShowSearch(true)} />

            {showSearch && (
              <div
                className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40"
                onClick={() => { setShowSearch(false); setOverlaySearch(''); }}
              >
                <div
                  className="w-full max-w-md bg-white rounded-xl p-4 shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search books..."
                      value={overlaySearch}
                      onChange={(e) => setOverlaySearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                      {/* Genre Filter - reuse Browse styling */}
                      <div className="flex space-x-2 overflow-x-auto pb-2 mt-3">
                        {(['all', ...Array.from(new Set(allBooks.map(b => b.genre)))] as string[]).map((genre) => (
                          <button
                            key={genre}
                            onClick={() => setOverlaySelectedGenre(genre)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                              overlaySelectedGenre === genre
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {genre === 'all' ? 'All Genres' : genre}
                          </button>
                        ))}
                      </div>

                  <h2 className="text-xl font-bold text-gray-800 mt-4">Trending Now</h2>
                  <div className="space-y-3 mt-2 max-h-64 overflow-auto">
                    {(() => {
                      const q = overlaySearch.trim();
                      const normalizedQ = normalize(q);
                      const list = allBooks.filter((b) => {
                        const matchesQuery =
                          !normalizedQ ||
                          normalize(b.title).includes(normalizedQ) ||
                          normalize(b.author).includes(normalizedQ) ||
                          normalize(b.genre).includes(normalizedQ);
                        const matchesGenre = overlaySelectedGenre === 'all' || b.genre === overlaySelectedGenre;
                        return matchesQuery && matchesGenre;
                      });
                      const shown = list.slice(0, 8);
                      return shown.map((book) => <BookCard key={book.id} book={book} variant="discover" />);
                    })()}
                    {(() => {
                      const q = overlaySearch.trim();
                      const normalizedQ = normalize(q);
                      const count = allBooks.filter((b) => {
                        const matchesQuery =
                          !normalizedQ ||
                          normalize(b.title).includes(normalizedQ) ||
                          normalize(b.author).includes(normalizedQ) ||
                          normalize(b.genre).includes(normalizedQ);
                        const matchesGenre = overlaySelectedGenre === 'all' || b.genre === overlaySelectedGenre;
                        return matchesQuery && matchesGenre;
                      }).length;
                      return count === 0 ? <div className="text-center text-sm text-gray-500">No books found.</div> : null;
                    })()}
                  </div>
                </div>
              </div>
            )}
      
      <main className="px-4 py-6 pb-28">
        {renderContent()}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Index;

// persist my books when bookList changes
// (placed after export so it runs in module scope when imported by bundler)
try {
  const _prev = (window as any).__bookListPersistAttached;
  if (!_prev) {
    (window as any).__bookListPersistAttached = true;
    // save to localStorage on unload and periodically
    window.addEventListener('beforeunload', () => {
      try {
        // find the React root state by reading from DOM if possible
        // fallback: nothing here - components persist on change via useEffect
      } catch (e) {}
    });
  }
} catch (e) {}

// persist my books when bookList changes
// (placed after export so it runs in module scope when imported by bundler)
try {
  // watch for storage once component is mounted by using an interval fallback
  const _prev = (window as any).__bookListPersistAttached;
  if (!_prev) {
    (window as any).__bookListPersistAttached = true;
    // listen to storage events to sync across tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'myBooks') {
        // no-op here; component reads from localStorage on mount
      }
    });
  }
} catch (e) {
  // ignore in non-browser environments
}
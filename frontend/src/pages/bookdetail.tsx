import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, BookOpen } from "lucide-react";
import { books } from "../data/dummyData";
import BookCover from "../components/BookCover";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const book = books.find((b) => b.id === Number(id));

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Buku tidak ditemukan
      </div>
    );
  }

  return (
    /* Wrapper Utama: Konsisten dengan max-w-md */
    <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col relative">
      
      {/* Header */}
      <div className="flex items-center px-4 py-4 bg-white sticky top-0 z-30">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Detail Buku</h1>
      </div>

      <main className="px-6 pt-4 pb-32 flex-1 space-y-6">
        
        {/* Cover Section */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-44 h-60 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
            <BookCover src={book.cover} alt={book.title} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 leading-tight">{book.title}</h2>
            <p className="text-base text-gray-500 font-medium">{book.author}</p>
            
            {/* Info Badge: Genre, Rating, dan Halaman (Pindah ke sini) */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase">
                {book.genre}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                {book.pages} Halaman
              </span>
              <div className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-1 rounded-full">
                <Star size={12} fill="currentColor" />
                <span className="ml-1 text-xs font-bold text-gray-700">{book.rating}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full" />

        {/* Sinopsis Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-800">Sinopsis</h3>
          <p className="text-sm text-gray-600 leading-relaxed text-justify">
            {book.sinopsis || "Belum ada sinopsis untuk buku ini. Deskripsi akan segera ditambahkan."}
          </p>
        </div>
      </main>

      {/* Footer: Hanya Tombol Read */}
      <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 p-4 z-40">
        <button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center space-x-2 transition-all active:scale-95"
          onClick={() => console.log("Membaca buku...")}
        >
          <BookOpen size={20} />
          <span>Mulai Membaca</span>
        </button>
      </div>

    </div>
  );
};

export default BookDetail;
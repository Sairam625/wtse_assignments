import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import MovieCard from './components/MovieCard';
import './index.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('Batman'); // Default search

  useEffect(() => {
    fetchMovies(searchTerm);
  }, [searchTerm]);

  const fetchMovies = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.tvmaze.com/search/shows?q=${query}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setMovies(data);
    } catch (err) {
      setError('Failed to fetch movies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchTerm(query);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>MovieVault</h1>
        <p>Discover your next favorite show</p>
      </header>

      <SearchBar onSearch={handleSearch} />

      <main className="main-content">
        {loading && <div className="loader"></div>}

        {error && <div className="error-message">{error}</div>}

        {!loading && !error && movies.length === 0 && (
          <div className="no-results">No results found for "{searchTerm}"</div>
        )}

        <div className="movies-grid">
          {movies.map((movie) => (
            <MovieCard key={movie.show.id} movie={movie} />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;

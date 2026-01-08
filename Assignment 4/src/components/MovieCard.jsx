import React from 'react';

const MovieCard = ({ movie }) => {
    const { show } = movie;
    const image = show.image ? show.image.medium : 'https://via.placeholder.com/210x295?text=No+Image';
    const summary = show.summary ? show.summary.replace(/<[^>]+>/g, '') : 'No summary available.';

    return (
        <div className="movie-card">
            <div className="card-image-container">
                <img src={image} alt={show.name} className="card-image" />
                <div className="card-overlay">
                    <span className="card-rating">
                        {show.rating?.average ? `★ ${show.rating.average}` : 'N/A'}
                    </span>
                </div>
            </div>
            <div className="card-content">
                <h3 className="card-title">{show.name}</h3>
                <p className="card-year">{show.premiered ? show.premiered.split('-')[0] : 'Unknown'}</p>
                <p className="card-summary">{summary.length > 100 ? summary.substring(0, 100) + '...' : summary}</p>
                <a href={show.url} target="_blank" rel="noopener noreferrer" className="card-link">View Details</a>
            </div>
        </div>
    );
};

export default MovieCard;

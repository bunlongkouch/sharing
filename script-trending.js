document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Show loading indicator
        document.getElementById('loadingIndicator').style.display = 'flex';
        
        // Load trending books
        const response = await fetch('/api/books/trending-books');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const trendingBooks = await response.json();
        console.log('Trending books loaded:', trendingBooks);
        
        // Hide loading indicator
        document.getElementById('loadingIndicator').style.display = 'none';
        
        if (trendingBooks.length === 0) {
            document.getElementById('bookList').innerHTML = 
                '<p class="no-books">No trending books found.</p>';
            return;
        }
        
        displayBooks(trendingBooks);
        
        // Setup event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('errorDisplay').style.display = 'block';
        document.getElementById('errorDisplay').querySelector('p').textContent = 
            'Failed to load books. Please try again later.';
    }
});

function displayBooks(books) {
    const bookList = document.getElementById('bookList');
    bookList.innerHTML = books.map(book => `
        <div class="book-card" data-book-id="${book._id}">
            <img src="${book.image || 'placeholder.jpg'}" alt="${book.title}">
            <h3>${book.title}</h3>
            <p class="book-author">${book.author}</p>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.book-card').forEach(card => {
        card.addEventListener('click', () => showBookDetails(
            books.find(b => b._id === card.dataset.bookId)
        ));
    });
}

function showBookDetails(book) {
    const detailsPage = document.getElementById('bookDetailsPage');
    
    // Populate details
    document.getElementById('detailsBookImage').src = book.image || 'placeholder.jpg';
    document.getElementById('detailsBookTitle').textContent = book.title;
    document.getElementById('detailsBookAuthor').textContent = book.author;
    document.getElementById('detailsBookGenre').textContent = book.genre;
    document.getElementById('detailsBookPublishedDate').textContent = book.publishedDate || 'N/A';
    document.getElementById('detailsBookSynopsis').textContent = book.synopsis || 'No synopsis available.';
    
    // Show details
    detailsPage.style.display = 'flex';
}

function setupEventListeners() {
    // Filter and search
    document.getElementById('filterButton').addEventListener('click', applyFilters);
    document.getElementById('searchInput').addEventListener('input', handleSearchInput);
    
    // Search toggle
    document.getElementById('searchColon').addEventListener('click', toggleSearch);
    
    // Book details
    document.getElementById('closeDetailsButton').addEventListener('click', closeBookDetails);
    
    // Error retry
    document.getElementById('retryButton').addEventListener('click', () => window.location.reload());
}

function applyFilters() {
    const genre = document.getElementById('genre').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    filterAndSearchBooks(searchQuery, genre);
}

function handleSearchInput(event) {
    const query = event.target.value.toLowerCase();
    const genre = document.getElementById('genre').value;
    filterAndSearchBooks(query, genre);
}

function toggleSearch() {
    const searchText = document.getElementById('searchText');
    const searchInput = document.getElementById('searchInput');
    
    searchText.style.display = 'none';
    searchInput.style.display = 'block';
    searchInput.focus();
}

function closeBookDetails() {
    document.getElementById('bookDetailsPage').style.display = 'none';
}

// This would be replaced with actual search functionality
function filterAndSearchBooks(query, genre) {
    // In a real implementation, you would fetch filtered results from the server
    console.log(`Filtering with query: ${query}, genre: ${genre}`);
    // For now, we'll just reload the page to show the implementation is working
    window.location.reload();
}
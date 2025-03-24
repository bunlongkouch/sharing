// Global state
let bestSellers = [];
let allBooks = [];
let isLoading = false;

// Main initialization
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializePage();
    } catch (error) {
        handleInitializationError(error);
    }
});

async function initializePage() {
    if (isLoading) return;
    isLoading = true;
    
    showLoading();
    try {
        bestSellers = await loadBestSellers();
        if (bestSellers.length === 0) {
            showEmptyState();
        } else {
            displayBooks(bestSellers);
            // Load all books in background for search
            loadAllBooksForSearch().catch(console.error);
        }
        initAuth();
        setupEventListeners();
    } finally {
        hideLoading();
        isLoading = false;
    }
}

// Data loading functions
async function loadBestSellers() {
    try {
        console.log('[API] Fetching best sellers...');
        const startTime = performance.now();
        
        const response = await fetch('/api/books/best-sellers', {
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });

        const responseTime = performance.now() - startTime;
        console.log(`[API] Response received in ${responseTime.toFixed(2)}ms`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('[API] Received data:', data);
        return data;
    } catch (error) {
        console.error('[API] Failed to load best sellers:', error);
        showError(`Failed to load books: ${error.message}`);
        throw error;
    }
}

async function loadAllBooksForSearch() {
    try {
        const response = await fetch('/api/books/all-books');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        allBooks = await response.json();
        console.log('[API] Loaded all books for search:', allBooks.length);
    } catch (error) {
        console.error('[API] Failed to load all books:', error);
        // Not critical for main functionality
    }
}

// UI Functions
function displayBooks(books) {
    const bookList = document.getElementById('bookList');
    if (!bookList) {
        console.error('UI Error: bookList element not found');
        return;
    }

    if (!books || books.length === 0) {
        showEmptyState();
        return;
    }

    try {
        bookList.innerHTML = books.map(book => `
            <div class="book-card" data-book-id="${book._id}">
                <img src="${book.image || 'placeholder.jpg'}" 
                     alt="${book.title || 'Untitled'}"
                     onerror="this.src='placeholder.jpg'">
                <h3>${book.title || 'Untitled'}</h3>
                <p class="book-author">${book.author || 'Unknown Author'}</p>
                ${book.bestsellerRank ? `<span class="bestseller-badge">#${book.bestsellerRank}</span>` : ''}
            </div>
        `).join('');

        setupBookCardEventListeners(books);
    } catch (error) {
        console.error('UI Error: Failed to display books:', error);
        showError('Failed to display books');
    }
}

function setupBookCardEventListeners(books) {
    document.querySelectorAll('.book-card').forEach(card => {
        card.addEventListener('click', () => {
            const bookId = card.dataset.bookId;
            const book = books.find(b => b._id === bookId);
            if (book) showBookDetails(book);
        });
    });
}

function showBookDetails(book) {
    try {
        const detailsPage = document.getElementById('bookDetailsPage');
        if (!detailsPage) {
            console.error('UI Error: Book details page element not found');
            return;
        }

        // Set book details with fallbacks
        document.getElementById('detailsBookImage').src = book.image || 'placeholder.jpg';
        document.getElementById('detailsBookTitle').textContent = book.title || 'Untitled';
        document.getElementById('detailsBookAuthor').textContent = book.author || 'Unknown Author';
        document.getElementById('detailsBookGenre').textContent = book.genre || 'Unknown Genre';
        document.getElementById('detailsBookPublishedDate').textContent = book.publishedDate || 'N/A';
        document.getElementById('detailsBookSynopsis').textContent = book.synopsis || 'No synopsis available.';

        // Setup favorite button
        const favoriteBtn = document.getElementById('favoriteButton');
        if (favoriteBtn) {
            favoriteBtn.onclick = () => toggleFavorite(book._id);
            favoriteBtn.innerHTML = `
                <i class="far fa-heart"></i> 
                ${isFavorite(book._id) ? 'Remove Favorite' : 'Add Favorite'}
            `;
        }

        detailsPage.style.display = 'flex';
    } catch (error) {
        console.error('UI Error: Failed to show book details:', error);
    }
}

// Utility Functions
function showLoading() {
    const loader = document.getElementById('loadingIndicator');
    if (loader) loader.style.display = 'flex';
}

function hideLoading() {
    const loader = document.getElementById('loadingIndicator');
    if (loader) loader.style.display = 'none';
}

function showEmptyState() {
    const bookList = document.getElementById('bookList');
    if (bookList) {
        bookList.innerHTML = '<p class="no-books">No books found.</p>';
    }
}

function showError(message) {
    const bookList = document.getElementById('bookList');
    if (bookList) {
        bookList.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <button id="retryButton" class="retry-btn">Try Again</button>
            </div>
        `;
        document.getElementById('retryButton')?.addEventListener('click', initializePage);
    }
}

// Event Handlers
function setupEventListeners() {
    // Search and filter
    document.getElementById('filterButton')?.addEventListener('click', applyFilters);
    document.getElementById('searchInput')?.addEventListener('input', handleSearchInput);
    document.getElementById('searchColon')?.addEventListener('click', toggleSearch);
    
    // Book details
    document.getElementById('closeDetailsButton')?.addEventListener('click', closeBookDetails);
}

function applyFilters() {
    const genre = document.getElementById('genre')?.value || 'all';
    const searchQuery = document.getElementById('searchInput')?.value.toLowerCase() || '';
    filterAndSearchBooks(searchQuery, genre);
}

function handleSearchInput(event) {
    const query = event.target.value.toLowerCase();
    const genre = document.getElementById('genre')?.value || 'all';
    filterAndSearchBooks(query, genre);
}

function toggleSearch() {
    const searchText = document.getElementById('searchText');
    const searchInput = document.getElementById('searchInput');
    
    if (searchText && searchInput) {
        searchText.style.display = 'none';
        searchInput.style.display = 'block';
        searchInput.focus();
    }
}

function filterAndSearchBooks(query, genre) {
    try {
        let filteredBooks = query ? allBooks : bestSellers;
        
        filteredBooks = filteredBooks.filter(book => {
            const matchesQuery = !query || 
                (book.title?.toLowerCase().includes(query) || 
                 book.author?.toLowerCase().includes(query));
            const matchesGenre = genre === 'all' || 
                book.genre?.toLowerCase() === genre.toLowerCase();
            return matchesQuery && matchesGenre;
        });

        displayBooks(filteredBooks);
    } catch (error) {
        console.error('Filter error:', error);
    }
}

function closeBookDetails() {
    const detailsPage = document.getElementById('bookDetailsPage');
    if (detailsPage) detailsPage.style.display = 'none';
}

// Auth Functions (Placeholders)
function initAuth() {
    console.log('[Auth] Initialized');
}

function isFavorite(bookId) {
    return false; // Implement actual auth check
}

function toggleFavorite(bookId) {
    console.log(`[Auth] Toggling favorite for book ${bookId}`);
    // Implement actual favorite toggle
}
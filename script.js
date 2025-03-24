let allBooks = [];
let combinedBooks = [];

// Fetch all books from the "book_recommendations" collection
fetch('/api/books')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(books => {
        allBooks = books; // Store all books for filtering
        console.log('Books:', books); // Log the data
        displayBooks(books);
    })
    .catch(error => {
        console.error('Error fetching books:', error); // Log the error
        const bookList = document.getElementById('bookList');
        bookList.innerHTML = '<p>Error loading books. Please try again later.</p>';
    });

// Fetch all books (from all collections) for search
fetch('/api/all-books')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(books => {
        combinedBooks = books; // Store all books for search
        console.log('Combined Books:', combinedBooks); // Log the combined books
    })
    .catch(error => {
        console.error('Error fetching all books:', error); // Log the error
    });

// Filter books by genre
document.getElementById('filterButton').addEventListener('click', () => {
    const genre = document.getElementById('genre').value;
    filterBooks(genre);
});

function filterBooks(genre) {
    let filteredBooks = allBooks;
    if (genre !== 'all') {
        filteredBooks = allBooks.filter(book => book.genre.toLowerCase() === genre.toLowerCase());
    }
    displayBooks(filteredBooks);
}

// Display books
function displayBooks(books) {
    const bookList = document.getElementById('bookList');
    bookList.innerHTML = '';
    if (books.length === 0) {
        console.log('No books found for the search query.'); // Log a message if no books are found
        bookList.innerHTML = '<p>No books found.</p>';
    } else {
        books.forEach(book => {
            const bookElement = document.createElement('div');
            bookElement.className = 'book-card';
            bookElement.innerHTML = `
                <img src="${book.image || 'placeholder.jpg'}" alt="${book.title}">
                <h3>${book.title}</h3>
            `;
            bookElement.addEventListener('click', () => showBookDetails(book));
            bookList.appendChild(bookElement);
        });
    }
}

// Show book details
function showBookDetails(book) {
    const bookDetailsPage = document.getElementById('bookDetailsPage');
    const detailsBookImage = document.getElementById('detailsBookImage');
    const detailsBookTitle = document.getElementById('detailsBookTitle');
    const detailsBookAuthor = document.getElementById('detailsBookAuthor');
    const detailsBookGenre = document.getElementById('detailsBookGenre');
    const detailsBookPublishedDate = document.getElementById('detailsBookPublishedDate');
    const detailsBookSynopsis = document.getElementById('detailsBookSynopsis');

    // Populate book details
    detailsBookImage.src = book.image || 'placeholder.jpg';
    detailsBookTitle.textContent = book.title;
    detailsBookAuthor.textContent = book.author;
    detailsBookGenre.textContent = book.genre;
    detailsBookPublishedDate.textContent = book.publishedDate || 'N/A';
    detailsBookSynopsis.textContent = book.synopsis || 'No synopsis available.';

    // Show the book details page
    bookDetailsPage.style.display = 'flex';
}

// Close book details page
document.getElementById('closeDetailsButton').addEventListener('click', () => {
    const bookDetailsPage = document.getElementById('bookDetailsPage');
    bookDetailsPage.style.display = 'none';
});

// Toggle search input
const searchColon = document.getElementById('searchColon');
const searchText = document.getElementById('searchText');
const searchInput = document.getElementById('searchInput');

searchColon.addEventListener('click', () => {
    searchText.style.display = 'none'; // Hide "Quick Search" text
    searchInput.style.display = 'block'; // Show input field
    searchInput.focus(); // Focus on the input field
});

// Handle search input
searchInput.addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase();
    const genre = document.getElementById('genre').value;
    console.log('Search Query:', query); // Log the search query
    filterAndSearchBooks(query, genre);
});

function filterAndSearchBooks(query, genre) {
    if (combinedBooks.length === 0) {
        console.log('Combined books not yet loaded.'); // Log a message if combinedBooks is empty
        return; // Exit the function if combinedBooks is not populated
    }

    let filteredBooks = combinedBooks; // Use combinedBooks instead of allBooks
    if (query) {
        filteredBooks = filteredBooks.filter(book =>
            book.title.toLowerCase().includes(query) || // Search by title
            book.author.toLowerCase().includes(query)   // Search by author
        );
    }
    if (genre !== 'all') {
        filteredBooks = filteredBooks.filter(book => book.genre.toLowerCase() === genre.toLowerCase());
    }
    console.log('Filtered Books:', filteredBooks); // Log the filtered books for debugging
    displayBooks(filteredBooks);
}
// Sign Up
document.getElementById('signupButton').addEventListener('click', async () => {
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;

    const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('token', data.token); // Save token
        alert('Sign up successful!');
    } else {
        alert(data.message);
    }
});

// Log In
document.getElementById('loginButton').addEventListener('click', async () => {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('token', data.token); // Save token
        alert('Log in successful!');
    } else {
        alert(data.message);
    }
});

// Add/Remove Favorite
document.querySelectorAll('.favoriteButton').forEach(button => {
    button.addEventListener('click', async () => {
        const bookId = button.getAttribute('data-book-id');
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Please log in to add favorites.');
            return;
        }

        const response = await fetch('/api/books/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bookId })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Favorite updated!');
        } else {
            alert('Something went wrong.');
        }
    });
});
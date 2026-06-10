/* ============================================
   TMDB API Configuration
   ============================================ */
const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYmE4ODA0YjA4NjAxYjExOGExZjFhZjZhMzgzNGI3NCIsInN1YiI6IjY0OWVmZmM0YzlkYmY5MDEwN2UxZTU0MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.EV_B46kJXwRaqfcfXunUdvSCCDyyRzkS13QBLwEgXK4'
    }
};

const BASE_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const TOTAL_PAGES_LIMIT = 500; // TMDB maximum pages

// State
let currentCategory = 'now_playing';
let allMovies = [];
let currentPage = 1;
let totalPages = 0;
let isLoading = false;
let hasMorePages = true;
let isLoadAllMode = false;

// DOM Elements
const resultsDiv = document.getElementById('results');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const nowPlayingBtn = document.getElementById('nowPlayingButton');
const topRatedBtn = document.getElementById('topRatedButton');
const popularBtn = document.getElementById('popularButton');
const sectionTitleSpan = document.getElementById('sectionTitle');
const resultsCountSpan = document.querySelector('#resultsCount span');
const resultsPageSpan = document.querySelector('#resultsPage span');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const loadAllBtn = document.getElementById('loadAllBtn');
const refreshBtn = document.getElementById('refreshBtn');
const loadedCountSpan = document.getElementById('loadedCount');
const totalAvailableSpan = document.getElementById('totalAvailable');
const progressBar = document.getElementById('progressBar');
const themeToggle = document.getElementById('themeToggle');
const header = document.getElementById('header');
const backToTop = document.getElementById('backToTop');

// Mobile Menu Elements
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const mobileThemeToggle = document.getElementById('mobileThemeToggle');

// Modal Elements
const modal = document.getElementById('movieModal');
const modalClose = document.getElementById('modalClose');
const modalPoster = document.getElementById('modalPoster');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalRating = document.getElementById('modalRating');
const modalRuntime = document.getElementById('modalRuntime');
const modalOverview = document.getElementById('modalOverview');
const watchTrailer = document.getElementById('watchTrailer');

let currentMovieId = null;

// ============================================
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadMovies();
    setupEventListeners();
    setupScrollEffect();
    loadTheme();
    setupMobileMenu();
});

function setupEventListeners() {
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    nowPlayingBtn.addEventListener('click', () => {
        setActiveButton(nowPlayingBtn);
        currentCategory = 'now_playing';
        sectionTitleSpan.textContent = 'معروض الآن';
        resetAndLoad();
    });
    
    topRatedBtn.addEventListener('click', () => {
        setActiveButton(topRatedBtn);
        currentCategory = 'top_rated';
        sectionTitleSpan.textContent = 'الأعلى تقييماً';
        resetAndLoad();
    });
    
    popularBtn.addEventListener('click', () => {
        setActiveButton(popularBtn);
        currentCategory = 'popular';
        sectionTitleSpan.textContent = 'الأكثر مشاهدة';
        resetAndLoad();
    });
    
    loadMoreBtn.addEventListener('click', loadMoreMovies);
    loadAllBtn.addEventListener('click', loadAllMovies);
    refreshBtn.addEventListener('click', () => {
        resetAndLoad();
        showNotification('جاري تحديث الأفلام...', 'info');
    });
    
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    watchTrailer.addEventListener('click', () => {
        if (currentMovieId) fetchMovieTrailer(currentMovieId);
    });
    
    themeToggle.addEventListener('click', toggleTheme);
    
    // Back to top
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function setActiveButton(activeBtn) {
    [nowPlayingBtn, topRatedBtn, popularBtn].forEach(btn => {
        btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
}

function setupScrollEffect() {
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
        backToTop.classList.toggle('visible', window.scrollY > 500);
        
        // Infinite scroll - load more when near bottom
        if (!isLoading && hasMorePages && !isLoadAllMode) {
            const scrollPosition = window.innerHeight + window.scrollY;
            const threshold = document.body.scrollHeight - 500;
            if (scrollPosition >= threshold) {
                loadMoreMovies();
            }
        }
    });
}

function showNotification(message, type = 'info') {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<i class="fas ${type === 'info' ? 'fa-info-circle' : 'fa-check-circle'}"></i> ${message}`;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--accent);
        color: white;
        padding: 0.8rem 1.5rem;
        border-radius: 50px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ============================================
// Load More Functions
// ============================================
function resetAndLoad() {
    allMovies = [];
    currentPage = 1;
    hasMorePages = true;
    isLoadAllMode = false;
    loadMoreBtn.disabled = false;
    loadAllBtn.disabled = false;
    document.getElementById('loadMoreContainer').style.display = 'block';
    loadMovies();
}

function updateProgress() {
    const loaded = allMovies.length;
    const total = isLoadAllMode ? allMovies.length : (totalPages * 20);
    const percent = total > 0 ? (loaded / total) * 100 : 0;
    progressBar.style.width = `${Math.min(percent, 100)}%`;
    loadedCountSpan.textContent = loaded;
}

function updatePageInfo() {
    resultsPageSpan.textContent = `الصفحة ${currentPage}`;
}

function showLoading() {
    if (currentPage === 1) {
        resultsDiv.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>جاري تحميل الأفلام...</p>
            </div>
        `;
    } else {
        const loadMoreIndicator = document.createElement('div');
        loadMoreIndicator.className = 'load-more-loading';
        loadMoreIndicator.innerHTML = `
            <div class="spinner" style="width: 30px; height: 30px;"></div>
            <p>جاري تحميل المزيد...</p>
        `;
        resultsDiv.appendChild(loadMoreIndicator);
    }
}

function removeLoadingIndicator() {
    const indicators = document.querySelectorAll('.load-more-loading');
    indicators.forEach(ind => ind.remove());
}

async function loadMovies() {
    if (isLoading) return;
    isLoading = true;
    showLoading();
    
    let url = '';
    if (searchInput.value.trim()) {
        url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchInput.value.trim())}&include_adult=false&language=en-US&page=${currentPage}`;
    } else {
        url = `https://api.themoviedb.org/3/movie/${currentCategory}?language=en-US&page=${currentPage}`;
    }
    
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (currentPage === 1) {
            totalPages = Math.min(data.total_pages, TOTAL_PAGES_LIMIT);
            totalAvailableSpan.textContent = data.total_results > 10000 ? '10,000+' : data.total_results;
        }
        
        const newMovies = data.results || [];
        allMovies = [...allMovies, ...newMovies];
        hasMorePages = currentPage < totalPages;
        
        displayMovies(allMovies);
        updateProgress();
        updatePageInfo();
        
        if (!hasMorePages && !isLoadAllMode) {
            loadMoreBtn.disabled = true;
            loadMoreBtn.innerHTML = '<i class="fas fa-check"></i><span>تم تحميل الكل</span>';
            showNotification('تم تحميل جميع الأفلام!', 'success');
        }
        
    } catch (error) {
        console.error('Error loading movies:', error);
        showNotification('حدث خطأ في تحميل الأفلام', 'error');
    } finally {
        isLoading = false;
        removeLoadingIndicator();
    }
}

async function loadMoreMovies() {
    if (!hasMorePages || isLoading) return;
    currentPage++;
    await loadMovies();
}

async function loadAllMovies() {
    if (isLoading) return;
    isLoadAllMode = true;
    loadMoreBtn.disabled = true;
    loadAllBtn.disabled = true;
    
    showNotification('جاري تحميل جميع الأفلام...', 'info');
    
    while (hasMorePages && currentPage < totalPages) {
        currentPage++;
        await loadMovies();
    }
    
    isLoadAllMode = false;
    showNotification(`تم تحميل ${allMovies.length} فيلم بنجاح!`, 'success');
}

async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query && currentCategory !== 'search') {
        resetAndLoad();
        return;
    }
    
    currentCategory = 'search';
    sectionTitleSpan.textContent = `نتائج البحث: "${query}"`;
    allMovies = [];
    currentPage = 1;
    hasMorePages = true;
    await loadMovies();
}

// ============================================
// Display Functions
// ============================================
function createMovieCard(movie, index) {
    const posterPath = movie.poster_path ? `${BASE_IMAGE_URL}${movie.poster_path}` : 'https://placehold.co/500x750/2A2D7C/FFFFFF?text=No+Poster';
    const year = movie.release_date ? movie.release_date.split('-')[0] : 'قريباً';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '0';
    const animationDelay = (index % 12) * 0.03;
    
    return `
        <div class="movie-card" data-id="${movie.id}" data-movie='${JSON.stringify(movie)}' style="animation-delay: ${animationDelay}s">
            <div class="movie-poster">
                <img src="${posterPath}" alt="${movie.title}" loading="lazy" onerror="this.src='https://placehold.co/500x750/2A2D7C/FFFFFF?text=No+Image'">
                <div class="movie-overlay">
                    <div class="play-icon" onclick="event.stopPropagation(); openMovieModal(${movie.id})">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="movie-rating">
                    <i class="fas fa-star"></i> ${rating}
                </div>
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${escapeHtml(movie.title)}</h3>
                <span class="movie-date">${year}</span>
            </div>
        </div>
    `;
}

function displayMovies(movies) {
    if (!movies || movies.length === 0) {
        resultsDiv.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-film"></i>
                <h3>لا توجد أفلام</h3>
                <p>لم نتمكن من العثور على أفلام مطابقة</p>
                <button class="refresh-btn" onclick="location.reload()" style="margin-top: 1rem;">
                    <i class="fas fa-sync-alt"></i> إعادة المحاولة
                </button>
            </div>
        `;
        resultsCountSpan.textContent = '0';
        return;
    }
    
    resultsDiv.innerHTML = movies.map((movie, i) => createMovieCard(movie, i)).join('');
    resultsCountSpan.textContent = movies.length;
    
    // Add click events
    document.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', () => {
            const movieData = JSON.parse(card.dataset.movie);
            openMovieModal(movieData.id);
        });
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ============================================
// API Functions (Media)
// ============================================
function fetchMovieTrailer(movieId) {
    fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`, options)
        .then(response => response.json())
        .then(data => {
            const trailer = data.results?.find(video => video.type === 'Trailer' && video.site === 'YouTube');
            if (trailer) {
                window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
            } else {
                alert('عذراً، لا يتوفر إعلان لهذا الفيلم حالياً');
            }
        })
        .catch(err => {
            console.error(err);
            alert('حدث خطأ أثناء محاولة جلب الإعلان');
        });
}

function fetchMovieDetails(movieId) {
    fetch(`https://api.themoviedb.org/3/movie/${movieId}?language=en-US`, options)
        .then(response => response.json())
        .then(movie => updateModalContent(movie))
        .catch(err => console.error(err));
}

// ============================================
// Modal Functions
// ============================================
function openMovieModal(movieId) {
    currentMovieId = movieId;
    fetchMovieDetails(movieId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

window.openMovieModal = openMovieModal;

function updateModalContent(movie) {
    const posterPath = movie.poster_path ? `${BASE_IMAGE_URL}${movie.poster_path}` : 'https://placehold.co/500x750/2A2D7C/FFFFFF?text=No+Poster';
    const year = movie.release_date ? movie.release_date.split('-')[0] : 'قريباً';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'غير متاح';
    const runtime = movie.runtime || 'غير محدد';
    
    modalPoster.src = posterPath;
    modalPoster.alt = movie.title;
    modalTitle.textContent = movie.title;
    modalDate.textContent = year;
    modalRating.textContent = rating;
    modalRuntime.textContent = runtime;
    modalOverview.textContent = movie.overview || 'عذراً، لا يتوفر وصف لهذا الفيلم حالياً.';
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentMovieId = null;
}

// ============================================
// Theme & Mobile Menu Functions
// ============================================
function toggleTheme() {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    const icon = themeToggle.querySelector('i');
    icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
    
    if (mobileThemeToggle) {
        mobileThemeToggle.innerHTML = isLight ? 
            '<i class="fas fa-sun"></i><span>الوضع الفاتح</span>' : 
            '<i class="fas fa-moon"></i><span>الوضع الداكن</span>';
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light');
        themeToggle.querySelector('i').className = 'fas fa-sun';
        if (mobileThemeToggle) {
            mobileThemeToggle.innerHTML = '<i class="fas fa-sun"></i><span>الوضع الفاتح</span>';
        }
    }
}

function setupMobileMenu() {
    if (!hamburgerBtn) return;
    
    function openMenu() {
        mobileMenu.classList.add('active');
        mobileMenuOverlay.classList.add('active');
        hamburgerBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeMenu() {
        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        hamburgerBtn.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    hamburgerBtn.addEventListener('click', openMenu);
    closeMenuBtn.addEventListener('click', closeMenu);
    mobileMenuOverlay.addEventListener('click', closeMenu);
    
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) closeMenu();
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
    
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', toggleTheme);
    }
}

// Add CSS animation for notification
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);
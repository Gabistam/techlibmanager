// public/js/main.js

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation des tooltips Bootstrap
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Gestion des filtres de la liste des livres
    const setupFilters = () => {
        const categoryFilter = document.getElementById('categoryFilter');
        const statusFilter = document.getElementById('statusFilter');
        const searchInput = document.getElementById('searchInput');

        if (categoryFilter && statusFilter && searchInput) {
            const filterBooks = () => {
                const category = categoryFilter.value.toLowerCase();
                const status = statusFilter.value;
                const search = searchInput.value.toLowerCase();

                document.querySelectorAll('.book-card').forEach(book => {
                    const bookCategory = book.dataset.category.toLowerCase();
                    const bookStatus = book.dataset.status;
                    const bookTitle = book.dataset.title.toLowerCase();
                    const bookAuthor = book.dataset.author.toLowerCase();

                    const matchesCategory = !category || bookCategory === category;
                    const matchesStatus = !status || bookStatus === status;
                    const matchesSearch = !search || 
                        bookTitle.includes(search) || 
                        bookAuthor.includes(search);

                    book.style.display = 
                        matchesCategory && matchesStatus && matchesSearch 
                            ? 'block' 
                            : 'none';
                });
            };

            categoryFilter.addEventListener('change', filterBooks);
            statusFilter.addEventListener('change', filterBooks);
            searchInput.addEventListener('input', filterBooks);
        }
    };

    // Système de notation
    const setupRating = () => {
        const ratingContainer = document.querySelector('.rating');
        if (ratingContainer) {
            const stars = ratingContainer.querySelectorAll('input');
            stars.forEach(star => {
                star.addEventListener('change', function() {
                    // Mise à jour visuelle des étoiles
                    const value = this.value;
                    stars.forEach(s => {
                        const label = s.nextElementSibling;
                        if (s.value <= value) {
                            label.querySelector('i').classList.add('text-warning');
                        } else {
                            label.querySelector('i').classList.remove('text-warning');
                        }
                    });
                });
            });
        }
    };

    // Auto-disparition des messages flash
    const setupFlashMessages = () => {
        document.querySelectorAll('.alert').forEach(alert => {
            setTimeout(() => {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }, 5000);
        });
    };

    // Confirmation de suppression
    const setupDeleteConfirmation = () => {
        const deleteModal = document.getElementById('deleteModal');
        if (deleteModal) {
            deleteModal.addEventListener('show.bs.modal', function(event) {
                const button = event.relatedTarget;
                const bookId = button.getAttribute('data-book-id');
                const bookTitle = button.getAttribute('data-book-title');
                
                const modalTitle = deleteModal.querySelector('.modal-title');
                const modalBody = deleteModal.querySelector('.modal-body p');
                const form = deleteModal.querySelector('form');
                
                modalTitle.textContent = `Supprimer "${bookTitle}"`;
                modalBody.textContent = `Êtes-vous sûr de vouloir supprimer "${bookTitle}" ?`;
                form.action = `/books/${bookId}/delete`;
            });
        }
    };

    // Charts pour le dashboard
    const setupDashboardCharts = () => {
        const categoryChart = document.getElementById('categoryChart');
        if (categoryChart) {
            const ctx = categoryChart.getContext('2d');
            const gradients = [
                ctx.createLinearGradient(0, 0, 0, 200),
                ctx.createLinearGradient(0, 0, 0, 200),
                ctx.createLinearGradient(0, 0, 0, 200),
                ctx.createLinearGradient(0, 0, 0, 200),
                ctx.createLinearGradient(0, 0, 0, 200)
            ];

            gradients[0].addColorStop(0, 'rgba(78, 115, 223, 0.8)');
            gradients[0].addColorStop(1, 'rgba(78, 115, 223, 0.2)');
            
            // Configuration existante du graphique...
        }
    };

    // Initialisation de toutes les fonctionnalités
    setupFilters();
    setupRating();
    setupFlashMessages();
    setupDeleteConfirmation();
    setupDashboardCharts();
});
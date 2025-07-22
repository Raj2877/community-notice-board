document.addEventListener('DOMContentLoaded', () => {

    // --- STATE & CONSTANTS ---
    let isAdmin = false;
    const ADMIN_PASSWORD = 'admin';

    const initialData = {
        announcements: [
            { id: 1, title: 'Annual Society Meeting', date: '2025-07-28', description: 'Join us for the annual society meeting to discuss upcoming developments and maintenance schedules.', author: 'Society Committee', priority: 'high' },
            { id: 2, title: 'Water Supply Maintenance', date: '2025-07-24', description: 'Water supply will be interrupted on Saturday from 10 AM to 2 PM for routine maintenance.', author: 'Maintenance Team', priority: 'medium' },
            { id: 3, title: 'Gardening Club Meetup', date: '2025-07-22', description: 'Let\'s get together to plant new seasonal flowers in the community garden.', author: 'Jane Doe', priority: 'low' }
        ],
        events: [
            { id: Date.now() + 1, name: 'Summer Fest 2025', date: '2025-08-05', location: 'Community Park', notes: 'Food, music, and games for everyone.' },
            { id: Date.now() + 2, name: 'Independence Day Celebration', date: '2025-08-15', location: 'Main Courtyard', notes: 'Flag hoisting at 9 AM followed by cultural programs.' }
        ],
        marketplace: [
            { id: Date.now() + 3, item: 'Study Table', description: 'Wooden study table in good condition.', contact: 'R. Sharma - Flat 304' },
            { id: Date.now() + 4, item: 'Microwave Oven', description: 'LG Microwave, 2 years old, working perfectly.', contact: 'A. Singh - Flat 101' }
        ],
        contacts: [
            { id: Date.now() + 5, name: 'Security Main Gate', info: '987-654-3210' },
            { id: Date.now() + 6, name: 'Society Office', info: '987-654-3211' },
            { id: Date.now() + 7, name: 'Emergency Services', info: '112' }
        ]
    };

    // --- DOM SELECTORS ---
    const navLinks = document.querySelectorAll('.nav-link');
    const heroBtns = document.querySelectorAll('.hero-btn');
    const pages = document.querySelectorAll('.page');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const adminModal = document.getElementById('admin-modal');
    const formModal = document.getElementById('form-modal');
    const closeAdminModal = document.getElementById('close-admin-modal');
    const closeFormModal = document.getElementById('close-form-modal');
    const announcementSearch = document.getElementById('announcement-search');
    const priorityFilter = document.getElementById('priority-filter');
    const entryForm = document.getElementById('entry-form');
    
    // --- LOCALSTORAGE & DATA ---
    const getFromStorage = (key) => {
        const data = localStorage.getItem(key);
        if (!data || JSON.parse(data).length === 0) {
            const defaultData = initialData[key] || [];
            localStorage.setItem(key, JSON.stringify(defaultData));
            return defaultData;
        }
        return JSON.parse(data);
    };

    const saveToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

    // --- RENDER FUNCTIONS ---
    const renderAnnouncements = () => {
        const searchTerm = announcementSearch.value.toLowerCase();
        const priority = priorityFilter.value;
        const announcements = getFromStorage('announcements');
        
        const filtered = announcements.filter(post => {
            const matchesSearch = post.title.toLowerCase().includes(searchTerm) || post.description.toLowerCase().includes(searchTerm);
            const matchesPriority = priority === 'all' || post.priority === priority;
            return matchesSearch && matchesPriority;
        }).sort((a,b) => new Date(b.date) - new Date(a.date));

        const container = document.getElementById('announcements-list');
        container.innerHTML = filtered.length ? filtered.map(post => `
            <div class="list-card">
                <div class="list-card-header">
                    <h3 class="list-card-title">
                        <i class="fas fa-exclamation-triangle" style="color: var(--priority-${post.priority}-text);"></i>
                        ${post.title}
                    </h3>
                    <span class="priority-tag priority-${post.priority}">${post.priority} priority</span>
                </div>
                <div class="list-card-meta">
                    <span><i class="fas fa-user"></i> ${post.author}</span>
                    <span><i class="fas fa-calendar-day"></i> ${new Date(post.date).toLocaleDateString()}</span>
                </div>
                <p class="list-card-description">${post.description}</p>
                ${isAdmin ? `<button class="delete-btn" data-id="${post.id}" data-type="announcements"><i class="fas fa-trash-alt"></i></button>` : ''}
            </div>
        `).join('') : '<p style="text-align:center; padding: 2rem;">No announcements found matching your criteria.</p>';
    };
    
    const renderGenericList = (type, containerId, titleKey, dateKey, details) => {
        const items = getFromStorage(type);
        const container = document.getElementById(containerId);
        container.innerHTML = items.length ? items.sort((a, b) => dateKey ? new Date(b[dateKey]) - new Date(a[dateKey]) : 0).map(item => `
            <div class="list-card">
                 <h3 class="list-card-title">${item[titleKey]}</h3>
                 <div class="list-card-meta">
                     ${dateKey ? `<span><i class="fas fa-calendar-day"></i> ${new Date(item[dateKey]).toLocaleDateString()}</span>` : ''}
                     ${details(item)}
                 </div>
                 <p class="list-card-description">${item.notes || item.description || ''}</p>
                 ${isAdmin ? `<button class="delete-btn" data-id="${item.id}" data-type="${type}"><i class="fas fa-trash-alt"></i></button>` : ''}
            </div>
        `).join('') : `<p style="text-align:center; padding: 2rem;">No items to display.</p>`;
    };
    
    const renderHomePage = () => {
        const summaryData = {
            announcements: { icon: 'fa-bullhorn', color: '#3b82f6' },
            events: { icon: 'fa-calendar-alt', color: '#f59e0b' },
            marketplace: { icon: 'fa-store', color: '#10b981' },
            contacts: { icon: 'fa-address-book', color: '#8b5cf6' }
        };

        for (const [key, value] of Object.entries(summaryData)) {
            const data = getFromStorage(key);
            const container = document.getElementById(`${key}-summary`);
            if (container) {
                container.innerHTML = `
                    <div class="icon" style="background-color: ${value.color}20; color: ${value.color};">
                        <i class="fas ${value.icon}"></i>
                    </div>
                    <div class="count">${data.length}</div>
                    <div class="title">${key.charAt(0).toUpperCase() + key.slice(1)}</div>
                `;
            }
        }
    };
    
    const renderAll = () => {
        renderHomePage();
        renderAnnouncements();
        renderGenericList('events', 'events-list', 'name', 'date', item => `<span><i class="fas fa-map-marker-alt"></i> ${item.location}</span>`);
        renderGenericList('marketplace', 'marketplace-list', 'item', null, item => `<span><i class="fas fa-user-circle"></i> ${item.contact}</span>`);
        renderGenericList('contacts', 'contacts-list', 'name', null, item => `<span><i class="fas fa-phone"></i> ${item.info}</span>`);
    };

    // --- NAVIGATION ---
    const switchPage = (pageId) => {
        pages.forEach(p => p.classList.remove('active'));
        document.getElementById(`page-${pageId}`).classList.add('active');
        navLinks.forEach(l => l.classList.toggle('active', l.dataset.page === pageId));
        window.scrollTo(0, 0); // Scroll to top on page change
    };

    [...navLinks, ...heroBtns].forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage(link.dataset.page);
        });
    });

    // --- ADMIN & FORMS LOGIC ---
    const setAdminMode = (enabled) => {
        isAdmin = enabled;
        document.body.classList.toggle('admin-mode', enabled);
        adminLoginBtn.classList.toggle('hidden', enabled);
        adminLogoutBtn.classList.toggle('hidden', !enabled);
        if(adminModal) adminModal.style.display = 'none';
        renderAll();
    };

    const formFields = {
        announcement: `
            <input type="text" name="title" placeholder="Title" required>
            <input type="text" name="author" placeholder="Author (e.g., Society Committee)" required>
            <input type="date" name="date" required>
            <select name="priority" required>
                <option value="" disabled selected>Select Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
            </select>
            <textarea name="description" placeholder="Description" rows="4" required></textarea>
            <button type="submit">Post Announcement</button>
        `,
        event: `
            <input type="text" name="name" placeholder="Event Name" required>
            <input type="date" name="date" required>
            <input type="text" name="location" placeholder="Location" required>
            <textarea name="notes" placeholder="Additional Notes" rows="4"></textarea>
            <button type="submit">Add Event</button>
        `,
        listing: `
            <input type="text" name="item" placeholder="Item Name" required>
            <input type="text" name="contact" placeholder="Contact Person & Flat No." required>
            <textarea name="description" placeholder="Item Description" rows="4" required></textarea>
            <button type="submit">Create Listing</button>
        `,
        contact: `
            <input type="text" name="name" placeholder="Service / Person Name" required>
            <input type="text" name="info" placeholder="Contact Number or Email" required>
            <button type="submit">Add Contact</button>
        `
    };

    entryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = e.target.dataset.type;
        const formData = new FormData(e.target);
        const newItem = { id: Date.now() };
        for (let [key, value] of formData.entries()) {
            newItem[key] = value.trim();
        }
        
        const storageKey = type === 'listing' ? 'marketplace' : (type === 'contact' ? 'contacts' : type + 's');
        const data = getFromStorage(storageKey);
        data.push(newItem);
        saveToStorage(storageKey, data);
        
        formModal.style.display = 'none';
        renderAll();
    });
    
    document.querySelector('main').addEventListener('click', e => {
        // Add button logic
        const addBtn = e.target.closest('.add-btn');
        if (isAdmin && addBtn) {
            const formType = addBtn.dataset.form;
            document.getElementById('form-title').textContent = `New ${formType.charAt(0).toUpperCase() + formType.slice(1)}`;
            entryForm.innerHTML = formFields[formType];
            entryForm.dataset.type = formType;
            formModal.style.display = 'flex';
        }
        
        // Delete button logic
        const deleteBtn = e.target.closest('.delete-btn');
        if (isAdmin && deleteBtn && confirm('Are you sure you want to delete this item?')) {
            const id = parseInt(deleteBtn.dataset.id);
            const type = deleteBtn.dataset.type;
            let data = getFromStorage(type);
            saveToStorage(type, data.filter(item => item.id !== id));
            renderAll();
        }
    });

    // --- EVENT LISTENERS ---
    adminLoginBtn.addEventListener('click', () => adminModal.style.display = 'flex');
    adminLogoutBtn.addEventListener('click', () => setAdminMode(false));
    closeAdminModal.addEventListener('click', () => adminModal.style.display = 'none');
    closeFormModal.addEventListener('click', () => formModal.style.display = 'none');
    
    document.getElementById('admin-submit-btn').addEventListener('click', () => {
        if(document.getElementById('admin-password').value === ADMIN_PASSWORD) {
            setAdminMode(true);
        } else {
            document.getElementById('admin-error').textContent = 'Incorrect password.';
        }
    });

    announcementSearch.addEventListener('input', renderAnnouncements);
    priorityFilter.addEventListener('change', renderAnnouncements);
    
    // --- INITIALIZATION ---
    const init = () => {
        renderAll();
        // QR Code generation
        const qrImg = document.getElementById('qr-code');
        if(qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`;
    };

    init();
});
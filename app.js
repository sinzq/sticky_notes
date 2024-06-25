document.getElementById('loginForm').addEventListener('submit', login);
document.getElementById('registerForm').addEventListener('submit', register);
document.getElementById('addNoteBtn').addEventListener('click', addNote);
document.getElementById('logoutBtn').addEventListener('click', logout);

function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTitle = document.getElementById('authTitle');
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        authTitle.textContent = 'Login';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        authTitle.textContent = 'Register';
    }
}

function register(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    if (localStorage.getItem(username)) {
        alert('Username already exists');
        return;
    }

    localStorage.setItem(username, JSON.stringify({ password, notes: [] }));
    alert('Registration successful');
    toggleForms();
}

function login(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const user = JSON.parse(localStorage.getItem(username));

    if (!user || user.password !== password) {
        alert('Invalid username or password');
        return;
    }

    sessionStorage.setItem('loggedInUser', username);
    showNoteApp();
}

function logout() {
    sessionStorage.removeItem('loggedInUser');
    location.reload();
}

function showNoteApp() {
    document.getElementById('authForms').style.display = 'none';
    document.getElementById('noteApp').style.display = 'block';
    loadNotes();
}

function addNote() {
    const note = createNoteElement();
    document.body.appendChild(note);
    makeDraggable(note);
    saveNotes();
}

function createNoteElement(noteData = {}) {
    const note = document.createElement('div');
    note.className = 'note';
    const date = noteData.date || new Date().toLocaleString();
    const title = noteData.title || '';
    const content = noteData.content || '';
    const color = noteData.color || '#fffa65';
    note.style.backgroundColor = color;
    note.innerHTML = `
            <div class="date">${date}</div>
            <input type="text" placeholder="Title" value="${title}">
            <textarea>${content}</textarea>
            <button onclick="deleteNote(this)">Delete</button>
            <select class="color-select" onchange="changeColor(this)">
                <option value="#fffa65" ${color === '#fffa65' ? 'selected' : ''}>Yellow</option>
                <option value="#ff9a9a" ${color === '#ff9a9a' ? 'selected' : ''}>Red</option>
                <option value="#9aff9a" ${color === '#9aff9a' ? 'selected' : ''}>Green</option>
                <option value="#9ad0ff" ${color === '#9ad0ff' ? 'selected' : ''}>Blue</option>
            </select>
        `;
    return note;
}

function deleteNote(button) {
    const note = button.parentElement;
    document.body.removeChild(note);
    saveNotes();
}

function changeColor(select) {
    const note = select.parentElement;
    note.style.backgroundColor = select.value;
    saveNotes();
}

function makeDraggable(element) {
    let offsetX, offsetY;

    element.addEventListener('mousedown', (e) => {
        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', move);
            saveNotes();
        });
    });

    function move(e) {
        element.style.left = e.clientX - offsetX + 'px';
        element.style.top = e.clientY - offsetY + 'px';
    }
}

function saveNotes() {
    const username = sessionStorage.getItem('loggedInUser');
    const user = JSON.parse(localStorage.getItem(username));

    const notes = [];
    document.querySelectorAll('.note').forEach(note => {
        notes.push({
            date: note.querySelector('.date').textContent,
            title: note.querySelector('input').value,
            content: note.querySelector('textarea').value,
            color: note.style.backgroundColor,
            left: note.style.left,
            top: note.style.top
        });
    });

    user.notes = notes;
    localStorage.setItem(username, JSON.stringify(user));
}

function loadNotes() {
    const username = sessionStorage.getItem('loggedInUser');
    const user = JSON.parse(localStorage.getItem(username));

    user.notes.forEach(noteData => {
        const note = createNoteElement(noteData);
        note.style.left = noteData.left;
        note.style.top = noteData.top;
        document.body.appendChild(note);
        makeDraggable(note);
    });
}

window.onload = function () {
    if (sessionStorage.getItem('loggedInUser')) {
        showNoteApp();
    } else {
        document.getElementById('authForms').style.display = 'block';
        document.getElementById('loginForm').style.display = 'block';
    }
};
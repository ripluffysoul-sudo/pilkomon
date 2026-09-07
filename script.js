// Configuração do seu projeto no Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDGxB0esrym4rqKXVXkqmgytnjz6I2wakg",
    authDomain: "pilkomon.firebaseapp.com",
    projectId: "pilkomon",
    storageBucket: "pilkomon.firebasestorage.app",
    messagingSenderId: "810138694034",
    appId: "810138694034"
};

// Inicializando Firebase e Serviços
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const storage = firebase.storage();

const statusMsg = document.getElementById('status-msg');

// Monitor de Sessão de Usuário
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('logged-out-view').style.display = 'none';
        document.getElementById('logged-in-view').style.display = 'block';
        document.getElementById('user-email').innerText = `Conta: ${user.email}`;
    } else {
        document.getElementById('logged-out-view').style.display = 'block';
        document.getElementById('logged-in-view').style.display = 'none';
    }
});

// Criar Conta
document.getElementById('btn-signup').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => alert('Conta criada com sucesso!'))
        .catch(error => alert('Erro no cadastro: ' + error.message));
});

// Fazer Login
document.getElementById('btn-login').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => alert('Erro ao entrar: ' + error.message));
});

// Sair da Conta
document.getElementById('btn-logout').addEventListener('click', () => {
    auth.signOut();
});

// 1. ENVIAR O SAVE STATE PARA A NUVEM
document.getElementById('save-file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const user = auth.currentUser;

    if (!file || !user) return;

    statusMsg.innerText = "Enviando Save para a nuvem...";

    // Salva o arquivo no Firebase Storage na pasta do ID do usuário
    const storageRef = storage.ref(`saves/${user.uid}/mario_save.state`);
    storageRef.put(file).then(() => {
        statusMsg.innerText = "✅ Save enviado com sucesso para a nuvem!";
    }).catch(err => {
        statusMsg.innerText = "❌ Erro ao enviar: " + err.message;
    });
});

// 2. BAIXAR O SAVE STATE DA NUVEM
document.getElementById('btn-download-save').addEventListener('click', () => {
    const user = auth.currentUser;
    if (!user) return;

    statusMsg.innerText = "Buscando o seu Save na nuvem...";

    const storageRef = storage.ref(`saves/${user.uid}/mario_save.state`);
    storageRef.getDownloadURL().then((url) => {
        // Cria um link temporário para forçar o download no navegador
        const a = document.createElement('a');
        a.href = url;
        a.download = "mario_save.state";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        statusMsg.innerText = "✅ Save baixado! Agora recarregue-o no menu do emulador.";
    }).catch(err => {
        statusMsg.innerText = "❌ Nenhum save encontrado na sua conta.";
    });
});

// Inicialização do EmulatorJS ao carregar a ROM
document.getElementById('rom-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    document.getElementById('file-uploader').style.display = 'none';

    window.EJS_player = '#game';
    window.EJS_core = 'snes';
    window.EJS_gameUrl = URL.createObjectURL(file);
    window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';

    const script = document.createElement('script');
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    document.body.appendChild(script);
});

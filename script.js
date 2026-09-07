// 1. Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDGxB0esrym4rqKXVXkqmgytnjz6I2wakg",
  authDomain: "pilkomon.firebaseapp.com",
  projectId: "pilkomon",
  storageBucket: "pilkomon.firebasestorage.app",
  messagingSenderId: "810138694034",
  appId: "1:810138694034:web:7d431e935703ddbffa914b",
  measurementId: "G-DNCW8719QV"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const storage = firebase.storage();

// 2. Elementos DOM
const loggedOutView = document.getElementById('logged-out-view');
const loggedInView = document.getElementById('logged-in-view');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const userEmailText = document.getElementById('user-email');
const statusMsg = document.getElementById('status-msg');

const btnLogin = document.getElementById('btn-login');
const btnSignup = document.getElementById('btn-signup');
const btnLogout = document.getElementById('btn-logout');
const saveFileInput = document.getElementById('save-file-input');
const btnDownloadSave = document.getElementById('btn-download-save');
const romInput = document.getElementById('rom-input');

// 3. Status da Sessão
auth.onAuthStateChanged((user) => {
  if (user) {
    loggedOutView.style.display = 'none';
    loggedInView.style.display = 'block';
    userEmailText.textContent = user.email;
  } else {
    loggedOutView.style.display = 'block';
    loggedInView.style.display = 'none';
    userEmailText.textContent = '';
  }
});

// 4. Cadastro
btnSignup.addEventListener('click', () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    statusMsg.textContent = 'Preencha e-mail e senha.';
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      statusMsg.textContent = 'Conta criada com sucesso!';
    })
    .catch((error) => {
      if (error.code === 'auth/weak-password') {
        statusMsg.textContent = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (error.code === 'auth/invalid-email') {
        statusMsg.textContent = 'E-mail inválido.';
      } else if (error.code === 'auth/email-already-in-use') {
        statusMsg.textContent = 'E-mail já está em uso.';
      } else {
        statusMsg.textContent = 'Erro ao cadastrar: ' + error.message;
      }
    });
});

// 5. Login
btnLogin.addEventListener('click', () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      statusMsg.textContent = 'Login efetuado com sucesso!';
    })
    .catch((error) => {
      statusMsg.textContent = 'Erro ao entrar: ' + error.message;
    });
});

// 6. Logout
btnLogout.addEventListener('click', () => {
  auth.signOut();
  statusMsg.textContent = 'Desconectado.';
});

// 7. Salvar Save na Nuvem
saveFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const user = auth.currentUser;

  if (!file || !user) return;

  statusMsg.textContent = 'Enviando save...';
  const storageRef = storage.ref(`saves/${user.uid}/${file.name}`);

  storageRef.put(file)
    .then(() => {
      statusMsg.textContent = 'Save enviado com sucesso!';
    })
    .catch((error) => {
      statusMsg.textContent = 'Erro ao enviar save: ' + error.message;
    });
});

// 8. Baixar Save
btnDownloadSave.addEventListener('click', () => {
  const user = auth.currentUser;
  if (!user) return;

  const storageRef = storage.ref(`saves/${user.uid}`);

  storageRef.listAll()
    .then((res) => {
      if (res.items.length === 0) {
        statusMsg.textContent = 'Nenhum save encontrado na nuvem.';
        return;
      }
      return res.items[0].getDownloadURL();
    })
    .then((url) => {
      if (url) {
        window.open(url, '_blank');
        statusMsg.textContent = 'Download iniciado!';
      }
    })
    .catch((error) => {
      statusMsg.textContent = 'Erro ao buscar save: ' + error.message;
    });
});

// 9. Carregar a ROM no Emulador EmuladorJS
romInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  statusMsg.textContent = 'Carregando o jogo...';

  // Configurações Globais do EmulatorJS
  window.EJS_player = '#game';
  window.EJS_core = 'snes';
  window.EJS_gameName = file.name;
  window.EJS_color = '#e52521';
  window.EJS_startOnLoaded = true;
  window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
  window.EJS_gameUrl = URL.createObjectURL(file);

  // Injeta dinamicamente o leitor do emulador
  const loaderScript = document.createElement('script');
  loaderScript.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
  loaderScript.onload = () => {
    document.getElementById('file-uploader').style.display = 'none';
    statusMsg.textContent = 'Jogo carregado com sucesso!';
  };
  document.body.appendChild(loaderScript);
});

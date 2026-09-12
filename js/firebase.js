// ============================================================
// SAMIRA BEAUTY — FIREBASE
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyBlZbLY7AiVtiFwXkmkRJC_63Gq-69b3uY",
    authDomain: "samybeauty-2018f.firebaseapp.com",
    projectId: "samybeauty-2018f",
    storageBucket: "samybeauty-2018f.firebasestorage.app",
    messagingSenderId: "321223727737",
    appId: "1:321223727737:web:52a6bd336dc0c777e612a8",
    measurementId: "G-23C1XZQ4GN"
};

// ============================================================
// INICIALIZAÇÃO
// ============================================================

try {

    if (typeof firebase === "undefined") {
        throw new Error(
            "O SDK do Firebase não foi carregado."
        );
    }

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    // Authentication
    const auth = firebase.auth();

    // Firestore
    const db = firebase.firestore();

    // Storage será ativado posteriormente
    let storage = null;

    if (typeof firebase.storage === "function") {
        storage = firebase.storage();
    }

    // Disponibiliza os serviços para os outros arquivos
    window.samiraFirebase = {
        app: firebase.app(),
        auth,
        db,
        storage,
        config: firebaseConfig
    };

    console.log("Samira Beauty: Firebase conectado com sucesso.");

} catch (error) {

    console.error(
        "Erro ao inicializar Firebase:",
        error
    );

    window.samiraFirebase = {
        app: null,
        auth: null,
        db: null,
        storage: null,
        config: firebaseConfig,
        error
    };
}

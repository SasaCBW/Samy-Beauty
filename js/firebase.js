/* =========================================================
   SAMIRA BEAUTY — CONFIGURAÇÃO FIREBASE
   ========================================================= */

/*
   IMPORTANTE:

   Antes de usar o sistema online, coloque aqui os dados
   do seu próprio projeto Firebase.

   No Firebase:
   Projeto > Configurações do projeto >
   Seus apps > Aplicativo da Web
*/

const firebaseConfig = {

    apiKey: "COLOQUE_SUA_API_KEY_AQUI",

    authDomain: "COLOQUE_SEU_AUTH_DOMAIN_AQUI",

    projectId: "COLOQUE_SEU_PROJECT_ID_AQUI",

    storageBucket: "COLOQUE_SEU_STORAGE_BUCKET_AQUI",

    messagingSenderId: "COLOQUE_SEU_MESSAGING_SENDER_ID_AQUI",

    appId: "COLOQUE_SEU_APP_ID_AQUI"

};


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

if (
    typeof firebase !== "undefined" &&
    firebase.apps &&
    !firebase.apps.length
) {

    firebase.initializeApp(firebaseConfig);

}


/* =========================================================
   SERVIÇOS FIREBASE
   ========================================================= */

let db = null;
let auth = null;
let storage = null;


if (typeof firebase !== "undefined") {

    db = firebase.firestore();

    auth = firebase.auth();

    storage = firebase.storage();

}


/* =========================================================
   EXPORTAÇÃO
   ========================================================= */

window.samiraFirebase = {

    config: firebaseConfig,

    db: db,

    auth: auth,

    storage: storage

};

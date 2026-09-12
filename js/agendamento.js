/* =========================================================
   SAMIRA BEAUTY
   SISTEMA REAL DE AGENDAMENTO
   Firebase + horários protegidos
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const form = document.getElementById("appointmentForm");

    const serviceInput =
        document.getElementById("service");

    const dateInput =
        document.getElementById("appointmentDate");

    const timeGrid =
        document.getElementById("timeGrid");

    const timeInput =
        document.getElementById("appointmentTime");

    const nameInput =
        document.getElementById("clientName");

    const phoneInput =
        document.getElementById("clientPhone");

    const messageInput =
        document.getElementById("message");

    const summaryService =
        document.getElementById("summaryService");

    const summaryDate =
        document.getElementById("summaryDate");

    const summaryTime =
        document.getElementById("summaryTime");

    const confirmationSection =
        document.getElementById("confirmationSection");

    const confirmationService =
        document.getElementById("confirmationService");

    const confirmationDate =
        document.getElementById("confirmationDate");

    const confirmationTime =
        document.getElementById("confirmationTime");

    const whatsappConfirmation =
        document.getElementById("whatsappConfirmation");

    const floatingWhatsapp =
        document.getElementById("floatingWhatsapp");

    const currentYear =
        document.getElementById("currentYear");


    if (
        !form ||
        !serviceInput ||
        !dateInput ||
        !timeGrid ||
        !timeInput
    ) {

        console.error(
            "Samira Beauty: elementos do agendamento não encontrados."
        );

        return;
    }


    /* =====================================================
       FIREBASE
    ===================================================== */

    const firebaseServices =
        window.samiraFirebase || {};

    const db =
        firebaseServices.db || null;


    /* =====================================================
       CONFIGURAÇÕES
    ===================================================== */

    const WORK_START = 9;

    const WORK_END = 18;


    /*
       Coloque posteriormente o WhatsApp real da Samira.

       Exemplo:
       55 + DDD + número

       Não use espaços, parênteses ou traços.
    */

    const WHATSAPP_NUMBER =
        "5542999999999";


    /* =====================================================
       DATA MÍNIMA
    ===================================================== */

    function getToday() {

        const today = new Date();

        const year =
            today.getFullYear();

        const month =
            String(
                today.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                today.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }


    dateInput.min = getToday();


    /* =====================================================
       FORMATAR DATA
    ===================================================== */

    function formatDate(dateString) {

        if (!dateString) {
            return "—";
        }

        const [
            year,
            month,
            day
        ] = dateString.split("-");

        return `${day}/${month}/${year}`;

    }


    /* =====================================================
       VERIFICAR SEGUNDA A SEXTA
    ===================================================== */

    function isWorkingDay(dateString) {

        if (!dateString) {
            return false;
        }

        const [
            year,
            month,
            day
        ] = dateString
            .split("-")
            .map(Number);

        const date =
            new Date(
                year,
                month - 1,
                day
            );

        const weekday =
            date.getDay();

        return (
            weekday >= 1 &&
            weekday <= 5
        );

    }


    /* =====================================================
       ID DO HORÁRIO
    ===================================================== */

    function createSlotId(
        date,
        time
    ) {

        return (
            date +
            "_" +
            time.replace(":", "-")
        );

    }


    /* =====================================================
       HORÁRIOS DO DIA
    ===================================================== */

    function getAllTimes() {

        const times = [];

        for (
            let hour = WORK_START;
            hour < WORK_END;
            hour++
        ) {

            times.push(
                `${String(hour).padStart(2, "0")}:00`
            );

        }

        return times;

    }


    /* =====================================================
       CONSULTAR HORÁRIOS OCUPADOS
    ===================================================== */

    async function getOccupiedTimes(
        date
    ) {

        if (!db) {

            throw new Error(
                "Firebase não conectado."
            );

        }

        const snapshot =
            await db
                .collection("availability")
                .where(
                    "date",
                    "==",
                    date
                )
                .get();


        const occupied = [];


        snapshot.forEach(doc => {

            const data =
                doc.data();

            if (data.time) {

                occupied.push(
                    data.time
                );

            }

        });


        return occupied;

    }


    /* =====================================================
       PLACEHOLDER
    ===================================================== */

    function showTimeMessage(
        message
    ) {

        timeGrid.innerHTML = `

            <div class="time-placeholder">

                <i class="fa-regular fa-calendar"></i>

                <span>
                    ${message}
                </span>

            </div>

        `;

    }


    /* =====================================================
       CARREGAR HORÁRIOS
    ===================================================== */

    async function loadTimes() {

        const selectedDate =
            dateInput.value;


        timeInput.value = "";

        summaryTime.textContent = "—";


        if (!selectedDate) {

            showTimeMessage(
                "Primeiro escolha uma data"
            );

            return;

        }


        if (
            !isWorkingDay(
                selectedDate
            )
        ) {

            showTimeMessage(
                "Atendimento somente de segunda a sexta"
            );

            return;

        }


        if (!db) {

            showTimeMessage(
                "Firebase ainda não está conectado"
            );

            return;

        }


        showTimeMessage(
            "Carregando horários..."
        );


        try {

            const occupied =
                await getOccupiedTimes(
                    selectedDate
                );


            const times =
                getAllTimes();


            timeGrid.innerHTML = "";


            let availableCount = 0;


            times.forEach(time => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "time-option";


                if (
                    occupied.includes(time)
                ) {

                    button.disabled =
                        true;

                    button.classList.add(
                        "disabled"
                    );

                    button.innerHTML = `

                        <span>${time}</span>

                        <small>
                            Ocupado
                        </small>

                    `;

                } else {

                    availableCount++;


                    button.textContent =
                        time;


                    button.addEventListener(
                        "click",
                        () => {

                            selectTime(
                                button,
                                time
                            );

                        }
                    );

                }


                timeGrid.appendChild(
                    button
                );

            });


            if (
                availableCount === 0
            ) {

                showTimeMessage(
                    "Não há horários disponíveis neste dia"
                );

            }


        } catch (error) {

            console.error(
                "Erro ao buscar horários:",
                error
            );


            showTimeMessage(
                "Não foi possível carregar os horários"
            );

        }

    }


    /* =====================================================
       SELECIONAR HORÁRIO
    ===================================================== */

    function selectTime(
        button,
        time
    ) {

        document
            .querySelectorAll(
                ".time-option"
            )
            .forEach(item => {

                item.classList.remove(
                    "selected"
                );

            });


        button.classList.add(
            "selected"
        );


        timeInput.value =
            time;


        summaryTime.textContent =
            time;

    }


    /* =====================================================
       RESUMO
    ===================================================== */

    function updateSummary() {

        summaryService.textContent =
            serviceInput.value || "—";


        summaryDate.textContent =
            dateInput.value
                ? formatDate(
                    dateInput.value
                )
                : "—";


        summaryTime.textContent =
            timeInput.value || "—";

    }


    serviceInput.addEventListener(
        "change",
        updateSummary
    );


    dateInput.addEventListener(
        "change",
        async () => {

            timeInput.value = "";

            updateSummary();


            if (
                dateInput.value &&
                !isWorkingDay(
                    dateInput.value
                )
            ) {

                alert(
                    "A Samira atende somente de segunda a sexta-feira. 💗"
                );

                dateInput.value = "";

                updateSummary();

                showTimeMessage(
                    "Escolha uma data de segunda a sexta"
                );

                return;

            }


            await loadTimes();

        }
    );


    /* =====================================================
       FORMATAR WHATSAPP
    ===================================================== */

    phoneInput.addEventListener(
        "input",
        () => {

            let value =
                phoneInput.value.replace(
                    /\D/g,
                    ""
                );


            value =
                value.substring(
                    0,
                    11
                );


            if (
                value.length > 6
            ) {

                value =
                    `(${value.substring(0, 2)}) ` +
                    `${value.substring(2, 7)}-` +
                    `${value.substring(7)}`;

            } else if (
                value.length > 2
            ) {

                value =
                    `(${value.substring(0, 2)}) ` +
                    value.substring(2);

            }


            phoneInput.value =
                value;

        }
    );


    /* =====================================================
       BOTÃO CARREGANDO
    ===================================================== */

    function setLoading(
        loading
    ) {

        const button =
            form.querySelector(
                ".appointment-submit"
            );


        if (!button) {
            return;
        }


        if (loading) {

            button.disabled =
                true;


            button.dataset.original =
                button.innerHTML;


            button.innerHTML = `

                <i class="fa-solid fa-spinner fa-spin"></i>

                <span>
                    Reservando horário...
                </span>

            `;

        } else {

            button.disabled =
                false;


            if (
                button.dataset.original
            ) {

                button.innerHTML =
                    button.dataset.original;

            }

        }

    }


    /* =====================================================
       SALVAR AGENDAMENTO
       ATÔMICO
    ===================================================== */

    async function saveAppointment(
        appointment
    ) {

        if (!db) {

            throw new Error(
                "Firebase não conectado."
            );

        }


        const slotId =
            createSlotId(
                appointment.date,
                appointment.time
            );


        const availabilityRef =
            db
                .collection(
                    "availability"
                )
                .doc(slotId);


        const appointmentRef =
            db
                .collection(
                    "appointments"
                )
                .doc(slotId);


        /*
           As duas gravações acontecem juntas.

           Se o horário já existir, o Firestore
           rejeitará a reserva da cliente.
        */

        const batch =
            db.batch();


        batch.set(
            availabilityRef,
            {
                date:
                    appointment.date,

                time:
                    appointment.time,

                createdAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()
            }
        );


        batch.set(
            appointmentRef,
            {

                slotId:
                    slotId,

                clientName:
                    appointment.clientName,

                phone:
                    appointment.phone,

                service:
                    appointment.service,

                date:
                    appointment.date,

                time:
                    appointment.time,

                message:
                    appointment.message,

                status:
                    "pending",

                createdAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            }
        );


        await batch.commit();


        return slotId;

    }


    /* =====================================================
       MENSAGEM PARA WHATSAPP
    ===================================================== */

    function createWhatsAppMessage(
        appointment
    ) {

        let text =

            `Olá, Samira! 💗\n\n` +

            `Acabei de solicitar um agendamento pelo site.\n\n` +

            `✨ Serviço: ${appointment.service}\n` +

            `📅 Data: ${formatDate(appointment.date)}\n` +

            `🕐 Horário: ${appointment.time}\n` +

            `👤 Nome: ${appointment.clientName}\n` +

            `📱 WhatsApp: ${appointment.phone}`;


        if (
            appointment.message
        ) {

            text +=
                `\n\n💬 Observação: ${appointment.message}`;

        }


        text +=
            `\n\nAguardo a confirmação. 💕`;


        return text;

    }


    /* =====================================================
       ENVIO
    ===================================================== */

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (
                !form.checkValidity()
            ) {

                form.reportValidity();

                return;

            }


            if (
                !dateInput.value
            ) {

                alert(
                    "Escolha uma data."
                );

                return;

            }


            if (
                !isWorkingDay(
                    dateInput.value
                )
            ) {

                alert(
                    "Escolha um dia de segunda a sexta-feira."
                );

                return;

            }


            if (
                !timeInput.value
            ) {

                alert(
                    "Escolha um horário disponível."
                );

                return;

            }


            if (!db) {

                alert(
                    "Não foi possível conectar ao sistema de agendamento."
                );

                return;

            }


            const appointment = {

                clientName:
                    nameInput.value.trim(),

                phone:
                    phoneInput.value.trim(),

                service:
                    serviceInput.value,

                date:
                    dateInput.value,

                time:
                    timeInput.value,

                message:
                    messageInput.value.trim()

            };


            setLoading(true);


            try {

                /*
                   Verificação visual extra.
                   A segurança real acontece no batch.
                */

                const occupied =
                    await getOccupiedTimes(
                        appointment.date
                    );


                if (
                    occupied.includes(
                        appointment.time
                    )
                ) {

                    alert(
                        "Esse horário acabou de ser reservado por outra cliente. Escolha outro horário. 💗"
                    );


                    await loadTimes();

                    return;

                }


                await saveAppointment(
                    appointment
                );


                /* -----------------------------------------
                   CONFIRMAÇÃO
                ----------------------------------------- */

                confirmationService.textContent =
                    appointment.service;


                confirmationDate.textContent =
                    formatDate(
                        appointment.date
                    );


                confirmationTime.textContent =
                    appointment.time;


                const whatsappMessage =
                    createWhatsAppMessage(
                        appointment
                    );


                if (
                    whatsappConfirmation
                ) {

                    whatsappConfirmation.href =
                        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                            whatsappMessage
                        )}`;

                }


                confirmationSection.hidden =
                    false;


                const appointmentSection =
                    document.querySelector(
                        ".appointment-section"
                    );


                if (
                    appointmentSection
                ) {

                    appointmentSection.style.display =
                        "none";

                }


                confirmationSection.scrollIntoView({
                    behavior:
                        "smooth",

                    block:
                        "start"
                });


            } catch (error) {

                console.error(
                    "Erro ao reservar:",
                    error
                );


                /*
                   Se duas clientes clicarem quase juntas,
                   uma consegue e a outra recebe esta mensagem.
                */

                alert(
                    "Não foi possível reservar esse horário. Ele pode ter acabado de ser ocupado. Atualize os horários e tente novamente. 💗"
                );


                await loadTimes();

            } finally {

                setLoading(false);

            }

        }
    );


    /* =====================================================
       WHATSAPP
    ===================================================== */

    if (
        floatingWhatsapp
    ) {

        floatingWhatsapp.href =
            `https://wa.me/${WHATSAPP_NUMBER}`;

    }


    /* =====================================================
       ANO
    ===================================================== */

    if (
        currentYear
    ) {

        currentYear.textContent =
            new Date().getFullYear();

    }


    /* =====================================================
       INICIALIZAÇÃO
    ===================================================== */

    showTimeMessage(
        "Primeiro escolha uma data"
    );

    updateSummary();

});

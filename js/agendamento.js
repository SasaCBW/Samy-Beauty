// ============================================================
// SAMIRA BEAUTY — SISTEMA DE AGENDAMENTO
// Firebase Firestore + controle de horários
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("appointmentForm");
    const serviceSelect = document.getElementById("service");
    const dateInput = document.getElementById("date");
    const timeContainer = document.getElementById("timeSlots");
    const selectedTimeInput = document.getElementById("selectedTime");
    const nameInput = document.getElementById("clientName");
    const whatsappInput = document.getElementById("clientWhatsapp");
    const messageInput = document.getElementById("clientMessage");

    const summaryService = document.getElementById("summaryService");
    const summaryDate = document.getElementById("summaryDate");
    const summaryTime = document.getElementById("summaryTime");

    const confirmation = document.getElementById("confirmation");
    const confirmationDetails = document.getElementById("confirmationDetails");

    const formMessage = document.getElementById("formMessage");
    const submitButton = form
        ? form.querySelector('button[type="submit"]')
        : null;

    // ------------------------------------------------------------
    // CONFIGURAÇÕES
    // ------------------------------------------------------------

    const START_HOUR = 9;
    const END_HOUR = 18;
    const SLOT_DURATION = 60;

    // Segunda a sexta
    const WORKING_DAYS = [1, 2, 3, 4, 5];

    // ------------------------------------------------------------
    // ELEMENTOS OBRIGATÓRIOS
    // ------------------------------------------------------------

    if (!form || !dateInput || !timeContainer) {
        console.warn("Elementos do formulário de agendamento não encontrados.");
        return;
    }

    // ------------------------------------------------------------
    // FIREBASE
    // ------------------------------------------------------------

    let db = null;

    function getFirebaseDatabase() {
        try {
            if (
                window.samiraFirebase &&
                window.samiraFirebase.db
            ) {
                return window.samiraFirebase.db;
            }
        } catch (error) {
            console.error("Erro ao acessar Firebase:", error);
        }

        return null;
    }

    db = getFirebaseDatabase();

    // ------------------------------------------------------------
    // DATA MÍNIMA
    // ------------------------------------------------------------

    function getLocalDateString(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    dateInput.min = getLocalDateString();

    // ------------------------------------------------------------
    // FORMATAÇÃO DE DATA
    // ------------------------------------------------------------

    function formatDate(dateString) {
        if (!dateString) return "Não informado";

        const parts = dateString.split("-");

        if (parts.length !== 3) {
            return dateString;
        }

        const [year, month, day] = parts;

        return `${day}/${month}/${year}`;
    }

    // ------------------------------------------------------------
    // HORÁRIOS
    // ------------------------------------------------------------

    function generateTimeSlots() {
        const slots = [];

        for (
            let hour = START_HOUR;
            hour < END_HOUR;
            hour += SLOT_DURATION / 60
        ) {
            const hours = String(hour).padStart(2, "0");
            slots.push(`${hours}:00`);
        }

        return slots;
    }

    const ALL_TIME_SLOTS = generateTimeSlots();

    // ------------------------------------------------------------
    // UTILIDADES
    // ------------------------------------------------------------

    function showMessage(message, type = "error") {
        if (!formMessage) return;

        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;

        formMessage.style.display = "block";
    }

    function hideMessage() {
        if (!formMessage) return;

        formMessage.textContent = "";
        formMessage.style.display = "none";
        formMessage.className = "form-message";
    }

    function setButtonLoading(loading) {
        if (!submitButton) return;

        if (loading) {
            submitButton.disabled = true;
            submitButton.dataset.originalText =
                submitButton.innerHTML;

            submitButton.innerHTML = `
                <span class="button-spinner"></span>
                Enviando agendamento...
            `;
        } else {
            submitButton.disabled = false;

            if (submitButton.dataset.originalText) {
                submitButton.innerHTML =
                    submitButton.dataset.originalText;
            }
        }
    }

    // ------------------------------------------------------------
    // VALIDAÇÃO DO DIA
    // ------------------------------------------------------------

    function isWorkingDay(dateString) {
        if (!dateString) return false;

        const date = new Date(`${dateString}T12:00:00`);
        const day = date.getDay();

        return WORKING_DAYS.includes(day);
    }

    // ------------------------------------------------------------
    // BUSCAR AGENDAMENTOS DO DIA
    // ------------------------------------------------------------

    async function getBookedTimes(dateString) {
        const bookedTimes = [];

        db = getFirebaseDatabase();

        // Se o Firebase ainda não estiver configurado,
        // usamos localStorage temporariamente.
        if (!db) {
            try {
                const localAppointments =
                    JSON.parse(
                        localStorage.getItem("samiraAppointments") || "[]"
                    );

                localAppointments.forEach((appointment) => {
                    if (
                        appointment.date === dateString &&
                        appointment.status !== "cancelled"
                    ) {
                        bookedTimes.push(appointment.time);
                    }
                });
            } catch (error) {
                console.error(
                    "Erro ao consultar agendamentos locais:",
                    error
                );
            }

            return bookedTimes;
        }

        try {
            const snapshot = await db
                .collection("appointments")
                .where("date", "==", dateString)
                .get();

            snapshot.forEach((doc) => {
                const data = doc.data();

                if (
                    data.status !== "cancelled" &&
                    data.time
                ) {
                    bookedTimes.push(data.time);
                }
            });

            return bookedTimes;
        } catch (error) {
            console.error(
                "Erro ao buscar horários ocupados:",
                error
            );

            return [];
        }
    }

    // ------------------------------------------------------------
    // RENDERIZAR HORÁRIOS
    // ------------------------------------------------------------

    async function renderTimeSlots() {
        const selectedDate = dateInput.value;

        selectedTimeInput.value = "";

        if (summaryTime) {
            summaryTime.textContent = "Selecione";
        }

        timeContainer.innerHTML = "";

        if (!selectedDate) {
            timeContainer.innerHTML = `
                <p class="time-placeholder">
                    Primeiro selecione uma data.
                </p>
            `;
            return;
        }

        if (!isWorkingDay(selectedDate)) {
            timeContainer.innerHTML = `
                <p class="time-placeholder">
                    Os atendimentos acontecem de segunda a sexta-feira.
                </p>
            `;

            showMessage(
                "Escolha um dia de segunda a sexta-feira.",
                "error"
            );

            return;
        }

        hideMessage();

        timeContainer.innerHTML = `
            <p class="time-placeholder">
                Carregando horários...
            </p>
        `;

        const bookedTimes = await getBookedTimes(selectedDate);

        timeContainer.innerHTML = "";

        ALL_TIME_SLOTS.forEach((time) => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "time-slot";
            button.dataset.time = time;
            button.textContent = time;

            if (bookedTimes.includes(time)) {
                button.classList.add("occupied");
                button.disabled = true;
                button.title = "Horário já reservado";

                button.innerHTML = `
                    <span>${time}</span>
                    <small>Ocupado</small>
                `;
            } else {
                button.addEventListener("click", () => {
                    selectTime(time);
                });
            }

            timeContainer.appendChild(button);
        });

        if (ALL_TIME_SLOTS.every((time) => bookedTimes.includes(time))) {
            timeContainer.innerHTML = `
                <p class="time-placeholder">
                    Não há horários disponíveis nesta data.
                    Escolha outro dia.
                </p>
            `;
        }
    }

    // ------------------------------------------------------------
    // SELECIONAR HORÁRIO
    // ------------------------------------------------------------

    function selectTime(time) {
        document
            .querySelectorAll(".time-slot")
            .forEach((button) => {
                button.classList.remove("selected");
            });

        const selectedButton = document.querySelector(
            `.time-slot[data-time="${time}"]`
        );

        if (selectedButton) {
            selectedButton.classList.add("selected");
        }

        selectedTimeInput.value = time;

        if (summaryTime) {
            summaryTime.textContent = time;
        }

        hideMessage();
    }

    // ------------------------------------------------------------
    // RESUMO DO AGENDAMENTO
    // ------------------------------------------------------------

    function updateSummary() {
        if (summaryService) {
            const selectedOption =
                serviceSelect.options[serviceSelect.selectedIndex];

            summaryService.textContent =
                selectedOption && selectedOption.value
                    ? selectedOption.textContent
                    : "Selecione";
        }

        if (summaryDate) {
            summaryDate.textContent = dateInput.value
                ? formatDate(dateInput.value)
                : "Selecione";
        }

        if (summaryTime) {
            summaryTime.textContent =
                selectedTimeInput.value || "Selecione";
        }
    }

    // ------------------------------------------------------------
    // NORMALIZAR WHATSAPP
    // ------------------------------------------------------------

    function normalizeWhatsapp(number) {
        return number
            .replace(/\D/g, "")
            .trim();
    }

    // ------------------------------------------------------------
    // SALVAR LOCALMENTE
    // ------------------------------------------------------------

    function saveLocalAppointment(appointment) {
        try {
            const appointments =
                JSON.parse(
                    localStorage.getItem("samiraAppointments") || "[]"
                );

            appointments.push(appointment);

            localStorage.setItem(
                "samiraAppointments",
                JSON.stringify(appointments)
            );

            return true;
        } catch (error) {
            console.error(
                "Erro ao salvar agendamento local:",
                error
            );

            return false;
        }
    }

    // ------------------------------------------------------------
    // SALVAR NO FIREBASE
    // ------------------------------------------------------------

    async function saveAppointment(appointment) {
        db = getFirebaseDatabase();

        if (!db) {
            saveLocalAppointment({
                ...appointment,
                id: `local_${Date.now()}`,
                createdAt: new Date().toISOString(),
                status: "pending"
            });

            return {
                success: true,
                local: true,
                id: `local_${Date.now()}`
            };
        }

        try {
            // Verificação extra contra agendamento duplicado
            const existingSnapshot = await db
                .collection("appointments")
                .where("date", "==", appointment.date)
                .where("time", "==", appointment.time)
                .get();

            let alreadyBooked = false;

            existingSnapshot.forEach((doc) => {
                const data = doc.data();

                if (data.status !== "cancelled") {
                    alreadyBooked = true;
                }
            });

            if (alreadyBooked) {
                return {
                    success: false,
                    occupied: true
                };
            }

            const docRef = await db
                .collection("appointments")
                .add({
                    name: appointment.name,
                    whatsapp: appointment.whatsapp,
                    service: appointment.service,
                    date: appointment.date,
                    time: appointment.time,
                    message: appointment.message || "",
                    status: "pending",
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            return {
                success: true,
                local: false,
                id: docRef.id
            };
        } catch (error) {
            console.error(
                "Erro ao salvar agendamento no Firebase:",
                error
            );

            throw error;
        }
    }

    // ------------------------------------------------------------
    // CONFIRMAÇÃO
    // ------------------------------------------------------------

    function showConfirmation(appointment) {
        if (!confirmation) return;

        if (confirmationDetails) {
            confirmationDetails.innerHTML = `
                <div class="confirmation-detail">
                    <strong>Serviço</strong>
                    <span>${escapeHTML(appointment.service)}</span>
                </div>

                <div class="confirmation-detail">
                    <strong>Data</strong>
                    <span>${formatDate(appointment.date)}</span>
                </div>

                <div class="confirmation-detail">
                    <strong>Horário</strong>
                    <span>${escapeHTML(appointment.time)}</span>
                </div>

                <div class="confirmation-detail">
                    <strong>Cliente</strong>
                    <span>${escapeHTML(appointment.name)}</span>
                </div>
            `;
        }

        form.style.display = "none";
        confirmation.style.display = "block";

        confirmation.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    // ------------------------------------------------------------
    // ESCAPAR HTML
    // ------------------------------------------------------------

    function escapeHTML(value) {
        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ------------------------------------------------------------
    // SUBMIT
    // ------------------------------------------------------------

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        hideMessage();

        const service =
            serviceSelect ? serviceSelect.value.trim() : "";

        const selectedOption =
            serviceSelect &&
            serviceSelect.options[serviceSelect.selectedIndex];

        const serviceName =
            selectedOption && selectedOption.value
                ? selectedOption.textContent.trim()
                : "";

        const date = dateInput.value;
        const time = selectedTimeInput.value;
        const name = nameInput
            ? nameInput.value.trim()
            : "";

        const whatsapp = whatsappInput
            ? normalizeWhatsapp(whatsappInput.value)
            : "";

        const message = messageInput
            ? messageInput.value.trim()
            : "";

        // --------------------------------------------------------
        // VALIDAÇÕES
        // --------------------------------------------------------

        if (!service) {
            showMessage(
                "Selecione o serviço que deseja agendar.",
                "error"
            );

            serviceSelect.focus();
            return;
        }

        if (!date) {
            showMessage(
                "Selecione uma data para o atendimento.",
                "error"
            );

            dateInput.focus();
            return;
        }

        if (!isWorkingDay(date)) {
            showMessage(
                "Os atendimentos acontecem de segunda a sexta-feira.",
                "error"
            );

            dateInput.focus();
            return;
        }

        if (!time) {
            showMessage(
                "Selecione um horário disponível.",
                "error"
            );

            timeContainer.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            return;
        }

        if (!name || name.length < 2) {
            showMessage(
                "Digite seu nome completo.",
                "error"
            );

            if (nameInput) nameInput.focus();
            return;
        }

        if (!whatsapp || whatsapp.length < 10) {
            showMessage(
                "Digite um número de WhatsApp válido.",
                "error"
            );

            if (whatsappInput) whatsappInput.focus();
            return;
        }

        // --------------------------------------------------------
        // VERIFICAÇÃO FINAL DO HORÁRIO
        // --------------------------------------------------------

        setButtonLoading(true);

        try {
            const bookedTimes = await getBookedTimes(date);

            if (bookedTimes.includes(time)) {
                showMessage(
                    "Esse horário acabou de ser reservado. Escolha outro horário.",
                    "error"
                );

                await renderTimeSlots();

                setButtonLoading(false);
                return;
            }

            // ----------------------------------------------------
            // OBJETO DO AGENDAMENTO
            // ----------------------------------------------------

            const appointment = {
                name,
                whatsapp,
                service,
                serviceName,
                date,
                time,
                message
            };

            // ----------------------------------------------------
            // SALVAR
            // ----------------------------------------------------

            const result =
                await saveAppointment(appointment);

            if (!result.success && result.occupied) {
                showMessage(
                    "Esse horário já foi reservado. Escolha outro horário.",
                    "error"
                );

                await renderTimeSlots();

                setButtonLoading(false);
                return;
            }

            if (!result.success) {
                throw new Error(
                    "Não foi possível realizar o agendamento."
                );
            }

            // ----------------------------------------------------
            // SALVAR ÚLTIMO AGENDAMENTO
            // ----------------------------------------------------

            try {
                localStorage.setItem(
                    "samiraLastAppointment",
                    JSON.stringify({
                        ...appointment,
                        id: result.id,
                        status: "pending"
                    })
                );
            } catch (error) {
                console.warn(
                    "Não foi possível salvar o último agendamento:",
                    error
                );
            }

            // ----------------------------------------------------
            // MOSTRAR CONFIRMAÇÃO
            // ----------------------------------------------------

            showConfirmation(appointment);

        } catch (error) {
            console.error(
                "Erro no envio do agendamento:",
                error
            );

            showMessage(
                "Não foi possível concluir o agendamento agora. Verifique sua conexão e tente novamente.",
                "error"
            );

        } finally {
            setButtonLoading(false);
        }
    });

    // ------------------------------------------------------------
    // EVENTOS
    // ------------------------------------------------------------

    if (dateInput) {
        dateInput.addEventListener("change", async () => {
            updateSummary();
            await renderTimeSlots();
        });
    }

    if (serviceSelect) {
        serviceSelect.addEventListener(
            "change",
            updateSummary
        );
    }

    if (nameInput) {
        nameInput.addEventListener("input", updateSummary);
    }

    if (whatsappInput) {
        whatsappInput.addEventListener("input", () => {
            let value = whatsappInput.value.replace(/\D/g, "");

            if (value.length > 11) {
                value = value.substring(0, 11);
            }

            if (value.length > 6) {
                value =
                    `(${value.substring(0, 2)}) ` +
                    `${value.substring(2, 7)}-` +
                    `${value.substring(7)}`;
            } else if (value.length > 2) {
                value =
                    `(${value.substring(0, 2)}) ` +
                    value.substring(2);
            }

            whatsappInput.value = value;
        });
    }

    // ------------------------------------------------------------
    // INICIALIZAÇÃO
    // ------------------------------------------------------------

    updateSummary();

    timeContainer.innerHTML = `
        <p class="time-placeholder">
            Selecione uma data para visualizar os horários disponíveis.
        </p>
    `;

    // ------------------------------------------------------------
    // EXPOSIÇÃO GLOBAL
    // ------------------------------------------------------------

    window.samiraAppointmentSystem = {
        renderTimeSlots,
        getBookedTimes,
        updateSummary
    };
});

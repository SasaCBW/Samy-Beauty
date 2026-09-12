/* =========================================================
   SAMIRA BEAUTY — SISTEMA DE AGENDAMENTO
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const form = document.getElementById("appointmentForm");

    const service = document.getElementById("service");
    const dateInput = document.getElementById("appointmentDate");
    const timeGrid = document.getElementById("timeGrid");
    const timeInput = document.getElementById("appointmentTime");

    const clientName = document.getElementById("clientName");
    const clientPhone = document.getElementById("clientPhone");
    const message = document.getElementById("message");

    const summaryService = document.getElementById("summaryService");
    const summaryDate = document.getElementById("summaryDate");
    const summaryTime = document.getElementById("summaryTime");

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


    /* =====================================================
       CONFIGURAÇÕES
       ===================================================== */

    /*
       HORÁRIO DE ATENDIMENTO

       Você pode alterar facilmente aqui.

       Atualmente:
       Segunda a sexta
       09:00 até 18:00
       Intervalos de 1 hora
    */

    const START_HOUR = 9;
    const END_HOUR = 18;

    const SLOT_DURATION = 60;


    /*
       NÚMERO DO WHATSAPP

       Coloque aqui o número da Samira.

       IMPORTANTE:
       Substitua somente os números abaixo pelo WhatsApp
       correto quando quiser configurar.
    */

    const WHATSAPP_NUMBER = "5542999999999";


    /* =====================================================
       HORÁRIOS RESERVADOS

       Por enquanto deixamos vazio.

       Futuramente, quando conectarmos ao Firebase,
       esses horários serão carregados automaticamente
       dos agendamentos reais.
       ===================================================== */

    const bookedAppointments = {
        /*
        Exemplo:

        "2026-09-20": [
            "09:00",
            "14:00"
        ]
        */
    };


    /* =====================================================
       DATA MÍNIMA
       ===================================================== */

    const today = new Date();

    const todayString = formatDateForInput(today);

    dateInput.min = todayString;


    /* =====================================================
       FORMATAÇÃO DE DATA
       ===================================================== */

    function formatDateForInput(date) {

        const year = date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    /* =====================================================
       FORMATAÇÃO DA DATA PARA EXIBIÇÃO
       ===================================================== */

    function formatDateForDisplay(dateString) {

        if (!dateString) {
            return "—";
        }

        const [year, month, day] =
            dateString.split("-");

        return `${day}/${month}/${year}`;
    }


    /* =====================================================
       VERIFICAR DIA ÚTIL
       ===================================================== */

    function isWeekday(dateString) {

        if (!dateString) {
            return false;
        }

        const [year, month, day] =
            dateString.split("-").map(Number);

        const date = new Date(
            year,
            month - 1,
            day
        );

        const dayOfWeek = date.getDay();

        /*
           0 = domingo
           6 = sábado
        */

        return dayOfWeek !== 0 && dayOfWeek !== 6;
    }


    /* =====================================================
       GERAR HORÁRIOS
       ===================================================== */

    function generateTimeSlots() {

        const slots = [];

        for (
            let hour = START_HOUR;
            hour < END_HOUR;
            hour++
        ) {

            for (
                let minutes = 0;
                minutes < 60;
                minutes += SLOT_DURATION
            ) {

                const formattedHour =
                    String(hour).padStart(2, "0");

                const formattedMinutes =
                    String(minutes).padStart(2, "0");

                slots.push(
                    `${formattedHour}:${formattedMinutes}`
                );

            }

        }

        return slots;
    }


    /* =====================================================
       MOSTRAR HORÁRIOS
       ===================================================== */

    function renderTimeSlots(dateString) {

        timeGrid.innerHTML = "";

        timeInput.value = "";

        summaryTime.textContent = "—";


        /*
           Se não tiver data
        */

        if (!dateString) {

            showTimePlaceholder(
                "Primeiro escolha uma data"
            );

            return;
        }


        /*
           Se for sábado/domingo
        */

        if (!isWeekday(dateString)) {

            showTimePlaceholder(
                "Escolha um dia de segunda a sexta"
            );

            return;
        }


        const slots = generateTimeSlots();

        const booked =
            bookedAppointments[dateString] || [];


        /*
           Criar cada botão
        */

        slots.forEach(time => {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className = "time-option";

            button.textContent = time;


            /*
               Verificar se está reservado
            */

            if (booked.includes(time)) {

                button.classList.add("disabled");

                button.disabled = true;

                button.title =
                    "Este horário já está reservado.";

            } else {

                button.addEventListener(
                    "click",
                    () => selectTime(button, time)
                );

            }


            timeGrid.appendChild(button);

        });

    }


    /* =====================================================
       PLACEHOLDER DE HORÁRIO
       ===================================================== */

    function showTimePlaceholder(text) {

        timeGrid.innerHTML = `
            <div class="time-placeholder">
                <i class="fa-regular fa-calendar"></i>
                <span>${text}</span>
            </div>
        `;

    }


    /* =====================================================
       SELECIONAR HORÁRIO
       ===================================================== */

    function selectTime(button, time) {

        /*
           Remover seleção anterior
        */

        document
            .querySelectorAll(".time-option.selected")
            .forEach(item => {

                item.classList.remove("selected");

            });


        /*
           Selecionar atual
        */

        button.classList.add("selected");


        /*
           Guardar horário
        */

        timeInput.value = time;


        /*
           Atualizar resumo
        */

        summaryTime.textContent = time;

    }


    /* =====================================================
       EVENTO DA DATA
       ===================================================== */

    dateInput.addEventListener(
        "change",
        () => {

            const selectedDate =
                dateInput.value;


            /*
               Impedir fim de semana
            */

            if (
                selectedDate &&
                !isWeekday(selectedDate)
            ) {

                alert(
                    "O atendimento acontece somente de segunda a sexta-feira. 💗"
                );

                dateInput.value = "";

                renderTimeSlots("");

                summaryDate.textContent = "—";

                return;
            }


            renderTimeSlots(selectedDate);


            /*
               Atualizar resumo
            */

            if (selectedDate) {

                summaryDate.textContent =
                    formatDateForDisplay(
                        selectedDate
                    );

            } else {

                summaryDate.textContent = "—";

            }

        }
    );


    /* =====================================================
       EVENTO DO SERVIÇO
       ===================================================== */

    service.addEventListener(
        "change",
        () => {

            if (service.value) {

                summaryService.textContent =
                    service.value;

            } else {

                summaryService.textContent = "—";

            }

        }
    );


    /* =====================================================
       FORMATAÇÃO DO WHATSAPP
       ===================================================== */

    clientPhone.addEventListener(
        "input",
        () => {

            let value =
                clientPhone.value.replace(
                    /\D/g,
                    ""
                );


            /*
               Limite de números
            */

            value =
                value.substring(0, 11);


            if (value.length <= 10) {

                value = value.replace(
                    /^(\d{2})(\d{4})(\d{0,4})/,
                    "($1) $2-$3"
                );

            } else {

                value = value.replace(
                    /^(\d{2})(\d{5})(\d{0,4})/,
                    "($1) $2-$3"
                );

            }


            clientPhone.value = value;

        }
    );


    /* =====================================================
       VALIDAR DATA
       ===================================================== */

    function validateDate() {

        const selectedDate =
            dateInput.value;


        if (!selectedDate) {

            alert(
                "Escolha uma data para continuar. 💗"
            );

            dateInput.focus();

            return false;
        }


        if (!isWeekday(selectedDate)) {

            alert(
                "Escolha um dia de segunda a sexta-feira. 💗"
            );

            dateInput.focus();

            return false;
        }


        return true;
    }


    /* =====================================================
       VALIDAR HORÁRIO
       ===================================================== */

    function validateTime() {

        if (!timeInput.value) {

            alert(
                "Escolha um horário disponível. 💗"
            );

            return false;
        }

        return true;
    }


    /* =====================================================
       ENVIO DO FORMULÁRIO
       ===================================================== */

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            /*
               Validar data
            */

            if (!validateDate()) {
                return;
            }


            /*
               Validar horário
            */

            if (!validateTime()) {
                return;
            }


            /*
               Validar formulário
            */

            if (!form.checkValidity()) {

                form.reportValidity();

                return;
            }


            /*
               Coletar informações
            */

            const appointmentData = {

                service: service.value,

                date: dateInput.value,

                time: timeInput.value,

                name: clientName.value.trim(),

                phone: clientPhone.value.trim(),

                message: message.value.trim()

            };


            /*
               Atualizar confirmação
            */

            confirmationService.textContent =
                appointmentData.service;

            confirmationDate.textContent =
                formatDateForDisplay(
                    appointmentData.date
                );

            confirmationTime.textContent =
                appointmentData.time;


            /*
               Criar mensagem do WhatsApp
            */

            const whatsappMessage =
                createWhatsAppMessage(
                    appointmentData
                );


            /*
               Configurar botão
            */

            whatsappConfirmation.href =
                `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    whatsappMessage
                )}`;


            /*
               Mostrar confirmação
            */

            confirmationSection.hidden = false;


            /*
               Esconder formulário
            */

            document
                .querySelector(".appointment-section")
                .style.display = "none";


            /*
               Ir para confirmação
            */

            setTimeout(() => {

                confirmationSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }, 100);


            /*
               Salvar temporariamente no navegador

               Isso NÃO substitui o Firebase.
               É apenas para manter o último agendamento
               disponível enquanto o sistema ainda não está
               conectado ao banco de dados.
            */

            try {

                localStorage.setItem(
                    "samiraBeautyLastAppointment",
                    JSON.stringify(
                        appointmentData
                    )
                );

            } catch (error) {

                console.warn(
                    "Não foi possível salvar o agendamento localmente.",
                    error
                );

            }

        }
    );


    /* =====================================================
       MENSAGEM DO WHATSAPP
       ===================================================== */

    function createWhatsAppMessage(data) {

        let text =
            `Olá, Samira! 💗\n\n` +
            `Gostaria de confirmar um agendamento na Samira Beauty.\n\n` +
            `✨ Serviço: ${data.service}\n` +
            `📅 Data: ${formatDateForDisplay(data.date)}\n` +
            `🕐 Horário: ${data.time}\n` +
            `👤 Nome: ${data.name}\n` +
            `📱 WhatsApp: ${data.phone}`;


        if (data.message) {

            text +=
                `\n\n💬 Observação: ${data.message}`;

        }


        text +=
            `\n\nAguardo a confirmação. 💕`;


        return text;
    }


    /* =====================================================
       WHATSAPP FLUTUANTE
       ===================================================== */

    if (floatingWhatsapp) {

        floatingWhatsapp.href =
            `https://wa.me/${WHATSAPP_NUMBER}`;

    }


    /* =====================================================
       BOTÃO WHATSAPP DO RODAPÉ
       ===================================================== */

    const footerWhatsapp =
        document.querySelector(
            '.footer-social a[aria-label="WhatsApp"]'
        );


    if (footerWhatsapp) {

        footerWhatsapp.href =
            `https://wa.me/${WHATSAPP_NUMBER}`;

        footerWhatsapp.target = "_blank";

        footerWhatsapp.rel = "noopener";

    }


    /* =====================================================
       INSTAGRAM
       ===================================================== */

    const instagramLinks =
        document.querySelectorAll(
            '.footer-social a[aria-label="Instagram"]'
        );


    instagramLinks.forEach(link => {

        /*
           Troque pelo Instagram oficial da Samira
           quando tiver o @.
        */

        link.href = "#";

    });


    /* =====================================================
       IMPEDIR DATA NO FIM DE SEMANA PELO CALENDÁRIO
       ===================================================== */

    dateInput.addEventListener(
        "input",
        () => {

            if (
                dateInput.value &&
                !isWeekday(dateInput.value)
            ) {

                dateInput.setCustomValidity(
                    "Escolha um dia de segunda a sexta-feira."
                );

            } else {

                dateInput.setCustomValidity("");

            }

        }
    );


    /* =====================================================
       ANO DO FOOTER
       ===================================================== */

    const currentYear =
        document.getElementById("currentYear");

    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();

    }


    /* =====================================================
       ANIMAÇÃO INICIAL
       ===================================================== */

    const revealElements =
        document.querySelectorAll(".reveal");


    if ("IntersectionObserver" in window) {

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (entry.isIntersecting) {

                            entry.target.classList.add(
                                "visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: 0.1
                }
            );


        revealElements.forEach(element => {

            observer.observe(element);

        });

    } else {

        revealElements.forEach(element => {

            element.classList.add("visible");

        });

    }


    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */

    renderTimeSlots("");

});

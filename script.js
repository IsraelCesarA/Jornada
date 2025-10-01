function timeToMinutes(time) {
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}

function minutesToTime(min) {
    const totalMinutes = Math.abs(min);
    const h = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const m = (totalMinutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
}

function calcularPeriodoNoturno(inicio, fim) {
    let total = 0;
    // Horário Noturno: 22:00 às 05:00
    const inicioNoturno = 22 * 60;
    const fimNoturno = 5 * 60;

    // Se o fim for antes do início, significa que passou da meia-noite
    let duracao = fim - inicio;
    if (duracao < 0) duracao += 24 * 60;

    let tempFim = fim;
    if (tempFim < inicio) tempFim += 24 * 60;

    for (let t = inicio; t < tempFim; t++) {
        let hora = t % (24 * 60);
        // Verifica se o minuto está dentro do intervalo noturno (22:00h até 04:59h)
        if (hora >= inicioNoturno || hora < fimNoturno) total++;
    }
    return total;
}

// ==========================
// Lógica de Abas
// ==========================
function showTab(tabId) {
    // Esconde todos os conteúdos de aba
    document.querySelectorAll('.tab-content').forEach(box => {
        box.classList.add('hidden');
    });

    // Desativa todos os botões
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Mostra o conteúdo da aba selecionada
    document.getElementById(tabId).classList.remove('hidden');
    // Ativa o botão correspondente
    document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');
}

// ==========================
// Funções de Jornada e Descanso
// ==========================
function calcularJornada() {
    const inicio = timeToMinutes(document.getElementById("inicio").value);
    const inicioInt = timeToMinutes(document.getElementById("inicioInt").value);
    const fimInt = timeToMinutes(document.getElementById("fimInt").value);
    const fim = timeToMinutes(document.getElementById("fim").value);
    const tipoJornada = parseInt(document.getElementById("tipoJornada").value);
    const feriado = document.getElementById("feriado").checked;
    const resJornada = document.getElementById("resJornada");

    if (!inicio || !fim) {
        resJornada.innerText = "Preencha início e fim da jornada.";
        return;
    }

    let total = fim - inicio;
    if (total < 0) total += 24 * 60; // Passou da meia-noite

    let intervalo = 0;
    if (fimInt > inicioInt) intervalo = (fimInt - inicioInt);
    
    total -= intervalo;

    let noturna = calcularPeriodoNoturno(inicio, fim) - calcularPeriodoNoturno(inicioInt, fimInt);

    let extra = total - tipoJornada;
    let msg = `Total trabalhado: ${minutesToTime(total)} horas.`;

    if (extra > 0) {
        msg += `<br>Hora extra: <span class="valor-receber">${minutesToTime(extra)}</span>.`;
        if (feriado) msg += " (Feriado - 100%).";
    } else if (extra < 0) {
        msg += `<br>Faltaram: <span class="alerta">${minutesToTime(-extra)}</span>.`;
    }
    if (noturna > 0) {
        msg += `<br>Adicional noturno (20%): ${minutesToTime(noturna)} minutos.`;
    }

    resJornada.innerHTML = msg;
}

function verificarDescanso() {
    const fimAnterior = timeToMinutes(document.getElementById("fimAnterior").value);
    const inicio = timeToMinutes(document.getElementById("inicio").value);
    const resDescanso = document.getElementById("resDescanso");

    if (!fimAnterior || !inicio) {
        resDescanso.innerText = "Preencha os horários.";
        return;
    }

    let descanso = inicio - fimAnterior;
    if (descanso < 0) descanso += 24 * 60;

    const descansoMinimo = 660; // 11 horas em minutos

    if (descanso >= descansoMinimo) {
        resDescanso.innerHTML = `<span class="valor-receber">Descanso de ${minutesToTime(descanso)} (OK)</span>.`;
    } else {
        resDescanso.innerHTML = `<span class="alerta">Descanso de ${minutesToTime(descanso)} (INSUFICIENTE - Mínimo 11h)</span>.`;
    }
}

// ==========================
// Função para calcular extras
// ==========================
function calcularExtras() {
    const salario = parseFloat(document.getElementById("salario").value);
    const horasExtrasDigitadas = parseFloat(document.getElementById("horasExtras").value);
    const jornadaExtra = parseInt(document.getElementById("jornadaExtra").value);
    const tipoExtra = parseFloat(document.getElementById("tipoExtra").value);
    const feriadoExtra = document.getElementById("feriadoExtra").checked;

    const extraInicio = timeToMinutes(document.getElementById("extraInicio").value);
    const extraInicioInt = timeToMinutes(document.getElementById("extraInicioInt").value);
    const extraFimInt = timeToMinutes(document.getElementById("extraFimInt").value);
    const extraFim = timeToMinutes(document.getElementById("extraFim").value);
    const resExtras = document.getElementById("resExtras");

    if (!salario || isNaN(salario) || salario <= 0) {
        resExtras.innerText = "Preencha um salário mensal válido.";
        return;
    }

    let horasMes = jornadaExtra === 440 ? 220 : jornadaExtra === 360 ? 180 : 120;
    let valorHora = salario / horasMes;

    let horasExtras = 0;
    let noturnas = 0;
    
    if (horasExtrasDigitadas > 0) {
        horasExtras = horasExtrasDigitadas;
        // Não é possível calcular noturno se não for informada a jornada completa
    } else if (extraInicio && extraFim) {
        let total = extraFim - extraInicio;
        if (total < 0) total += 24 * 60;
        
        let intervalo = 0;
        if (extraFimInt > extraInicioInt) intervalo = (extraFimInt - extraInicioInt);
        total -= intervalo;

        let totalExtraMin = total - jornadaExtra;
        if (totalExtraMin > 0) {
            horasExtras = totalExtraMin / 60;
        }

        noturnas = (calcularPeriodoNoturno(extraInicio, extraFim) - calcularPeriodoNoturno(extraInicioInt, extraFimInt)) / 60;
    }

    if (horasExtras <= 0 && noturnas <= 0) {
         resExtras.innerText = "Nenhuma hora extra ou noturna calculada.";
         return;
    }

    let multiplicador = feriadoExtra ? 2 : tipoExtra;
    let valorExtra = valorHora * horasExtras * multiplicador;
    
    // Adicional Noturno: 20%
    let valorNoturno = valorHora * noturnas * 0.2; 
    
    let totalReceber = valorExtra + valorNoturno;

    resExtras.innerHTML = `
        <p>Valor Hora Normal: R$ ${valorHora.toFixed(2)}</p>
        <p>Horas extras calculadas: ${horasExtras.toFixed(2)}h</p>
        <p>Horas Noturnas (na extra): ${noturnas.toFixed(2)}h</p>
        <p>Valor Hora Extra (${(multiplicador-1)*100}%): R$ ${valorExtra.toFixed(2)}</p>
        <p>Adicional Noturno (20%): R$ ${valorNoturno.toFixed(2)}</p>
        <p><strong>Total Bruto Extra: R$ <span class="valor-receber">${totalReceber.toFixed(2)}</span></strong></p>
    `;
}

// ==========================
// Função para calcular férias
// ==========================
function calcularFerias() {
    const salario = parseFloat(document.getElementById("salarioFerias").value);
    const venderFerias = document.getElementById("venderFerias").checked;
    const resFerias = document.getElementById("resFerias");

    if (isNaN(salario) || salario <= 0) {
        resFerias.innerText = "Por favor, insira um salário válido.";
        return;
    }

    let valorFeriasBase = salario;
    let abonoPecuniario = 0;

    if (venderFerias) {
        // Cálculo de 20 dias de gozo
        valorFeriasBase = salario / 30 * 20; 
        
        // Abono Pecuniário (venda 10 dias)
        // Salário de 10 dias + 1/3 Constitucional sobre esses 10 dias
        abonoPecuniario = (salario / 30 * 10) + ((salario / 30 * 10) / 3);
    }
    
    // 1/3 Constitucional sobre os dias gozados (20 ou 30)
    const tercoGozo = valorFeriasBase / 3;
    const valorFerias = valorFeriasBase + tercoGozo;

    const totalBruto = valorFerias + abonoPecuniario;

    resFerias.innerHTML = `
        <p>Salário do período gozado: R$ ${valorFeriasBase.toFixed(2)}</p>
        <p>1/3 Constitucional: R$ ${tercoGozo.toFixed(2)}</p>
        <p>Abono Pecuniário (venda 10 dias): R$ ${abonoPecuniario.toFixed(2)}</p>
        <p><strong>Total Bruto a Receber: R$ <span class="valor-receber">${totalBruto.toFixed(2)}</span></strong></p>
    `;
}

// ==========================
// Função para calcular rescisão
// ==========================
function calcularRescisao() {
    const salario = parseFloat(document.getElementById("salarioRescisao").value);
    const dataAdmissao = new Date(document.getElementById("dataAdmissao").value.replace(/-/g, '/'));
    const dataRescisao = new Date(document.getElementById("dataRescisao").value.replace(/-/g, '/'));
    const diasTrabalhados = parseInt(document.getElementById("diasTrabalhados").value);
    const feriasVencidas = parseInt(document.getElementById("feriasVencidas").value);
    const avisoPrevioIndenizado = document.getElementById("avisoPrevioIndenizado").checked;
    const resRescisao = document.getElementById("resRescisao");

    if (isNaN(salario) || !dataAdmissao.getTime() || !dataRescisao.getTime() || isNaN(diasTrabalhados) || isNaN(feriasVencidas)) {
        resRescisao.innerText = "Preencha todos os campos com valores válidos.";
        return;
    }
    
    // Validação de datas
    if (dataRescisao < dataAdmissao) {
        resRescisao.innerHTML = "<p class='alerta'>Erro: Data de Rescisão deve ser igual ou posterior à Data de Admissão.</p>";
        return;
    }

    const salarioDiario = salario / 30;

    function diferencaMeses(dataInicio, dataFim) {
        let anos = dataFim.getFullYear() - dataInicio.getFullYear();
        let meses = dataFim.getMonth() - dataInicio.getMonth();
        let totalMeses = anos * 12 + meses;
        // Ajuste para não contar o mês da rescisão (será contado por 'diasTrabalhados')
        if (dataFim.getDate() < dataInicio.getDate()) totalMeses -= 1; 
        return totalMeses;
    }

    const totalMeses = diferencaMeses(dataAdmissao, dataRescisao);

    // Saldo de salário (dias trabalhados no mês da rescisão)
    const saldoSalario = salarioDiario * diasTrabalhados;

    // Férias proporcionais (meses no período aquisitivo atual)
    // Se trabalhou >= 15 dias no mês da rescisão, conta 1/12 avos para o 13º e Férias.
    const mesesParaAviso = Math.floor(totalMeses / 12); // anos completos
    
    let mesesFerias = totalMeses % 12; // meses no ciclo atual
    if (diasTrabalhados >= 15) mesesFerias += 1;
    if (mesesFerias > 12) mesesFerias = 12; 

    const feriasProporcionaisBase = (salario / 12) * mesesFerias;
    const feriasProporcionais = feriasProporcionaisBase + (feriasProporcionaisBase / 3);

    // Férias vencidas
    const valorFeriasVencidas = (salario * feriasVencidas) + ((salario * feriasVencidas) / 3);

    // 13º proporcional
    let mesesDecimo = dataRescisao.getMonth() + 1; // Mês da rescisão (1 a 12)
    if (diasTrabalhados >= 15) mesesDecimo += 1; // Se trabalhou 15 dias ou mais, conta o mês
    if (mesesDecimo > 12) mesesDecimo = 12; 
    
    const decimoTerceiroProporcional = (salario / 12) * mesesDecimo;

    // Aviso prévio
    let valorAvisoPrevio = 0;
    let diasAviso = 0;
    if (avisoPrevioIndenizado) {
        let anos = mesesParaAviso;
        // 30 dias + 3 dias por ano completo de serviço (máximo de 60 dias adicionais)
        diasAviso = 30 + Math.min(anos, 20) * 3; 
        valorAvisoPrevio = (salario / 30) * diasAviso;
    }

    const totalBruto = saldoSalario + feriasProporcionais + valorFeriasVencidas + decimoTerceiroProporcional + valorAvisoPrevio;

    // Cálculo simplificado de FGTS (para exibição)
    const totalFGTSBase = totalBruto - (valorFeriasVencidas + feriasProporcionais); // FGTS não incide sobre Férias (base)
    const fgtsRecolher = totalFGTSBase * 0.08;
    const multaFGTS = totalFGTSBase * 0.40; // Multa de 40% (rescisão sem justa causa)

    resRescisao.innerHTML = `
        <p>Saldo de Salário: R$ ${saldoSalario.toFixed(2)}</p>
        <p>Férias Proporcionais (${mesesFerias}/12) + 1/3: R$ ${feriasProporcionais.toFixed(2)}</p>
        <p>Férias Vencidas (${feriasVencidas}) + 1/3: R$ ${valorFeriasVencidas.toFixed(2)}</p>
        <p>13º Salário Proporcional (${mesesDecimo}/12): R$ ${decimoTerceiroProporcional.toFixed(2)}</p>
        <p>Aviso Prévio Indenizado (${diasAviso} dias): R$ ${valorAvisoPrevio.toFixed(2)}</p>
        <hr>
        <p>Previsão de FGTS (8% sobre verbas rescisórias): R$ ${fgtsRecolher.toFixed(2)}</p>
        <p>Previsão de Multa FGTS (40% - sem justa causa): R$ ${multaFGTS.toFixed(2)}</p>
        <p><strong>Total Bruto (soma de verbas): R$ <span class="valor-receber">${totalBruto.toFixed(2)}</span></strong></p>
    `;
}

// ==========================
// Enter para mudar de campo e iniciar as abas
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    // Inicializa mostrando a primeira aba
    showTab('jornada'); 
    
    // Lógica para pular campo com Enter
    const inputs = document.querySelectorAll(".enter");
    inputs.forEach((input, i) => {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const next = inputs[i + 1];
                if (next) next.focus();
            }
        });
    });
});

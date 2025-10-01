function timeToMinutes(time) {
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}

function minutesToTime(min) {
    const h = Math.floor(min / 60).toString().padStart(2, '0');
    const m = (min % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
}

function calcularPeriodoNoturno(inicio, fim) {
    let total = 0;
    const inicioNoturno = 22 * 60;
    const fimNoturno = 5 * 60;

    if (fim < inicio) fim += 24 * 60;

    for (let t = inicio; t < fim; t++) {
        let hora = t % (24 * 60);
        if (hora >= inicioNoturno || hora < fimNoturno) total++;
    }
    return total;
}

function calcularJornada() {
    const inicio = timeToMinutes(document.getElementById("inicio").value);
    const inicioInt = timeToMinutes(document.getElementById("inicioInt").value);
    const fimInt = timeToMinutes(document.getElementById("fimInt").value);
    const fim = timeToMinutes(document.getElementById("fim").value);
    const tipoJornada = parseInt(document.getElementById("tipoJornada").value);
    const feriado = document.getElementById("feriado").checked;

    if (!inicio || !fim) {
        document.getElementById("resJornada").innerText = "Preencha início e fim da jornada.";
        return;
    }

    let total = fim - inicio;
    if (fimInt > inicioInt) total -= (fimInt - inicioInt);

    let noturna = calcularPeriodoNoturno(inicio, fim);
    let extra = total - tipoJornada;
    let msg = `Total trabalhado: ${minutesToTime(total)} horas.`;

    if (extra > 0) {
        msg += ` Hora extra: ${minutesToTime(extra)}.`;
        if (feriado) msg += " (Feriado - 100%).";
    } else if (extra < 0) {
        msg += ` Faltaram: ${minutesToTime(-extra)}.`;
    }
    if (noturna > 0) {
        msg += ` Adicional noturno: ${minutesToTime(noturna)}.`;
    }

    document.getElementById("resJornada").innerText = msg;
}

function verificarDescanso() {
    const fimAnterior = timeToMinutes(document.getElementById("fimAnterior").value);
    const inicio = timeToMinutes(document.getElementById("inicio").value);

    if (!fimAnterior || !inicio) {
        document.getElementById("resDescanso").innerText = "Preencha os horários.";
        return;
    }

    let descanso = inicio - fimAnterior;
    if (descanso < 0) descanso += 24 * 60;

    if (descanso >= 660) {
        document.getElementById("resDescanso").innerText = `Descanso de ${minutesToTime(descanso)} (OK).`;
    } else {
        document.getElementById("resDescanso").innerText = `Descanso de ${minutesToTime(descanso)} (INSUFICIENTE).`;
    }
}

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

    if (!salario) {
        document.getElementById("resExtras").innerText = "Preencha salário.";
        return;
    }

    let horasMes = jornadaExtra === 440 ? 220 : jornadaExtra === 360 ? 180 : 120;
    let valorHora = salario / horasMes;

    let horasExtras = 0;
    if (horasExtrasDigitadas) {
        horasExtras = horasExtrasDigitadas;
    } else if (extraInicio && extraFim) {
        let total = extraFim - extraInicio;
        if (extraFimInt > extraInicioInt) total -= (extraFimInt - extraInicioInt);
        horasExtras = (total - jornadaExtra) / 60;
    }

    let noturnas = calcularPeriodoNoturno(extraInicio, extraFim) / 60;

    let multiplicador = feriadoExtra ? 2 : tipoExtra;
    let valorExtra = valorHora * horasExtras * multiplicador;
    let valorNoturno = valorHora * noturnas * 0.2; // adicional 20%

    document.getElementById("resExtras").innerText = `Horas extras: ${horasExtras.toFixed(2)}h | Noturnas: ${noturnas.toFixed(2)}h | Valor a receber: R$ ${(valorExtra + valorNoturno).toFixed(2)}`;
}

// ==========================
// Função para calcular férias
// ==========================
function calcularFerias() {
    const salario = parseFloat(document.getElementById("salarioFerias").value);
    const venderFerias = document.getElementById("venderFerias").checked;

    if (isNaN(salario) || salario <= 0) {
        document.getElementById("resFerias").innerText = "Por favor, insira um salário válido.";
        return;
    }

    const tercoConstitucional = salario / 3;
    let valorFerias = salario + tercoConstitucional;
    let abonoPecuniario = 0;
    let totalReceber = 0;

    if (venderFerias) {
        abonoPecuniario = (salario / 30 * 10) + ((salario / 30 * 10) / 3);
        valorFerias = (salario / 30 * 20) + ((salario / 30 * 20) / 3);
        totalReceber = valorFerias + abonoPecuniario;
    } else {
        totalReceber = valorFerias;
    }

    document.getElementById("resFerias").innerHTML = `
        <p>Valor das Férias (2/3 salário + 1/3 terço): R$ ${valorFerias.toFixed(2)}</p>
        <p>Abono Pecuniário (venda 10 dias): R$ ${abonoPecuniario.toFixed(2)}</p>
        <p><strong>Total Bruto a Receber: R$ ${totalReceber.toFixed(2)}</strong></p>
    `;
}

// ==========================
// Função para calcular rescisão
// ==========================
function calcularRescisao() {
    const salario = parseFloat(document.getElementById("salarioRescisao").value);
    const dataAdmissao = new Date(document.getElementById("dataAdmissao").value);
    const dataRescisao = new Date(document.getElementById("dataRescisao").value);
    const diasTrabalhados = parseInt(document.getElementById("diasTrabalhados").value);
    const feriasVencidas = parseInt(document.getElementById("feriasVencidas").value);
    const avisoPrevioIndenizado = document.getElementById("avisoPrevioIndenizado").checked;

    if (isNaN(salario) || !dataAdmissao.getTime() || !dataRescisao.getTime() || isNaN(diasTrabalhados) || isNaN(feriasVencidas)) {
        document.getElementById("resRescisao").innerText = "Preencha todos os campos com valores válidos.";
        return;
    }

    const salarioDiario = salario / 30;

    function diferencaMeses(dataInicio, dataFim) {
        let anos = dataFim.getFullYear() - dataInicio.getFullYear();
        let meses = dataFim.getMonth() - dataInicio.getMonth();
        let totalMeses = anos * 12 + meses;
        if (dataFim.getDate() < dataInicio.getDate()) totalMeses -= 1;
        return totalMeses;
    }

    const totalMeses = diferencaMeses(dataAdmissao, dataRescisao);

    // Saldo de salário
    const saldoSalario = salarioDiario * diasTrabalhados;

    // Férias proporcionais
    const mesesFerias = totalMeses % 12;
    const feriasProporcionaisBase = (salario / 12) * mesesFerias;
    const feriasProporcionais = feriasProporcionaisBase + (feriasProporcionaisBase / 3);

    // Férias vencidas
    const valorFeriasVencidas = (salario * feriasVencidas) + ((salario * feriasVencidas) / 3);

    // 13º proporcional
    let mesesDecimo = dataRescisao.getMonth() + 1;
    if (diasTrabalhados >= 15) mesesDecimo += 1;
    const decimoTerceiroProporcional = (salario / 12) * mesesDecimo;

    // Aviso prévio
    let valorAvisoPrevio = 0;
    if (avisoPrevioIndenizado) {
        let anos = Math.floor(totalMeses / 12);
        let diasAviso = 30 + Math.min(anos, 20) * 3;
        if (diasAviso > 90) diasAviso = 90;
        valorAvisoPrevio = (salario / 30) * diasAviso;
    }

    const totalBruto = saldoSalario + feriasProporcionais + valorFeriasVencidas + decimoTerceiroProporcional + valorAvisoPrevio;

    document.getElementById("resRescisao").innerHTML = `
        <p>Saldo de Salário: R$ ${saldoSalario.toFixed(2)}</p>
        <p>Férias Proporcionais + 1/3: R$ ${feriasProporcionais.toFixed(2)}</p>
        <p>Férias Vencidas + 1/3: R$ ${valorFeriasVencidas.toFixed(2)}</p>
        <p>13º Salário Proporcional: R$ ${decimoTerceiroProporcional.toFixed(2)}</p>
        <p>Aviso Prévio Indenizado: R$ ${valorAvisoPrevio.toFixed(2)}</p>
        <p><strong>Total Bruto (sem descontos): R$ ${totalBruto.toFixed(2)}</strong></p>
    `;
}

// ==========================
// Enter para mudar de campo
// ==========================
document.addEventListener("DOMContentLoaded", () => {
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

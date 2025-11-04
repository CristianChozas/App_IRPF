const TRAMOS = [
    { limite: 12450, tipo: 0.19 },
    { limite: 20200, tipo: 0.24 },
    { limite: 35200, tipo: 0.30 },
    { limite: 60000, tipo: 0.37 },
    { limite: 300000, tipo: 0.45 },
    { limite: Infinity, tipo: 0.47 }
]

const PORCENTAJE_CONTINGENCIAS = 0.0635
const MARGEN_EXTRA_IRPF = 0.02
const CANTIDAD_EXENTA = 5550

function calcularCuotaIRPF(base) {
    let inicioTramo = 0
    let cuota = 0

    for (const tramo of TRAMOS) {
        if (base > inicioTramo) {
            const baseTramo = Math.min(base, tramo.limite) - inicioTramo
            cuota += baseTramo * tramo.tipo
            inicioTramo = tramo.limite
        } else {
            break
        }
    }

    return cuota
}

function formatearEuros(valor) {
    return valor.toLocaleString("es-ES", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2
    })
}

function formatearPorcentaje(valor) {
    return (valor * 100).toFixed(2) + " %"
}

window.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("form-irpf")
    const mensajeError = document.getElementById("mensaje-error")
    const contenedorResultados = document.getElementById("contenedor-resultados")
    const btnReset = document.getElementById("btn-reset")

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault()
        mensajeError.textContent = ""
        contenedorResultados.innerHTML = ""

        const bruto = Number(formulario.bruto.value)
        const pagas = Number(formulario.pagas.value)

        if (!bruto || bruto <= 0 || Number.isNaN(bruto)) {
            mensajeError.textContent = "Introduce un sueldo bruto anual válido."
            return
        }

        if (!pagas || pagas <= 0 || Number.isNaN(pagas)) {
            mensajeError.textContent = "Selecciona un número de pagas válido."
            return
        }

        const contingencias = bruto * PORCENTAJE_CONTINGENCIAS
        const baseIRPF = Math.max(bruto - CANTIDAD_EXENTA, 0)
        const cuotaIRPF = calcularCuotaIRPF(baseIRPF)
        const tipoEfectivo = cuotaIRPF / bruto
        const tipoRecomendado = Math.min(tipoEfectivo + MARGEN_EXTRA_IRPF, 0.47)
        const netoAnual = bruto - contingencias - cuotaIRPF
        const netoPorPaga = netoAnual / pagas

        contenedorResultados.innerHTML = `
            <div class="resultado">
                <p>Cuota IRPF: <strong>${formatearEuros(cuotaIRPF)}</strong></p>
                <p>Tipo efectivo de IRPF: <strong>${formatearPorcentaje(tipoEfectivo)}</strong></p>
                <p>Sueldo neto anual: <strong>${formatearEuros(netoAnual)}</strong></p>
                <p>Sueldo neto (${pagas} pagas): <strong>${formatearEuros(netoPorPaga)}</strong></p>
            </div>
        `
    })

    btnReset.addEventListener("click", function () {
        formulario.reset()
        mensajeError.textContent = ""
        contenedorResultados.innerHTML = ""
    })
})

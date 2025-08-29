$(document).ready(function () {
  // Cargar nodes al inicio
  $.getJSON('/report/filters', function (data) {
    $('#nodeSelect').empty().append('<option value="">Todos los Nodes</option>')
    data.nodes.forEach(node => {
      $('#nodeSelect').append(`<option value="${node}">${node}</option>`)
    })
    $('#dateSelect').empty().append('<option value="">Todas las Fechas</option>')
    $('#trunkSelect').empty().append('<option value="">Todos los Trunks</option>')
  })

  // Cuando cambia node, cargar fechas disponibles para ese node
  $('#nodeSelect').on('change', function () {
    const node = $(this).val()
    $('#dateSelect').empty().append('<option value="">Todas las Fechas</option>')
    $('#trunkSelect').empty().append('<option value="">Todos los Trunks</option>')
    if (node) {
      $.getJSON('/report/filters', { node }, function (data) {
        data.dates.forEach(date => {
          $('#dateSelect').append(`<option value="${date}">${date}</option>`)
        })
      })
    }
    table.ajax.reload()
  })

  // Cuando cambia date, cargar trunks disponibles para ese node y date
  $('#dateSelect').on('change', function () {
    const node = $('#nodeSelect').val()
    const date = $(this).val()
    $('#trunkSelect').empty().append('<option value="">Todos los Trunks</option>')
    if (node && date) {
      $.getJSON('/report/filters', { node, date }, function (data) {
        data.trunks.forEach(trunk => {
          $('#trunkSelect').append(`<option value="${trunk}">${trunk}</option>`)
        })
      })
    }
    table.ajax.reload()
  })

  // Cuando cambia trunk, solo recargar tabla
  $('#trunkSelect').on('change', function () {
    table.ajax.reload()
  })

  // Inicializar DataTable
  const table = $('#trunksTable').DataTable({
    processing: true,
    serverSide: true,
    ajax: {
      url: '/report/data',
      data: function (d) {
        d.node = $('#nodeSelect').val()
        d.date = $('#dateSelect').val()
        d.trunk = $('#trunkSelect').val()
      }
    },
    columns: [
      { data: 'node' },
      { data: 'date' },
      { data: 'localTrunkName' },
      { data: 'state' },
      { data: 'mode' },
      { data: 'ipCallLimit' },
      { data: 'maximumIngressSustainedCallRate' },
      { data: 'maximumIngressCallBurstSize' }
    ],
    footerCallback: function (row, data, start, end, display) {
      const api = this.api()
      const intVal = function (i) {
        return typeof i === 'string'
          ? i.replace(/[\$,]/g, '') * 1
          : typeof i === 'number'
          ? i
          : 0
      }
      const cols = [5, 6, 7]
      cols.forEach(function (colIdx) {
        const total = api
          .column(colIdx, { page: 'current' })
          .data()
          .reduce(function (a, b) {
            return intVal(a) + intVal(b)
          }, 0)
        $(api.column(colIdx).footer()).html(total)
      })
    }
  })

  function cargarTotales() {
    const node = $('#nodeSelect').val()
    const date = $('#dateSelect').val()
    // Puedes agregar trunk si tu backend lo soporta
    $.get('/report/totales', { node, date }, function (data) {
      let html = `
        <h4>Totales por Node y Fecha</h4>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Node</th>
              <th>Date</th>
              <th>Total IP Call Limit</th>
              <th>Total Max Ingress Sustained Call Rate</th>
              <th>Total Max Ingress Call Burst Size</th>
            </tr>
          </thead>
          <tbody>
      `
      Object.entries(data).forEach(([node, dates]) => {
        Object.entries(dates).forEach(([date, totals]) => {
          html += `
            <tr>
              <td>${node}</td>
              <td>${date}</td>
              <td>${totals.totalIpCallLimit}</td>
              <td>${totals.totalMaxIngressSustainedCallRate}</td>
              <td>${totals.totalMaxIngressCallBurstSize}</td>
            </tr>
          `
        })
      })
      html += `
          </tbody>
        </table>
      `
      $('#totales').html(html)
    })
  }

  // Llama al cargar la página
  cargarTotales()

  // Llama cada vez que cambian los filtros
  $('#nodeSelect, #dateSelect, #trunkSelect').on('change', function () {
    cargarTotales()
  })
})
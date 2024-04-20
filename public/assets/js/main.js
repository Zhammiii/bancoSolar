const setInfoModal = (nombre, balance, id) => {
  $("#nombreEdit").val(nombre);
  $("#balanceEdit").val(balance);
  $("#editButton").attr("onclick", `editUsuario('${id}')`);
};

const editUsuario = async (id) => {
  const name = $("#nombreEdit").val();
  const balance = $("#balanceEdit").val();
  try {
    const { data } = await axios.put(`http://localhost:3000/usuario/${id}`, {
      nombre: name,
      balance: balance,
    });
    $("#exampleModal").modal("hide");
    location.reload();
  } catch (e) {
    alert("Algo salió mal..." + e);
  }
};

$("form:first").submit(async (e) => {
  e.preventDefault();
  let nombre = $("form:first input:first").val().trim();
  let balance = $("form:first input:nth-child(2)").val().trim();

  /* Validar que el nombre sea mayor a 3 caracteres */
  if (nombre.length < 3) {
    alert("El nombre debe tener al menos 3 caracteres.");
    return;
  }

  /* Convertir el nombre a formato correcto */
  nombre = nombre.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

  /* Validación de nombre */
  const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÄËÏÖÜäëïöüÑñ\s.'-]{1,50}$/;
  if (!nombreRegex.test(nombre)) {
    alert(
      "Nombre inválido. Asegúrate de ingresar solo letras, espacios y caracteres permitidos."
    );
    return;
  }

  /* Validar que el balance sea mayor a 0 */
  if (parseFloat(balance) <= 0) {
    alert("El balance debe ser mayor a 0.");
    return;
  }

  /* Validación de balance */
  const balanceRegex = /^\d+(\.\d{1,2})?$/;
  if (!balanceRegex.test(balance) || parseFloat(balance) > 100000000) {
    alert(
      "Balance inválido. Ingresa un número válido que no supere los 100,000,000."
    );
    return;
  }

  try {
    const response = await axios.post("http://localhost:3000/usuario", {
      nombre,
      balance,
    });
    $("form:first input:first").val("");
    $("form:first input:nth-child(2)").val("");
    location.reload();
  } catch (e) {
    alert("Algo salió mal ..." + e);
  }
});

$("form:last").submit(async (e) => {
  e.preventDefault();
  let emisor = $("form:last select:first").val();
  let receptor = $("form:last select:last").val();
  let monto = $("#monto").val().trim();
  if (!monto || !emisor || !receptor) {
      alert("Debe seleccionar un emisor, receptor y monto a transferir");
      return false;
  }

  /* Verificar si el emisor y el receptor son el mismo usuario */
  if (emisor === receptor) {
      alert("No puedes transferir fondos a ti mismo. Por favor selecciona otro receptor.");
      return;
  }

  /* Validación de monto */
  const montoRegex = /^[1-9]\d*(\.\d{1,2})?$/;
  if (!montoRegex.test(monto) || parseFloat(monto) > 100000000) {
      alert("Monto inválido. Ingresa un número válido mayor que cero y no superior a 100,000,000.");
      return;
  }

  try {
      const response = await axios.post("http://localhost:3000/transferencia", {
          emisor,
          receptor,
          monto,
      });
      location.reload();
  } catch (e) {
      console.log(e);
      alert("Algo salió mal..." + e);
  }
});

const getUsuarios = async () => {
  const response = await axios.get("http://localhost:3000/usuarios");
  let data = await response.data;
  $(".usuarios").html("");

  $.each(data, (i, c) => {
    $(".usuarios").append(`
          <tr>
              <td>${c.nombre}</td>
              <td>${c.balance}</td>
              <td>
                  <button class="btn btn-warning mr-2"
                      data-toggle="modal"
                      data-target="#exampleModal"
                      onclick="setInfoModal('${c.nombre}', '${c.balance}', '${c.id}')">
                      Editar
                  </button>
                  <button class="btn btn-danger" onclick="eliminarUsuario('${c.id}')">
                      Eliminar
                  </button>
              </td>
          </tr>
      `);

    $("#emisor").append(`<option value="${c.id}">${c.nombre}</option>`);
    $("#receptor").append(`<option value="${c.id}">${c.nombre}</option>`);
  });
};

const eliminarUsuario = async (id) => {
  try {
    const transferenciasResponse = await axios.get("http://localhost:3000/transferencias");
    const transferencias = transferenciasResponse.data;
    const usuarioPresente = transferencias.some(t => t.emisor === id || t.receptor === id);
    if (usuarioPresente) {
      alert("No se puede eliminar este usuario ya que ha realizado transferencias.");
      return;
    }
    const response = await fetch(`http://localhost:3000/usuario?id=${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("No se pudo eliminar el usuario. Error en la solicitud de eliminación.");
    }
    
    getUsuarios();
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    alert("No se puede eliminar este usuario ya que ha realizado transferencias. ");
  }
};
const getTransferencias = async () => {
  try {
    const { data } = await axios.get("http://localhost:3000/transferencias");
    $(".transferencias").html("");

    data.forEach((t) => {
      console.log("Transferencia:", t);
      $(".transferencias").append(`
              <tr>
                  <td> ${formatDate(t.fecha)} </td>
                  <td> ${t.nombre_emisor} </td>
                  <td> ${t.nombre_receptor} </td>
                  <td> ${t.monto} </td>
              </tr>
          `);
    });
  } catch (error) {
    console.error(error);
  }
};

const formatDate = (date) => {
  const dateFormat = moment(date).format("L");
  const timeFormat = moment(date).format("LTS");
  return `${dateFormat} ${timeFormat}`;
};

getUsuarios();
getTransferencias();

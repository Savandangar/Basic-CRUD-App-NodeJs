function submitData() {
  const id = document.querySelector("#id").value;
  const name = document.querySelector("#name").value.trim();
  const model = document.querySelector("#model").value.trim();
  const color = document.querySelector("#color").value.trim();
  const year = document.querySelector("#year").value.trim();

  if (!name || !model || !color || !year) {
    document.getElementById("required").style = "display: flex";
    return;
  }

  if (isNaN(year) || year.length !== 4) {
    document.getElementById("validYear").style = "display: flex";
    return;
  }
  const obj = {
    id: id,
    name: name,
    model: model,
    color: color,
    year: year,
  };

  if (id) {
    fetch(`/data/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    })
      .then((Response) => Response.json())
      .then((data) => {
        if (data.status === 200) {
          populateData();
        } else {
          console.error("Error editing data");
        }
      })
      .catch((error) => {
        alert("Something went Wrong! Try Again");
        console.error("Error editing data", error);
      });
    document.getElementById("add").style.display = "none";
  } else {
    fetch("/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    })
      .then((Response) => Response.json())
      .then((data) => {
        if (data.status === 201) {
          addRowToTable(data.newRecord);
          closeModal();
          console.log("Data added successfully");
        } else {
          alert("Something went Wrong! Try Again");
          console.error("Error adding data");
        }
      })
      .catch((error) => {
        console.error("Error adding data", error);
        alert("Something went Wrong! Try Again");
      });
    document.getElementById("add").style.display = "none";
  }
}

function closeModal() {
  const modal = document.querySelector("#addEditModal");
  const bootstrapModal = bootstrap.Modal.getInstance(modal);
  bootstrapModal.hide();
}

function addRowToTable(data) {
  tableBody.innerHTML += `
                          <tr data-id="${data.id}">
                              <td>${data.name}</td>
                              <td>${data.model}</td>
                              <td>${data.color}</td>
                              <td>${data.year}</td>
                              <td>
                                  <button type="button" class="btn btn-edit" onclick="showForm('${data.id}')" data-bs-toggle="modal" data-bs-target="#addEditModal"><i class="fas fa-edit"></i></button>&nbsp;
                                  <button type="button" class="btn btn-del" data-id="${data.id}" data-bs-toggle="modal" data-bs-target="#deleteModal"><i class="fas fa-trash"></i></button>
                              </td>
                          </tr>
                        `;
}

let tableData = [];
function populateData() {
  if (tableData.length === 0) {
    fetch("/data")
      .then((Response) => Response.json())
      .then((cars) => {
        tableData = cars;
        renderTableBody(tableData);
      })
      .catch((error) => {
        console.error("Error fetching data", error);
        alert("Something went Wrong! Try Again");
      });
  }
}

let tableBody = document.getElementById("data-body");
function renderTableBody(tableData) {
  tableData.cars.forEach((item) => {
    // Rebuild the table with updated data
    tableBody.innerHTML += `
                            <tr data-id="${item.id}">
                                <td>${item.name}</td>
                                <td>${item.model}</td>
                                <td>${item.color}</td>
                                <td>${item.year}</td>
                                <td>
                                    <button type="button" class="btn btn-edit" onclick="showForm('${item.id}')" data-bs-toggle="modal" data-bs-target="#addEditModal"><i class="fas fa-edit"></i></button>&nbsp;
                                    <button type="button" class="btn btn-del" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#deleteModal"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        `;
  });
}

function showForm(id) {
  document.getElementById("year").addEventListener("keypress", function (e) {
    if (!/^\d*$/.test(e.key)) {
      e.preventDefault();
    }
  });
  const messages = document.querySelectorAll(".require");
  messages.forEach((message) => {
    message.style.display = "none";
  });
  const dataToEdit = tableData.cars.find((item) => item.id === id);

  if (dataToEdit) {
    document.querySelector("#addEditModalLabel").innerText = "Edit Record";
    document.querySelector("#id").value = dataToEdit.id;
    document.querySelector("#name").value = dataToEdit.name;
    document.querySelector("#model").value = dataToEdit.model;
    document.querySelector("#color").value = dataToEdit.color;
    document.querySelector("#year").value = dataToEdit.year;
    document.querySelector("#addDetails").innerText = "Update";
  } else {
    document.querySelector("#addEditModalLabel").innerText = "Add Record";
    document.querySelector("#id").value = "";
    document.querySelector("#name").value = "";
    document.querySelector("#model").value = "";
    document.querySelector("#color").value = "";
    document.querySelector("#year").value = "";
    document.querySelector("#addDetails").innerText = "Submit";
  }
}

document
  .getElementById("deleteModal")
  .addEventListener("show.bs.modal", function (event) {
    const button = event.relatedTarget;
    const id = button.getAttribute("data-id");
    const confirmDeleteButton = document.getElementById("confirmDelete");

    confirmDeleteButton.onclick = function () {
      deleteRow(id);
    };
  });

function deleteRow(id) {
  fetch(`/data/${id}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Response from server:", data);
      if (data.status === 200) {
        const row = document.querySelector(`#data-body tr[data-id="${id}"]`);
        if (row) {
          row.remove();
          console.log("Row deleted successfully.");
        } else {
          alert("Something went Wrong! Try Again");
          console.error("Row not found in the table.");
        }
      } else {
        alert("Something went Wrong! Try Again");
        console.error("Error deleting data:", data.message);
      }
    })
    .catch((error) => {
      alert("Something went Wrong! Try Again");
      console.error("Error deleting data:", error);
    });
}

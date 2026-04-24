const form = document.querySelector("#allocation-form");
const detailRowsContainer = document.querySelector("#detail-rows");
const rowTemplate = document.querySelector("#detail-row-template");
const addRowButton = document.querySelector("#add-row");
const detailsError = document.querySelector("#details-error");
const skuModal = document.querySelector("#sku-modal");
const skuFilterInput = document.querySelector("#sku-filter");
const skuTableBody = document.querySelector("#sku-table-body");

const skuCatalog = [
  {
    SKU_number: "SKU-1001",
    SKU_name: "Organic Green Tea",
    batch_number: "BT-240301",
    stock_quantity: 180,
  },
  {
    SKU_number: "SKU-1002",
    SKU_name: "Ceramic Mug 12oz",
    batch_number: "BT-240318",
    stock_quantity: 72,
  },
  {
    SKU_number: "SKU-1003",
    SKU_name: "Cotton Tote Bag",
    batch_number: "BT-240322",
    stock_quantity: 240,
  },
  {
    SKU_number: "SKU-1004",
    SKU_name: "Sparkling Water Pack",
    batch_number: "BT-240401",
    stock_quantity: 96,
  },
  {
    SKU_number: "SKU-1005",
    SKU_name: "LED Desk Lamp",
    batch_number: "BT-240409",
    stock_quantity: 38,
  },
  {
    SKU_number: "SKU-1006",
    SKU_name: "Notebook A5",
    batch_number: "BT-240414",
    stock_quantity: 410,
  },
];

let activeSkuRow = null;

const warehouseSelects = [
  document.querySelector("#from_warehouse_select"),
  document.querySelector("#to_warehouse_select"),
];

initializeForm();

function initializeForm() {
  setDefaultCreationDate();
  warehouseSelects.forEach((select) => toggleCustomInput(select));
  addDetailRow();

  addRowButton.addEventListener("click", () => addDetailRow());

  form.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".remove-row");
    const skuInput = event.target.closest(".sku-picker-input");

    if (skuInput) {
      openSkuModal(skuInput.closest(".detail-row"));
      return;
    }

    if (!removeButton) {
      return;
    }

    removeButton.closest(".detail-row").remove();
    clearDetailsError();
  });

  form.addEventListener("change", (event) => {
    if (event.target.matches("select[data-custom-target]")) {
      toggleCustomInput(event.target);
      clearFieldError(event.target.closest(".field"));
    }
  });

  form.addEventListener("input", (event) => {
    const field = event.target.closest(".field");

    if (field) {
      clearFieldError(field);
    }

    if (event.target.closest(".detail-row")) {
      clearDetailsError();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = validateForm();

    if (!result.isValid) {
      return;
    }
  });

  skuModal.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-modal='true']")) {
      closeSkuModal();
    }
  });

  skuFilterInput.addEventListener("input", () => {
    renderSkuTable(skuFilterInput.value);
  });

  skuTableBody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-sku-index]");

    if (!button || !activeSkuRow) {
      return;
    }

    applySkuSelection(activeSkuRow, skuCatalog[Number(button.dataset.skuIndex)]);
    closeSkuModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !skuModal.classList.contains("hidden")) {
      closeSkuModal();
    }
  });
}

function setDefaultCreationDate() {
  const creationDateInput = document.querySelector("#creation_date");

  if (creationDateInput.value) {
    return;
  }

  creationDateInput.value = getLocalDateString(new Date());
}

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDetailRow() {
  const row = rowTemplate.content.firstElementChild.cloneNode(true);
  detailRowsContainer.appendChild(row);
  clearDetailsError();
}

function openSkuModal(row) {
  activeSkuRow = row;
  skuFilterInput.value = "";
  renderSkuTable("");
  skuModal.classList.remove("hidden");
  skuModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  skuFilterInput.focus();
}

function closeSkuModal() {
  activeSkuRow = null;
  skuModal.classList.add("hidden");
  skuModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function renderSkuTable(filterText) {
  const normalizedFilter = filterText.trim().toLowerCase();
  const matchingItems = skuCatalog
    .map((item, index) => ({ ...item, index }))
    .filter((item) => {
      if (!normalizedFilter) {
        return true;
      }

      return [
        item.SKU_number,
        item.SKU_name,
        item.batch_number,
        String(item.stock_quantity),
      ].some((value) => value.toLowerCase().includes(normalizedFilter));
    });

  if (matchingItems.length === 0) {
    skuTableBody.innerHTML =
      '<tr><td colspan="4" class="empty-state">No SKU matches your filter.</td></tr>';
    return;
  }

  skuTableBody.innerHTML = matchingItems
    .map(
      (item) => `
        <tr>
          <td>
            <button type="button" class="sku-row-button" data-sku-index="${item.index}">
              ${item.SKU_number}
            </button>
          </td>
          <td>${item.SKU_name}</td>
          <td>${item.batch_number}</td>
          <td>${item.stock_quantity}</td>
        </tr>
      `
    )
    .join("");
}

function applySkuSelection(row, skuRecord) {
  row.querySelector('[name="SKU_number"]').value = skuRecord.SKU_number;
  row.querySelector('[name="SKU_name"]').value = skuRecord.SKU_name;
  row.querySelector('[name="batch_number"]').value = skuRecord.batch_number;
  clearFieldError(row.querySelector('[name="SKU_number"]').closest(".field"));
  clearFieldError(row.querySelector('[name="SKU_name"]').closest(".field"));
  clearFieldError(row.querySelector('[name="batch_number"]').closest(".field"));
  clearDetailsError();
}

function toggleCustomInput(selectElement) {
  const targetName = selectElement.dataset.customTarget;
  const field = selectElement.closest(".field");
  const customInput = field.querySelector(`[name="${targetName}"]`);
  const customValues = new Set(["Custom", "Other"]);
  const shouldShow = customValues.has(selectElement.value);

  customInput.disabled = !shouldShow;
  customInput.classList.toggle("hidden", !shouldShow);

  if (!shouldShow) {
    customInput.value = "";
  }
}

function validateForm() {
  clearAllErrors();

  const payload = {
    creation_date: document.querySelector("#creation_date").value,
    execution_date: document.querySelector("#execution_date").value,
    Remark: document.querySelector("#remark").value.trim(),
    From_warehouse: resolveCompositeValue(
      document.querySelector("#from_warehouse_select"),
      document.querySelector("#from_warehouse_custom")
    ),
    To_warehouse: resolveCompositeValue(
      document.querySelector("#to_warehouse_select"),
      document.querySelector("#to_warehouse_custom")
    ),
    details: [],
  };

  let isValid = true;

  if (!payload.From_warehouse) {
    showFieldError("From_warehouse", "Choose or enter a source warehouse.");
    isValid = false;
  }

  if (!payload.To_warehouse) {
    showFieldError("To_warehouse", "Choose or enter a destination warehouse.");
    isValid = false;
  }

  const rows = Array.from(detailRowsContainer.querySelectorAll(".detail-row"));

  if (rows.length === 0) {
    showDetailsError("Add at least one detail row before submitting.");
    isValid = false;
  }

  rows.forEach((row) => {
    const skuNumber = row.querySelector('[name="SKU_number"]').value.trim();
    const skuName = row.querySelector('[name="SKU_name"]').value.trim();
    const batchNumber = row.querySelector('[name="batch_number"]').value.trim();
    const goodsStatus = resolveCompositeValue(
      row.querySelector('[name="goods_status_select"]'),
      row.querySelector('[name="goods_status_custom"]')
    );
    const quantityRaw = row.querySelector('[name="quantity"]').value.trim();
    const quantity = Number.parseInt(quantityRaw, 10);
    let rowValid = true;

    if (!skuNumber) {
      showRowError(row, "SKU_number", "SKU number is required.");
      rowValid = false;
    }

    if (!batchNumber) {
      showRowError(row, "batch_number", "Batch number is required.");
      rowValid = false;
    }

    if (!/^[1-9]\d*$/.test(quantityRaw)) {
      showRowError(row, "quantity", "Quantity must be a positive integer.");
      rowValid = false;
    }

    if (rowValid) {
      payload.details.push({
        SKU_number: skuNumber,
        SKU_name: skuName,
        batch_number: batchNumber,
        goods_status: goodsStatus,
        quantity,
      });
      return;
    }

    isValid = false;
  });

  if (payload.details.length === 0) {
    showDetailsError("At least one valid SKU row is required.");
    isValid = false;
  }

  return { isValid, payload };
}

function resolveCompositeValue(selectElement, customInput) {
  const selectValue = selectElement.value.trim();

  if (selectValue === "Custom" || selectValue === "Other") {
    return customInput.value.trim();
  }

  return selectValue;
}

function clearAllErrors() {
  detailsError.textContent = "";
  form.querySelectorAll(".field").forEach((field) => clearFieldError(field));
}

function clearFieldError(field) {
  field.classList.remove("has-error");
  const errorNode = field.querySelector(".error-message");

  if (errorNode) {
    errorNode.textContent = "";
  }
}

function showError(field, message) {
  field.classList.add("has-error");
  const errorNode = field.querySelector(".error-message");

  if (errorNode) {
    errorNode.textContent = message;
  }
}

function showFieldError(errorFor, message) {
  const errorNode = form.querySelector(`[data-error-for="${errorFor}"]`);

  if (!errorNode) {
    return;
  }

  const field = errorNode.closest(".field");
  field.classList.add("has-error");
  errorNode.textContent = message;
}

function showRowError(row, fieldName, message) {
  const errorNode = row.querySelector(`[data-error-for="${fieldName}"]`);

  if (!errorNode) {
    return;
  }

  const field = errorNode.closest(".field");
  field.classList.add("has-error");
  errorNode.textContent = message;
}

function showDetailsError(message) {
  detailsError.textContent = message;
}

function clearDetailsError() {
  detailsError.textContent = "";
}

const searchForm = document.querySelector("#request-search-form");
const resetButton = document.querySelector("#reset-search");
const requestTableBody = document.querySelector("#request-table-body");
const tableSummary = document.querySelector("#table-summary");
const requestModal = document.querySelector("#request-modal");
const requestDetailContent = document.querySelector("#request-detail-content");

const allocationRequests = [
  {
    request_order_number: "DB202604240001",
    from_warehouse: "North Hub",
    to_warehouse: "Central Hub",
    total_quantity: 120,
    submitter: "Ava Chen",
    creation_date: "2026-04-24",
    request_status: "Approving",
    sku_numbers: ["SKU-1001", "SKU-1002"],
    remark: "Priority replenishment for Central Hub",
    execution_date: "2026-04-25",
  },
  {
    request_order_number: "DB202604240002",
    from_warehouse: "South Hub",
    to_warehouse: "Returns Center",
    total_quantity: 48,
    submitter: "Leo Wang",
    creation_date: "2026-04-24",
    request_status: "delivering",
    sku_numbers: ["SKU-1004"],
    remark: "Route confirmed with delivery team",
    execution_date: "2026-04-24",
  },
  {
    request_order_number: "DB202604230001",
    from_warehouse: "East Depot",
    to_warehouse: "Overflow Site",
    total_quantity: 86,
    submitter: "Mia Liu",
    creation_date: "2026-04-23",
    request_status: "stock pending",
    sku_numbers: ["SKU-1003", "SKU-1006"],
    remark: "Pending final stock confirmation before release",
    execution_date: "2026-04-26",
  },
  {
    request_order_number: "DB202604220001",
    from_warehouse: "Custom Cold Storage",
    to_warehouse: "Central Hub",
    total_quantity: 210,
    submitter: "Noah Zhang",
    creation_date: "2026-04-22",
    request_status: "finished",
    sku_numbers: ["SKU-1005", "SKU-1002"],
    remark: "Completed and signed off by receiving warehouse",
    execution_date: "2026-04-22",
  },
];

initializePage();

function initializePage() {
  renderTable(allocationRequests);

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    renderTable(filterRequests(getFilters()));
  });

  resetButton.addEventListener("click", () => {
    searchForm.reset();
    renderTable(allocationRequests);
  });

  requestTableBody.addEventListener("click", (event) => {
    const detailsLink = event.target.closest("[data-request-number]");

    if (!detailsLink) {
      return;
    }

    const request = allocationRequests.find(
      (item) => item.request_order_number === detailsLink.dataset.requestNumber
    );

    if (!request) {
      return;
    }

    openRequestModal(request);
  });

  requestModal.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-request-modal='true']")) {
      closeRequestModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !requestModal.classList.contains("hidden")) {
      closeRequestModal();
    }
  });
}

function getFilters() {
  return {
    requestOrderNumber: document.querySelector("#request_order_number").value.trim().toLowerCase(),
    submitter: document.querySelector("#submitter").value.trim().toLowerCase(),
    requestStatus: document.querySelector("#request_status").value.trim(),
    skuNumber: document.querySelector("#sku_number").value.trim().toLowerCase(),
  };
}

function filterRequests(filters) {
  return allocationRequests.filter((request) => {
    const matchesRequestNumber =
      !filters.requestOrderNumber ||
      request.request_order_number.toLowerCase().includes(filters.requestOrderNumber);
    const matchesSubmitter =
      !filters.submitter || request.submitter.toLowerCase().includes(filters.submitter);
    const matchesStatus =
      !filters.requestStatus || request.request_status === filters.requestStatus;
    const matchesSku =
      !filters.skuNumber ||
      request.sku_numbers.some((skuNumber) =>
        skuNumber.toLowerCase().includes(filters.skuNumber)
      );

    return matchesRequestNumber && matchesSubmitter && matchesStatus && matchesSku;
  });
}

function renderTable(requests) {
  tableSummary.textContent = `${requests.length} request${requests.length === 1 ? "" : "s"} found`;

  if (requests.length === 0) {
    requestTableBody.innerHTML =
      '<tr><td colspan="8" class="empty-state">No allocation request matches the current filters.</td></tr>';
    return;
  }

  requestTableBody.innerHTML = requests
    .map(
      (request) => `
        <tr>
          <td>${request.request_order_number}</td>
          <td>${request.from_warehouse}</td>
          <td>${request.to_warehouse}</td>
          <td>${request.total_quantity}</td>
          <td>${request.submitter}</td>
          <td>${request.creation_date}</td>
          <td><span class="status-pill">${request.request_status}</span></td>
          <td><button type="button" class="table-link" data-request-number="${request.request_order_number}">Details</button></td>
        </tr>
      `
    )
    .join("");
}

function openRequestModal(request) {
  requestDetailContent.innerHTML = `
    <div class="request-detail-grid">
      <div class="request-detail-item">
        <span class="detail-label">Request Order Number</span>
        <strong>${request.request_order_number}</strong>
      </div>
      <div class="request-detail-item">
        <span class="detail-label">Submitter</span>
        <strong>${request.submitter}</strong>
      </div>
      <div class="request-detail-item">
        <span class="detail-label">From Warehouse</span>
        <strong>${request.from_warehouse}</strong>
      </div>
      <div class="request-detail-item">
        <span class="detail-label">To Warehouse</span>
        <strong>${request.to_warehouse}</strong>
      </div>
      <div class="request-detail-item">
        <span class="detail-label">Creation Date</span>
        <strong>${request.creation_date}</strong>
      </div>
      <div class="request-detail-item">
        <span class="detail-label">Execution Date</span>
        <strong>${request.execution_date}</strong>
      </div>
      <div class="request-detail-item">
        <span class="detail-label">Total Allocation Quantity</span>
        <strong>${request.total_quantity}</strong>
      </div>
      <div class="request-detail-item">
        <span class="detail-label">Request Order Status</span>
        <strong>${request.request_status}</strong>
      </div>
    </div>
    <div class="request-detail-block">
      <span class="detail-label">SKU Numbers</span>
      <p>${request.sku_numbers.join(", ")}</p>
    </div>
    <div class="request-detail-block">
      <span class="detail-label">Remark</span>
      <p>${request.remark || "-"}</p>
    </div>
  `;

  requestModal.classList.remove("hidden");
  requestModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeRequestModal() {
  requestModal.classList.add("hidden");
  requestModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

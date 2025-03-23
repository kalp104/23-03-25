$(document).ready(function () {
  toastr.options.closeButton = true;
  var successMessage = window.appData.successMessage;
  if (successMessage) {
    toastr.success(successMessage, "Success", { timeOut: 3000 });
  }

  var rowsPerPage = 5;
  var currentPage = 1;
  var totalTables = window.appData.totalTables;
  var selectedSection = null;
  var selectedSectionName = "";
  var searchTerm = "";
  var selectedTableIds = new Set();

  // AJAX call to fetch tables
  function fetchTables(sectionId, searchTerm = "", page, pageSize) {
    $.ajax({
      url: "/Section/FilterTables",
      type: "GET",
      data: {
        sectionId: sectionId,
        searchTable: searchTerm,
        pageNumber: page,
        pageSize: pageSize,
      },
      success: function (data) {
        $("#collapse5").html(data);
        totalTables =
          parseInt($("#TableContainer").attr("data-total-tables")) || 0;
        restoreCheckboxStates();
        updatePagination();
      },
      error: function () {
        alert("Error loading tables.");
      },
    });
  }

  // Restore checkbox states after table reload
  function restoreCheckboxStates() {
    $(".Table-checkbox").each(function () {
      var tableId = $(this).data("table-id");
      $(this).prop("checked", selectedTableIds.has(tableId));
    });
    updateSelectAllCheckbox();
  }

  // Update pagination and button states
  function updatePagination() {
    var totalPages = Math.ceil(totalTables / rowsPerPage);
    var startItem = (currentPage - 1) * rowsPerPage + 1;
    var endItem = Math.min(currentPage * rowsPerPage, totalTables);

    $("#pagination-info").text(
      `Showing ${startItem}-${endItem} of ${totalTables}`
    );
    $("#prevPage4").toggleClass("disabled", currentPage === 1);
    $("#nextPage4").toggleClass("disabled", currentPage >= totalPages);

    var checkedCount = selectedTableIds.size;
    $("#deleteMultipleTablesBtn").prop("disabled", checkedCount === 0);
  }

  // Update "Select All" checkbox based on current page
  function updateSelectAllCheckbox() {
    var allChecked =
      $(".Table-checkbox:visible").length > 0 &&
      $(".Table-checkbox:visible").length ===
        $(".Table-checkbox:visible:checked").length;
    $("#selectAllCheckBoxTable").prop("checked", allChecked);
  }

  // Previous page click handler
  $(document).on("click", "#prevPage4", function (e) {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      fetchTables(selectedSection, searchTerm, currentPage, rowsPerPage);
    }
  });

  // Next page click handler
  $(document).on("click", "#nextPage4", function (e) {
    e.preventDefault();
    if (currentPage * rowsPerPage < totalTables) {
      currentPage++;
      fetchTables(selectedSection, searchTerm, currentPage, rowsPerPage);
    }
  });

  // Page size change handler
  $(document).on("click", ".page-size-option4", function (e) {
    e.preventDefault();
    rowsPerPage = parseInt($(this).data("size"));
    $("#itemsPerPageBtn4").text(rowsPerPage);
    currentPage = 1;
    fetchTables(selectedSection, searchTerm, currentPage, rowsPerPage);
  });

  // Section selection handler
  $(document).on("click", ".section-link", function (e) {
    e.preventDefault();
    $(".section-link").removeClass("active");
    $(this).addClass("active");
    selectedSection = $(this).data("sectionid");
    selectedSectionName = $(this).data("sectionname");
    currentPage = 1;
    selectedTableIds.clear();
    fetchTables(selectedSection, searchTerm, currentPage, rowsPerPage);
    $(".activePens").addClass("d-none");
    $(this).find(".activePens").removeClass("d-none");
    $("#TableAddModalID").prop("disabled", false);
  });

  // Search input handler
  $(document).on("input", "#searchInput", function () {
    searchTerm = $(this).val().trim();
    currentPage = 1;
    fetchTables(selectedSection, searchTerm, currentPage, rowsPerPage);
  });

  // Select All checkbox handler
  $(document).on("change", "#selectAllCheckBoxTable", function () {
    var isChecked = this.checked;
    $(".Table-checkbox:visible").each(function () {
      var tableId = $(this).data("table-id");
      $(this).prop("checked", isChecked);
      if (isChecked) {
        selectedTableIds.add(tableId);
      } else {
        selectedTableIds.delete(tableId);
      }
    });
    updatePagination();
  });

  // Individual checkbox handler
  $(document).on("change", ".Table-checkbox", function () {
    var tableId = $(this).data("table-id");
    if ($(this).is(":checked")) {
      selectedTableIds.add(tableId);
    } else {
      selectedTableIds.delete(tableId);
    }
    updatePagination();
    updateSelectAllCheckbox();
  });

  // Delete multiple tables button handler
  $(document).on("click", "#deleteMultipleTablesBtn", function (e) {
    e.preventDefault();
    if (selectedTableIds.size > 0) {
      $("#deleteSelectedTableIds").val(Array.from(selectedTableIds).join(","));
      console.log($("#deleteSelectedTableIds").val());
      $("#deleteTablesModal").modal("show");
    }
  });

  // Handle form submission for deletion
  $(document).on("submit", "#deleteTablesModal form", function (e) {
    e.preventDefault();
    $.ajax({
      url: $(this).attr("action"),
      type: "POST",
      data: $(this).serialize(),
      success: function () {
        selectedTableIds.clear();
        fetchTables(selectedSection, searchTerm, currentPage, rowsPerPage);
        $("#deleteTablesModal").modal("hide");
        toastr.success("Tables deleted successfully", "Success", {
          timeOut: 3000,
        });
      },
      error: function () {
        alert("Error deleting tables.");
        $("#deleteTablesModal").modal("hide");
      },
    });
  });

  // Initial load
  fetchTables(selectedSection, searchTerm, currentPage, rowsPerPage);
  $(".section-link.active").find(".activePens").removeClass("d-none");
  $("#TableAddModalID").prop("disabled", true);
  if ($(".section-link.active").length > 0) {
    selectedSectionName = $(".section-link.active").data("sectionname");
    selectedSection = $(".section-link.active").data("sectionid");
  }
});

$(document).ready(function () {
  toastr.options.closeButton = true;
  var rowsPerPage = 5;
  var currentPage = 1;
  var totalItems = 0;
  var searchTerm = "";
  var orderStatus = "";
  var dateRange = "";
  var fromDate = "";
  var toDate = "";

  console.log("hello");
  // Get current date (today) in YYYY-MM-DD format
  var today = new Date().toISOString().split("T")[0];

  // Set max attribute for ToDateInput and FromDateInput
  $("#ToDateInput").attr("max", today);
  $("#FromDateInput").attr("max", today);

  // Validation function
  function validateDates() {
    var fromDateVal = $("#FromDateInput").val();
    var toDateVal = $("#ToDateInput").val();
    var isValid = true;

    $("#fromDateError").text("");
    $("#toDateError").text("");

    if (fromDateVal && toDateVal) {
      if (new Date(fromDateVal) > new Date(toDateVal)) {
        $("#fromDateError").text("Invalid Date");
        isValid = false;
      }
    }

    if (toDateVal && new Date(toDateVal) > new Date(today)) {
      $("#toDateError").text("To Date cannot be greater than today");
      isValid = false;
    }

    return isValid;
  }

  // Real-time validation on input change
  $("#FromDateInput, #ToDateInput").on("change", function () {
    validateDates();
  });

  // Fetch orders function
  function fetchOrders(page, pageSize) {
    $.ajax({
      url: "/Order/FilterOrders",
      type: "GET",
      data: {
        searchTerm: searchTerm,
        pageNumber: page,
        pageSize: pageSize,
        status: orderStatus,
        dateRange: dateRange,
        fromDate: fromDate,
        toDate: toDate,
      },
      success: function (data) {
        $("#OrderContainer").html(data);
        totalItems =
          parseInt($("#TableContainer").attr("data-total-items")) || 0;
        updatePagination();
      },
      error: function () {
        console.log("Error loading orders.");
        toastr.error("Error loading orders.", "Error", { timeOut: 3000 });
      },
    });
  }

  // Update pagination info
  function updatePagination() {
    var totalPages = Math.ceil(totalItems / rowsPerPage);
    var startItem = (currentPage - 1) * rowsPerPage + 1;
    var endItem = Math.min(currentPage * rowsPerPage, totalItems);
    $("#pagination-info").text(
      `Showing ${startItem}-${endItem} of ${totalItems}`
    );
    $("#prevPage").toggleClass("disabled", currentPage === 1);
    $("#nextPage").toggleClass("disabled", currentPage >= totalPages);
  }

  // Page size change
  $(document).on("click", ".page-size-option", function (e) {
    e.preventDefault();
    var newSize = parseInt($(this).data("size"));
    if (newSize !== rowsPerPage) {
      rowsPerPage = newSize;
      $("#itemsPerPageBtn").html(
        `${rowsPerPage} <span><i class="bi bi-chevron-down"></i></span>`
      );
      currentPage = 1;
      fetchOrders(currentPage, rowsPerPage);
    }
    $("#itemsPerPageMenu").hide();
  });

  // Toggle dropdown menu
  $("#itemsPerPageBtn").on("click", function () {
    $("#itemsPerPageMenu").toggle();
  });

  // Previous page
  $(document).on("click", "#prevPage", function (e) {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      fetchOrders(currentPage, rowsPerPage);
    }
  });

  // Next page
  $(document).on("click", "#nextPage", function (e) {
    e.preventDefault();
    if (currentPage * rowsPerPage < totalItems) {
      currentPage++;
      fetchOrders(currentPage, rowsPerPage);
    }
  });

  // Search input
  $(document).on("input", "#search_tax", function () {
    searchTerm = $(this).val().trim();
  });

  // Search button with validation
  $("#searchBtn").on("click", function () {
    fromDate = $("#FromDateInput").val();
    toDate = $("#ToDateInput").val();
    orderStatus = $("#orderStatusFilter").val();
    dateRange = $("#dateRangeFilter").val();

    if (validateDates()) {
      currentPage = 1;
      fetchOrders(currentPage, rowsPerPage);
    } else {
      toastr.error(
        "Please correct the date errors before searching.",
        "Error",
        { timeOut: 3000 }
      );
    }
  });

  // Clear button
  $("#clearBtn").on("click", function () {
    searchTerm = "";
    orderStatus = "";
    dateRange = "";
    fromDate = "";
    toDate = "";
    $("#search_tax").val("");
    $("#orderStatusFilter").val("");
    $("#dateRangeFilter").val("");
    $("#FromDateInput").val("");
    $("#ToDateInput").val("");
    $("#fromDateError").text("");
    $("#toDateError").text("");
    currentPage = 1;
    fetchOrders(currentPage, rowsPerPage);
  });

  // Export button with loader
  $("#exportBtn").on("click", function (e) {
    e.preventDefault();
    if (validateDates()) {
      // Show loader, hide icon
      $("#exportLoader").removeClass("d-none");
      $("#exportBtn .bi-box-arrow-up-right").addClass("d-none");

      // Ensure all variables are populated
      var url =
        "/Order/ExportOrders?" +
        $.param({
          searchTerm: searchTerm,
          status: orderStatus,
          dateRange: $("#dateRangeFilter").val(),
        });

      var link = document.createElement("a");
      link.href = url;
      link.download = "OrdersExport.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Hide loader, show icon after a delay
      setTimeout(function () {
        $("#exportLoader").addClass("d-none");
        $("#exportBtn .bi-box-arrow-up-right").removeClass("d-none");
        toastr.success("Excel file downloaded successfully.", "Success", {
          timeOut: 3000,
        });
      }, 2000); // Adjust delay as needed
    } else {
      toastr.error(
        "Please correct the date errors before exporting.",
        "Error",
        { timeOut: 3000 }
      );
    }
  });

  $(document).on("click", "#OrderDetailEye", function (e) {
    e.preventDefault();
    var orderId = $(this).data("order-id");
    console.log("clicked order id : ", orderId);
    window.location.href = "/Order/OrderDetail?orderId=" + orderId;
  });

  console.log("hello");
  $(document).on("click", "#orderAscending", function (e) {
    e.preventDefault();
    console.log("buttonClicked");
  });

  // Initial fetch
  fetchOrders(currentPage, rowsPerPage);
});

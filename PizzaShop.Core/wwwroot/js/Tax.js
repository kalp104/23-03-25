$(document).ready(function () {
    var searchTerm = "";

    function fetchData(searchTerm) {
        $.ajax({
            type: "GET",
            url: "/Tax/FatchTaxes",
            data: { searchTerm: searchTerm },
            success: function (data) {
                $("#TaxContainer").html(data);
            }
        });
    }

    $(document).on("input", "#search_tax", function () {
        var searchTerm = $(this).val();
        fetchData(searchTerm);
    });

    $(document).on("click", ".delete-Tax-link", function () {
        var TaxId = $(this).data("tax-id");
        $("#deleteTaxId").val(TaxId);
        $("#deleteTaxModal").modal("show");
    });

    // Open modal for adding a new tax
    $("#addTaxBtn").on("click", function () {
        $("#taxModalLabel").text("Add Tax");
        $("#taxForm").attr("action", "/Tax/AddTax");
        $("#TaxId").val("");
        $("#TaxName").val("");
        $("#taxType").val("");
        $("#TaxAmount").val("");
        $("#Isenabled").prop("checked", false);
        $("#Isdefault").prop("checked", false);
        $("#taxModal").modal("show");
    });

    // Open modal for editing an existing tax
    $(document).on("click", ".edit-Tax-link", function () {
        var TaxId = $(this).data("tax-id");
        var TaxName = $(this).data("tax-name");
        var TaxType = $(this).data("tax-type");
        var TaxIsEnabled = $(this).data("tax-isenabled");
        var TaxIsDefault = $(this).data("tax-isdefault");
        var TaxValue = $(this).data("tax-value");

        $("#taxModalLabel").text("Edit Tax");
        $("#taxForm").attr("action", "/Tax/EditTax");
        $("#TaxId").val(TaxId);
        $("#TaxName").val(TaxName);
        $("#taxType").val(TaxType);
        $("#TaxAmount").val(TaxValue);
        $("#Isenabled").prop("checked", TaxIsEnabled === 'True');
        $("#Isdefault").prop("checked", TaxIsDefault === 'True');
        $("#taxModal").modal("show");
    });

    fetchData(searchTerm);
});
// category-scripts.js
$(document).ready(function () {
    toastr.options.closeButton = true;
    var selectedItemIds = [];

    // Variables to be set from the view
    var rowsPerPage = 5;
    var currentPage = 1;
    var totalItems = window.totalItems || 0; // Passed from the view
    var selectedCategory = null;
    var searchTerm = '';
    var filterItemsUrl = window.filterItemsUrl || ''; // Passed from the view

    // Handle Edit Button Click
    $(".edit-category-button").click(function () {
        var categoryId = $(this).data("category-id");
        var categoryElement = $(`[data-category-id='${categoryId}']`);
        var categoryName = categoryElement.data("category-name");
        var categoryDescription = categoryElement.data("category-description");

        $("#editCategoryId").val(categoryId);
        $("#editCategoryName").val(categoryName);
        $("#editCategoryDescription").val(categoryDescription);
        $("#editCategoryModal").modal("show");
    });

    // Handle Delete Button Click
    $(".delete-category-btn").click(function () {
        let categoryId = $(this).data("category-id");
        $("#deleteCategoryId").val(categoryId);
        $("#deleteCategoryText").html("Are you sure you want to delete this category?");
        $("#deleteCategoryModal").modal("show");
    });

    // Toggle custom dropdown visibility
    $('#itemsPerPageBtn').on('click', function () {
        var $menu = $('#itemsPerPageMenu');
        $menu.toggle();
    });

    // Close dropdown when clicking outside
    $(document).on('click', function (e) {
        var $dropdown = $('.custom-dropdown');
        if (!$dropdown.is(e.target) && $dropdown.has(e.target).length === 0) {
            $('#itemsPerPageMenu').hide();
        }
    });

    // Handle page size selection
    $(document).on('click', '.page-size-option', function (e) {
        e.preventDefault();
        var newSize = parseInt($(this).data('size'));
        if (newSize !== rowsPerPage) {
            rowsPerPage = newSize;
            $('#itemsPerPageBtn').html(`${rowsPerPage} <span><i class="bi bi-arrow-down-short"></i></span>`);
            currentPage = 1;
            fetchItems(selectedCategory, searchTerm, currentPage, rowsPerPage);
        }
        $('#itemsPerPageMenu').hide();
    });

    // AJAX call fetch function
    function fetchItems(categoryId, searchTerm = '', page, pageSize) {
        $.ajax({
            url: filterItemsUrl,
            type: 'GET',
            data: { categoryId: categoryId, searchTerm: searchTerm, pageNumber: page, pageSize: pageSize },
            success: function (data) {
                $('#collapse1').html(data);
                totalItems = parseInt($('#itemsContainer').attr('data-total-items')) || 0;
                updatePagination();
            },
            error: function () {
                alert('Error loading items.');
            }
        });
    }

    // Pagination update function
    function updatePagination() {
        var totalPages = Math.ceil(totalItems / rowsPerPage);
        var startItem = (currentPage - 1) * rowsPerPage + 1;
        var endItem = Math.min(currentPage * rowsPerPage, totalItems);
        $("#pagination-info").text(`Showing ${startItem}-${endItem} of ${totalItems}`);
        $("#prevPage").toggleClass("disabled", currentPage === 1);
        $("#nextPage").toggleClass("disabled", currentPage >= totalPages);
    }

    // Pagination controls
    $(document).on('click', '#prevPage', function (e) {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            fetchItems(selectedCategory, searchTerm, currentPage, rowsPerPage);
        }
    });

    $(document).on('click', '#nextPage', function (e) {
        e.preventDefault();
        if (currentPage * rowsPerPage < totalItems) {
            currentPage++;
            fetchItems(selectedCategory, searchTerm, currentPage, rowsPerPage);
        }
    });

    $(document).on('click', '.category-link', function (e) {
        e.preventDefault();
        $(".category-link").removeClass("active");
        $(this).addClass("active");
        selectedCategory = $(this).data('category-id');
        currentPage = 1;
        fetchItems(selectedCategory, searchTerm, currentPage, rowsPerPage);
    });

    $(document).on('input', '#searchInput', function () {
        searchTerm = $(this).val().trim();
        currentPage = 1;
        fetchItems(selectedCategory, searchTerm, currentPage, rowsPerPage);
    });

    // Select/Deselect all checkboxes
    $('#selectAllCheckbox').on('click', function () {
        var isChecked = this.checked;
        $('.item-checkbox').prop('checked', isChecked);
        var currentPageIds = $('.item-checkbox').map(function () {
            return $(this).val();
        }).get();

        if (isChecked) {
            currentPageIds.forEach(function (id) {
                if (!selectedItemIds.includes(id)) {
                    selectedItemIds.push(id);
                }
            });
        } else {
            selectedItemIds = selectedItemIds.filter(id => !currentPageIds.includes(id));
        }
        $('#deleteItems').prop('disabled', selectedItemIds.length === 0);
    });

    // Individual checkbox selection
    $(document).on('click', '.item-checkbox', function () {
        var itemId = $(this).val();
        if ($(this).is(':checked')) {
            if (!selectedItemIds.includes(itemId)) {
                selectedItemIds.push(itemId);
            }
        } else {
            selectedItemIds = selectedItemIds.filter(id => id !== itemId);
        }
        $('#selectAllCheckbox').prop('checked', $('.item-checkbox').length === $('.item-checkbox:checked').length);
        $('#deleteItems').prop('disabled', selectedItemIds.length === 0);
    });

    // Multiple delete button
    $('#deleteItems').on('click', function (e) {
        e.preventDefault();
        if (!$(this).prop('disabled')) {
            $('#exampleModal3').modal('show');
        }
    });

    // Populate selected item IDs in the multiple delete modal
    $('#exampleModal3').on('show.bs.modal', function () {
        $('#selectedItemIds').val(selectedItemIds.join(','));
        console.log("Selected Item IDs for Multiple Delete:", selectedItemIds);
    });

    // Handle "No" button click to clear selections
    $('#cancelMultipleDelete').on('click', function () {
        selectedItemIds = [];
        $('.item-checkbox').prop('checked', false);
        $('#selectAllCheckbox').prop('checked', false);
        $('#deleteItems').prop('disabled', true);
        $('#exampleModal3').modal('hide');
    });

    // Initial fetch
    fetchItems(selectedCategory, searchTerm, currentPage, rowsPerPage);
});
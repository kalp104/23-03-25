$(document).ready(function () {
    toastr.options.closeButton = true;

    // Variables for category items view
    var rowsPerPage = 5;
    var currentPage = 1;
    var totalItems = window.totalItems || 0; // Passed from the view
    var selectedCategory = null;
    var searchTerm = '';
    var selectedItemIds = []; // Array to store selected item IDs
    var filterItemsUrl = window.filterItemsUrl || ''; // Passed from the view

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
            $('#itemsPerPageBtn').html(`${rowsPerPage} <span><i class="bi bi-chevron-down"></i></span>`);
            currentPage = 1;
            fetchItems(selectedCategory, searchTerm, currentPage, rowsPerPage);
        }
        $('#itemsPerPageMenu').hide();
    });

    // AJAX fetch function for items
    function fetchItems(categoryId, searchTerm = '', page, pageSize) {
        $.ajax({
            url: filterItemsUrl,
            type: 'GET',
            data: { categoryId: categoryId, searchTerm: searchTerm, pageNumber: page, pageSize: pageSize },
            success: function (data) {
                $('#collapse1').html(data);
                totalItems = parseInt($('#itemsContainer').attr('data-total-items')) || 0;
                updatePagination();
                restoreCheckboxSelections();
                updateDeleteButtonState();
            },
            error: function () {
                console.error('Error loading items.');
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

    // Restore checkbox selections (scoped to #collapse1)
    function restoreCheckboxSelections() {
        $('#collapse1 .item-checkbox').each(function () {
            var itemId = $(this).val();
            var isSelected = selectedItemIds.includes(itemId);
            $(this).prop('checked', isSelected);
        });
        var $checkboxes = $('#collapse1 .item-checkbox');
        $('#selectAllItemsCheckbox').prop('checked', $checkboxes.length > 0 && $checkboxes.length === $checkboxes.filter(':checked').length);
    }

    // Update delete button state
    function updateDeleteButtonState() {
        $('#deleteItems').prop('disabled', selectedItemIds.length === 0);
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

    // Category link click handler
    $(document).on('click', '.category-link', function (e) {
        e.preventDefault();
        $(".category-link").removeClass("active");
        $(this).addClass("active");
        selectedCategory = $(this).data('category-id');
        currentPage = 1;
        fetchItems(selectedCategory, searchTerm, currentPage, rowsPerPage);
    });

    // Search input handler
    $(document).on('input', '#searchInput', function () {
        searchTerm = $(this).val().trim();
        currentPage = 1;
        fetchItems(selectedCategory, searchTerm, currentPage, rowsPerPage);
    });

    // Select/Deselect all checkboxes (scoped to #collapse1)
    $(document).on('change', '#collapse1 #selectAllItemsCheckbox', function () {
        var isChecked = $(this).is(':checked');
        $('#collapse1 .item-checkbox').prop('checked', isChecked);
        var currentPageIds = $('#collapse1 .item-checkbox').map(function () {
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
        updateDeleteButtonState();
    });

    // Individual checkbox selection (scoped to #collapse1)
    $(document).on('change', '#collapse1 .item-checkbox', function () {
        var itemId = $(this).val();
        if ($(this).is(':checked')) {
            if (!selectedItemIds.includes(itemId)) {
                selectedItemIds.push(itemId);
            }
        } else {
            selectedItemIds = selectedItemIds.filter(id => id !== itemId);
        }
        var $checkboxes = $('#collapse1 .item-checkbox');
        $('#selectAllItemsCheckbox').prop('checked', $checkboxes.length > 0 && $checkboxes.length === $checkboxes.filter(':checked').length);
        updateDeleteButtonState();
    });

    // Handle Edit Button Click
    $(document).on('click', '.edit-category-button', function () {
        var categoryId = $(this).data("category-id");
        var categoryElement = $(`[data-category-id='${categoryId}']`);
        var categoryName = categoryElement.data("category-name");
        var categoryDescription = categoryElement.data("category-description");

        $("#editCategoryId").val(categoryId);
        $("#editCategoryName").val(categoryName);
        $("#editCategoryDescription").val(categoryDescription);
        $("#editCategoryModal").modal("show");
    });

    // Handle Delete Button Click (single category)
    $(document).on('click', '.delete-category-btn', function () {
        let categoryId = $(this).data("category-id");
        $("#deleteCategoryId").val(categoryId);
        $("#deleteCategoryText").html("Are you sure you want to delete this category?");
        $("#deleteCategoryModal").modal("show");
    });

    // Multiple delete button
    $(document).on('click', '#deleteItems', function (e) {
        e.preventDefault();
        if (!$(this).prop('disabled') && selectedItemIds.length > 0) {
            $('#selectedItemIds').val(selectedItemIds.join(','));
            $('#exampleModal3').modal('show');
        }
    });

    // Populate selected item IDs in the multiple delete modal
    $('#exampleModal3').on('show.bs.modal', function () {
        $('#selectedItemIds').val(selectedItemIds.join(','));
        console.log("Selected Item IDs for Multiple Delete:", selectedItemIds);
    });

    // Handle multiple delete form submission
    $('#deleteMultipleForm').on('submit', function (e) {
        e.preventDefault();
        $.ajax({
            url: '/Menu/DeleteMultipleItems',
            type: 'POST',
            data: $(this).serialize(),
            success: function (response) {
                if (response && response.success) {
                    $('#exampleModal3').modal('hide');
                    selectedItemIds = []; // Clear selections
                    fetchItems(selectedCategory, searchTerm, currentPage, rowsPerPage); // Refresh the list
                    toastr.success('Items deleted successfully.');
                } else {
                    toastr.error(response?.message || 'Error deleting items.');
                }
            },
            error: function (xhr, status, error) {
                console.error('Error deleting items:', status, error);
                toastr.error('Error submitting delete request.');
            }
        });
    });

    // Handle "No" button click to close modal without clearing selections
    $('#cancelMultipleDelete').on('click', function () {
        $('#exampleModal3').modal('hide');
    });

    // Initial fetch
    fetchItems(selectedCategory, searchTerm, currentPage, rowsPerPage);
});
$(document).ready(function () {
    toastr.options.closeButton = true;

    // Variables for modifier group view
    var rowsPerPageMain = 5;
    var currentPageMain = 1;
    var totalItemsMain = window.totalItemsMain || 0; // Passed from the view
    var selectedCategoryMain = null;
    var searchTermMain = '';
    var selectedModifierIdsMain = []; // Array to store selected modifier IDs
    var filterModifiersUrl = window.filterModifiersUrl || ''; // Passed from the view

    // Toggle custom dropdown visibility
    $('#itemsPerPageBtnMain').on('click', function () {
        var $menu = $('#itemsPerPageMenuMain');
        $menu.toggle();
    });

    // Close dropdown when clicking outside
    $(document).on('click', function (e) {
        var $dropdown = $('.custom-dropdown');
        if (!$dropdown.is(e.target) && $dropdown.has(e.target).length === 0) {
            $('#itemsPerPageMenuMain').hide();
        }
    });

    // Handle page size selection
    $(document).on('click', '.page-size-option', function (e) {
        e.preventDefault();
        var newSize = parseInt($(this).data('size'));
        if (newSize !== rowsPerPageMain) {
            rowsPerPageMain = newSize;
            $('#itemsPerPageBtnMain').html(`${rowsPerPageMain} <span><i class="bi bi-chevron-down"></i></span>`);
            currentPageMain = 1;
            fetchModifiersMain(selectedCategoryMain, searchTermMain, currentPageMain, rowsPerPageMain);
        }
        $('#itemsPerPageMenuMain').hide();
    });

    // AJAX fetch function for modifiers
    function fetchModifiersMain(modifierGroupId, searchTerm = '', page, pageSize) {
        $.ajax({
            url: filterModifiersUrl,
            type: 'GET',
            data: { modifierGroupId: modifierGroupId, searchTerm: searchTerm, pageNumber: page, pageSize: pageSize },
            success: function (data) {
                $('#collapse2').html(data);
                totalItemsMain = parseInt($('#ModifiersContainer').attr('data-total-modifiers')) || 0;
                updatePaginationMain();
                restoreCheckboxSelectionsMain();
                updateDeleteButtonStateMain();
            },
            error: function () {
                console.error('Error loading modifiers in main view.');
                alert('Error loading modifiers.');
            }
        });
    }

    // Pagination update for main view
    function updatePaginationMain() {
        var totalPages = Math.ceil(totalItemsMain / rowsPerPageMain);
        var startItem = (currentPageMain - 1) * rowsPerPageMain + 1;
        var endItem = Math.min(currentPageMain * rowsPerPageMain, totalItemsMain);
        $("#pagination-info-main").text(`Showing ${startItem}-${endItem} of ${totalItemsMain}`);
        $("#prevPageMain").toggleClass("disabled", currentPageMain === 1);
        $("#nextPageMain").toggleClass("disabled", currentPageMain >= totalPages);
    }

    // Restore checkbox selections for main view (scoped to #collapse2)
    function restoreCheckboxSelectionsMain() {
        $('#collapse2 .main-item-checkbox').each(function () {
            var modifierId = $(this).val();
            var isSelected = selectedModifierIdsMain.includes(modifierId);
            $(this).prop('checked', isSelected);
        });
        var $checkboxes = $('#collapse2 .main-item-checkbox');
        $('#selectAllModifiersCheckbox').prop('checked', $checkboxes.length > 0 && $checkboxes.length === $checkboxes.filter(':checked').length);
    }

    // Update delete button state for main view
    function updateDeleteButtonStateMain() {
        $('#deleteModifiers').prop('disabled', selectedModifierIdsMain.length === 0);
    }

    // Pagination controls for main view
    $(document).on('click', '#prevPageMain', function (e) {
        e.preventDefault();
        if (currentPageMain > 1) {
            currentPageMain--;
            fetchModifiersMain(selectedCategoryMain, searchTermMain, currentPageMain, rowsPerPageMain);
        }
    });

    $(document).on('click', '#nextPageMain', function (e) {
        e.preventDefault();
        if (currentPageMain * rowsPerPageMain < totalItemsMain) {
            currentPageMain++;
            fetchModifiersMain(selectedCategoryMain, searchTermMain, currentPageMain, rowsPerPageMain);
        }
    });

    // Modifier group link click handler
    $(document).on('click', '.modifierGroup-link', function (e) {
        e.preventDefault();
        $(".modifierGroup-link").removeClass("active");
        $(this).addClass("active");
        selectedCategoryMain = $(this).data('modifier-group-id') || $(this).attr('data-modifier-group-id');
        currentPageMain = 1;
        fetchModifiersMain(selectedCategoryMain, searchTermMain, currentPageMain, rowsPerPageMain);
    });

    // Search input handler
    $(document).on('input', '#searchInput', function () {
        searchTermMain = $(this).val().trim();
        currentPageMain = 1;
        fetchModifiersMain(selectedCategoryMain, searchTermMain, currentPageMain, rowsPerPageMain);
    });

    // Show all modifiers (no specific group)
    $(document).on('click', '.modifierGroupPartialAll', function (e) {
        e.preventDefault();
        $(".modifierGroup-link").removeClass("active");
        currentPageMain = 1;
        selectedCategoryMain = null;
        fetchModifiersMain(selectedCategoryMain, searchTermMain, currentPageMain, rowsPerPageMain);
    });

    // Select/Deselect all checkboxes (scoped to #collapse2)
    $(document).on('change', '#collapse2 #selectAllModifiersCheckbox', function () {
        var isChecked = $(this).is(':checked');
        $('#collapse2 .main-item-checkbox').prop('checked', isChecked);
        var currentPageIds = $('#collapse2 .main-item-checkbox').map(function () {
            return $(this).val();
        }).get();

        if (isChecked) {
            currentPageIds.forEach(function (id) {
                if (!selectedModifierIdsMain.includes(id)) {
                    selectedModifierIdsMain.push(id);
                }
            });
        } else {
            selectedModifierIdsMain = selectedModifierIdsMain.filter(id => !currentPageIds.includes(id));
        }
        updateDeleteButtonStateMain();
    });

    // Individual checkbox selection (scoped to #collapse2)
    $(document).on('change', '#collapse2 .main-item-checkbox', function () {
        var modifierId = $(this).val();
        if ($(this).is(':checked')) {
            if (!selectedModifierIdsMain.includes(modifierId)) {
                selectedModifierIdsMain.push(modifierId);
            }
        } else {
            selectedModifierIdsMain = selectedModifierIdsMain.filter(id => id !== modifierId);
        }
        var $checkboxes = $('#collapse2 .main-item-checkbox');
        $('#selectAllModifiersCheckbox').prop('checked', $checkboxes.length > 0 && $checkboxes.length === $checkboxes.filter(':checked').length);
        updateDeleteButtonStateMain();
    });

    // Delete button click handler
    $(document).on('click', '#deleteModifiers', function (e) {
        e.preventDefault();
        if (!$(this).prop('disabled') && selectedModifierIdsMain.length > 0) {
            $('#selectedModifierIds').val(selectedModifierIdsMain.join(','));
            $('#exampleModal4').modal('show');
        }
    });

    // Populate selected modifier IDs in the modal before showing
    $('#exampleModal4').on('show.bs.modal', function () {
        $('#selectedModifierIds').val(selectedModifierIdsMain.join(','));
    });

   // Handle multiple delete form submission
    $('#deleteMultipleModifiersForm').on('submit', function (e) {
        e.preventDefault();

        $.ajax({
            url: '/Menu/DeleteMultipleModifiers',
            type: 'POST',
            data: $(this).serialize(),
            success: function (response) {
                console.log('Delete Response:', response); // Debug the response
                if (response && response.success) {
                    // Hide the modal
                    $('#exampleModal4').modal('hide');

                    // Clear selections and refresh the list immediately
                    selectedModifierIdsMain = [];
                    fetchModifiersMain(selectedCategoryMain, searchTermMain, currentPageMain, rowsPerPageMain);
                    
                    // Forcefully remove backdrop and reset body state after a short delay
                    setTimeout(function () {
                        $('.modal-backdrop').remove();
                        $('body').removeClass('modal-open').css('overflow', '');
                        location.reload();
                    }, 600); // 300ms delay to match Bootstrap’s default fade animation

                    toastr.success(response.message || 'Modifiers deleted successfully.');
                } else {
                    toastr.error(response?.message || 'Error deleting modifiers.');
                }
            },
            error: function (xhr, status, error) {
                console.error('Error deleting modifiers:', status, error);
                toastr.error('Error submitting delete request.');
            }
        });
    });

    // Delete single modifier group button handler
    $(document).on('click', '.delete-modifier-group-btn', function () {
        let modifierId = $(this).data("modifier-group-id");
        $("#deleteModifierGroupId").val(modifierId);
        $("#delteModifierGroupModal").modal("show");
    });

    // Initial fetch
    fetchModifiersMain(selectedCategoryMain, searchTermMain, currentPageMain, rowsPerPageMain);
});
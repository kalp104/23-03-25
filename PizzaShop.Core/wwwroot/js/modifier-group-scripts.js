// modifier-group-scripts.js
$(document).ready(function () {
    toastr.options.closeButton = true;

    // Variables to be set from the view
    var rowsPerPageMain = 5;
    var currentPageMain = 1;
    var totalItemsMain = window.totalItemsMain || 0; // Passed from the view
    var selectedCategoryMain = null;
    var searchTermMain = '';
    var selectedModifierIdsMain = [];
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
            $('#itemsPerPageBtnMain').html(`${rowsPerPageMain} <span><i class="bi bi-arrow-down-short"></i></span>`);
            currentPageMain = 1;
            fetchModifiersMain(selectedCategoryMain, searchTermMain, currentPageMain, rowsPerPageMain);
        }
        $('#itemsPerPageMenuMain').hide();
    });

    // AJAX fetch function for main view
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

    // Restore checkbox selections for main view
    function restoreCheckboxSelectionsMain() {
        $('.item-checkbox').each(function () {
            var modifierId = $(this).val();
            if (selectedModifierIdsMain.includes(modifierId)) {
                $(this).prop('checked', true);
            }
        });
        $('#selectAllCheckbox').prop('checked', $('.item-checkbox').length === $('.item-checkbox:checked').length);
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

    $(document).on('click', '.modifierGroup-link', function (e) {
        e.preventDefault();
        $(".modifierGroup-link").removeClass("active");
        $(this).addClass("active");
        selectedCategoryMain = $(this).data('modifier-group-id') || $(this).attr('data-modifier-group-id');
        currentPageMain = 1;
        fetchModifiersMain(selectedCategoryMain, searchTermMain, currentPageMain, rowsPerPageMain);
    });

    $(document).on('input', '#searchInput', function () {
        searchTermMain = $(this).val().trim();
        currentPageMain = 1;
        fetchModifiersMain(selectedCategoryMain, searchTermMain, currentPageMain, rowsPerPageMain);
    });

    $(document).on('click', '.modifierGroupPartialAll', function (e) {
        e.preventDefault();
        $(".modifierGroup-link").removeClass("active");
        currentPageMain = 1;
        selectedCategoryMain = null;
        fetchModifiersMain(selectedCategoryMain,searchTermMain, currentPageMain, rowsPerPageMain);
    });

    // Select/Deselect all checkboxes
    $(document).on('click', '#selectAllCheckbox', function () {
        var isChecked = this.checked;
        $('.item-checkbox').prop('checked', isChecked);
        var currentPageIds = $('.item-checkbox').map(function () {
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

    // Individual checkbox selection
    $(document).on('click', '.item-checkbox', function () {
        var modifierId = $(this).val();
        if ($(this).is(':checked')) {
            if (!selectedModifierIdsMain.includes(modifierId)) {
                selectedModifierIdsMain.push(modifierId);
            }
        } else {
            selectedModifierIdsMain = selectedModifierIdsMain.filter(id => id !== modifierId);
        }
        $('#selectAllCheckbox').prop('checked', $('.item-checkbox').length === $('.item-checkbox:checked').length);
        updateDeleteButtonStateMain();
    });

    // Populate selected modifier IDs in the modal
    $(document).on('click', '#deleteModifiers', function (e) {
        if (!$(this).prop('disabled')) {
            $('#selectedModifierIds').val(selectedModifierIdsMain.join(','));
            $('#exampleModal4').modal('show');
        }
    });

    $('#exampleModal4').on('show.bs.modal', function () {
        $('#selectedModifierIds').val(selectedModifierIdsMain.join(','));
    });

    // Delete button handler
    $(".delete-modifier-group-btn").click(function () {
        let modifierId = $(this).data("modifier-group-id");
        $("#deleteModifierGroupId").val(modifierId);
        $("#delteModifierGroupModal").modal("show"); // Note: Fixed typo in modal ID
    });

    // Initial fetch
    fetchModifiersMain(selectedCategoryMain, searchTermMain, currentPageMain, rowsPerPageMain);
});
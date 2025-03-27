$(document).ready(function () {
    toastr.options.closeButton = true;
    var rowsPerPageAdd = 5;
    var currentPageAdd = 1;
    var totalItemsAdd = 0; // Will be updated dynamically
    var selectedCategoryAdd = null;
    var searchTermAdd = '';
    var selectedModifierIdsAdd = []; // Stores objects with id and name

    // Initial state
    $("#addModifierGroupForm").show();
    $(".addExistingModifiersAdd").hide();

    // Toggle custom dropdown visibility
    $('#itemsPerPageBtnAdd').on('click', function () {
        var $menu = $('#itemsPerPageMenuAdd');
        $menu.toggle();
    });

    // Close dropdown when clicking outside
    $(document).on('click', function (e) {
        var $dropdown = $('.custom-dropdown');
        if (!$dropdown.is(e.target) && $dropdown.has(e.target).length === 0) {
            $('#itemsPerPageMenuAdd').hide();
        }
    });

    // Handle page size selection
    $('#exampleModal1').on('click', '.page-size-option', function (e) {
        e.preventDefault();
        var newSize = parseInt($(this).data('size'));
        if (newSize !== rowsPerPageAdd) {
            rowsPerPageAdd = newSize;
            $('#itemsPerPageBtnAdd').html(`${rowsPerPageAdd} <span><i class="bi bi-chevron-down"></i></span>`);
            currentPageAdd = 1;
            fetchModifiersAdd(null, searchTermAdd, currentPageAdd, rowsPerPageAdd);
        }
        $('#itemsPerPageMenuAdd').hide();
    });

    // Fetch modifiers via AJAX (fetch all modifiers)
    function fetchModifiersAdd(modifierGroupId = null, searchTerm = '', page, pageSize) {
        $.ajax({
            url: '/Menu/FilterModifiersAtAddCategory',
            type: 'GET',
            data: { searchTerm: searchTerm, pageNumber: page, pageSize: pageSize },
            success: function (data) {
                $('#collapseAdd').html(data);
                totalItemsAdd = parseInt($('#ModifiersContainer2').attr('data-total-modifiers')) || 0;
                updatePaginationAdd();
                restoreCheckboxSelectionsAdd();
            },
            error: function () {
                alert('Error loading modifiers.');
            }
        });
    }

    // Update pagination UI
    function updatePaginationAdd() {
        var totalPages = Math.ceil(totalItemsAdd / rowsPerPageAdd);
        var startItem = (currentPageAdd - 1) * rowsPerPageAdd + 1;
        var endItem = Math.min(currentPageAdd * rowsPerPageAdd, totalItemsAdd);
        $("#pagination-info-add").text(`Showing ${startItem}-${endItem} of ${totalItemsAdd}`);
        $("#prevPageAdd").toggleClass("disabled", currentPageAdd === 1);
        $("#nextPageAdd").toggleClass("disabled", currentPageAdd >= totalPages);
    }

    // Restore checkbox states (scoped to #collapseAdd)
    function restoreCheckboxSelectionsAdd() {
        $("#collapseAdd .item-checkbox").each(function () {
            var modifierId = $(this).val();
            var isSelected = selectedModifierIdsAdd.some((m) => m.id === modifierId);
            $(this).prop("checked", isSelected);
        });
    }

    // Pagination controls
    $('#exampleModal1').on('click', '#prevPageAdd', function (e) {
        e.preventDefault();
        if (currentPageAdd > 1) {
            currentPageAdd--;
            fetchModifiersAdd(null, searchTermAdd, currentPageAdd, rowsPerPageAdd);
        }
    });

    $('#exampleModal1').on('click', '#nextPageAdd', function (e) {
        e.preventDefault();
        if (currentPageAdd * rowsPerPageAdd < totalItemsAdd) {
            currentPageAdd++;
            fetchModifiersAdd(null, searchTermAdd, currentPageAdd, rowsPerPageAdd);
        }
    });

    $('#exampleModal1').on('input', '#searchInputAdd', function () {
        searchTermAdd = $(this).val().trim();
        currentPageAdd = 1;
        fetchModifiersAdd(null, searchTermAdd, currentPageAdd, rowsPerPageAdd);
    });

    // Show/hide modifier section
    $('#exampleModal1').on('click', '.link-to-modifiers-add', function (e) {
        e.preventDefault();
        $("#addModifierGroupForm").hide();
        $(".addExistingModifiersAdd").show();
        fetchModifiersAdd(null, searchTermAdd, currentPageAdd, rowsPerPageAdd);
    });

    $('#exampleModal1').on('click', '.close-modifiers-add', function (e) {
        e.preventDefault();
        $(".addExistingModifiersAdd").hide();
        $("#addModifierGroupForm").show();
        restoreCheckboxSelectionsAdd();
    });

    // Checkbox change handler (scoped to #collapseAdd)
    $('#exampleModal1').on('change', '#collapseAdd .item-checkbox', function () {
        var modifierId = $(this).val();
        var modifierName = $(this).data('name') || `Modifier ${modifierId}`;
        var isChecked = $(this).is(':checked');
        if (isChecked && !selectedModifierIdsAdd.some((m) => m.id === modifierId)) {
            selectedModifierIdsAdd.push({ id: modifierId, name: modifierName });
        } else if (!isChecked) {
            selectedModifierIdsAdd = selectedModifierIdsAdd.filter((m) => m.id !== modifierId);
        }
    });

    // Reset on modal close
    $('#exampleModal1').on('hidden.bs.modal', function () {
        $(".addExistingModifiersAdd").hide();
        $("#addModifierGroupForm").show();
        $('#collapseAdd .item-checkbox').prop('checked', false);
        selectedModifierIdsAdd = [];
        $('#selectedIdsAdd').val('');
        $('#selectedIdsAddHidden').val('');
        $('#selectedModifiersContainerAdd .d-flex').empty();
    });

    // Handle modifier form submission (use stored names)
    $('#modifierFormAdd').on('submit', function (e) {
        e.preventDefault();
        $('#collapseAdd .item-checkbox:checked').each(function () {
            var id = $(this).val();
            var name = $(this).data('name') || `Modifier ${id}`;
            if (!selectedModifierIdsAdd.some((m) => m.id === id)) {
                selectedModifierIdsAdd.push({ id: id, name: name });
            }
        });
        $('#selectedIdsAddHidden').val(selectedModifierIdsAdd.map((m) => m.id).join(','));
        $('#selectedIdsAdd').val(selectedModifierIdsAdd.map((m) => m.id).join(','));
        $.ajax({
            url: '/Menu/AddModifierGroupDetails',
            type: 'POST',
            data: $(this).serialize(),
            dataType: 'json',
            success: function (response) {
                if (response && response.success && response.modifiers) {
                    response.modifiers.forEach(function (modifier) {
                        if ($(`#selectedModifiersContainerAdd div[data-id="${modifier.modifierid}"]`).length === 0) {
                            $('#selectedModifiersContainerAdd .d-flex').append(
                                `<div class="border border-2 px-2 text-primary rounded-pill border-primary me-2 mb-2" data-id="${modifier.modifierid}">
                                    ${modifier.modifiername} <span class="text-dark remove-modifier-add" style="cursor: pointer;" data-id="${modifier.modifierid}">x</span>
                                </div>`
                            );
                        }
                    });
                    $(".addExistingModifiersAdd").hide();
                    $("#addModifierGroupForm").show();
                    $('#collapseAdd .item-checkbox').prop('checked', false);
                } else {
                    alert(response?.message || 'Error adding modifiers.');
                }
            },
            error: function () {
                alert('Error submitting form.');
            }
        });
    });

    // Remove modifier
    $('#exampleModal1').on('click', '.remove-modifier-add', function () {
        var id = $(this).data('id').toString();
        selectedModifierIdsAdd = selectedModifierIdsAdd.filter((m) => m.id !== id);
        $(this).parent().remove();
        $('#selectedIdsAdd').val(selectedModifierIdsAdd.map((m) => m.id).join(','));
        $('#selectedIdsAddHidden').val(selectedModifierIdsAdd.map((m) => m.id).join(','));
    });
});
// modifierHandler.js
$(document).ready(function () {
    toastr.options.closeButton = true;
    console.log("Document ready");

    let selectedGroups = {};

    // Toggle modifier container visibility
    $('#toggleModifiers').click(function() {
        $('#modifierContainer').slideToggle('fast');
    });

    // Fetch existing modifier groups
    function loadExistingModifiers(itemId) {
        console.log("Loading modifiers for item ID: " + itemId);
        $.ajax({
            url: '/Menu/GetModifiersByItemId',
            type: 'GET',
            data: { itemId: itemId },
            dataType: 'json',
            success: function (response) {
                console.log("GetModifiersByItemId response:", response);
                if (response && Array.isArray(response) && response.length > 0) {
                    response.forEach(function (group) {
                        selectedGroups[group.modifierGroupId] = {
                            modifierGroupName: group.modifierGroupName,
                            minValue: group.minValue || 0,
                            maxValue: group.maxValue || 0,
                            modifiers: group.modifiers.map(modifier => ({
                                modifierId: modifier.modifierId,
                                modifierName: modifier.modifierName,
                                modifierRate: modifier.modifierRate
                            }))
                        };
                    });
                    console.log("Populated selectedGroups:", selectedGroups);
                    renderModifiers();
                } else {
                    console.log("No modifier groups found in response");
                    $('#modifiers-container').html('<div class="alert alert-info">No modifier groups found</div>');
                }
            },
            error: function (xhr, status, error) {
                console.error("Error loading modifiers:", status, error, xhr.responseText);
                $('#modifiers-container').html('<div class="alert alert-danger">Error loading existing modifiers.</div>');
            }
        });
    }

    // Load modifiers on page load
    var itemId = $('#item_Itemid').val();
    if (itemId) {
        console.log("Item ID found: " + itemId);
        loadExistingModifiers(itemId);
    } else {
        console.error("Item ID not found");
    }

    // Modifier group selection
    $('.modifier-group-item').click(function (e) {
        e.preventDefault();
        var $this = $(this);
        var modifierGroupId = $this.find('.modifier-checkbox').data('modifiergroup-id');
        var groupName = $this.find('span').text().trim();
        var $checkbox = $this.find('.modifier-checkbox');

        console.log("Clicked modifier group ID: " + modifierGroupId);
        $checkbox.prop('checked', !$checkbox.prop('checked'));

        if (!selectedGroups[modifierGroupId]) {
            $.ajax({
                url: '/Menu/GetModifiersByGroup',
                type: 'GET',
                data: { modifierGroupId: modifierGroupId },
                dataType: 'json',
                success: function (response) {
                    console.log("GetModifiersByGroup response:", response);
                    if (response && response.length > 0) {
                        selectedGroups[modifierGroupId] = {
                            modifierGroupName: groupName,
                            minValue: 0,
                            maxValue: 0,
                            modifiers: response.map(modifier => ({
                                modifierId: modifier.modifierid,
                                modifierName: modifier.modifiername,
                                modifierRate: modifier.modifierrate
                            }))
                        };
                        console.log("Added group to selectedGroups:", selectedGroups[modifierGroupId]);
                        renderModifiers();
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Error loading group modifiers:", status, error, xhr.responseText);
                    $('#modifiers-container').html(`<div class="alert alert-danger">Error loading modifiers for ${groupName}</div>`);
                }
            });
        } else {
            delete selectedGroups[modifierGroupId];
            renderModifiers();
        }
    });

    // Render modifier groups
    function renderModifiers() {
        console.log("Rendering modifiers with selectedGroups:", selectedGroups);
        $('#modifiers-container').empty();
        if (Object.keys(selectedGroups).length > 0) {
            let html = '';
            for (let groupId in selectedGroups) {
                let group = selectedGroups[groupId];
                if (!group || !group.modifierGroupName) {
                    console.error("Invalid group data for ID:", groupId, group);
                    continue;
                }
                html += `
                <div class="mb-3">
                    <div class="px-3 d-flex justify-content-between">
                        <div style="font-size:20px">${group.modifierGroupName}</div>
                        <div class="trash-icon" style="font-size:20px; cursor:pointer" data-group-id="${groupId}">
                            <i class="bi bi-trash-fill"></i>
                        </div>
                    </div>
                    <div class="px-3 pb-1 d-flex justify-content-between mt-1">
                        <select class="form-select min-value" data-group-id="${groupId}" style="width: 80px;">
                            <option value="0" ${group.minValue === 0 ? 'selected' : ''}>0</option>
                            <option value="1" ${group.minValue === 1 ? 'selected' : ''}>1</option>
                            <option value="2" ${group.minValue === 2 ? 'selected' : ''}>2</option>
                            <option value="3" ${group.minValue === 3 ? 'selected' : ''}>3</option>
                        </select>
                        <select class="form-select max-value" data-group-id="${groupId}" style="width: 80px;">
                            <option value="0" ${group.maxValue === 0 ? 'selected' : ''}>0</option>
                            <option value="1" ${group.maxValue === 1 ? 'selected' : ''}>1</option>
                            <option value="2" ${group.maxValue === 2 ? 'selected' : ''}>2</option>
                            <option value="3" ${group.maxValue === 3 ? 'selected' : ''}>3</option>
                        </select>
                    </div>
                    <ul>`;
                if (group.modifiers && Array.isArray(group.modifiers)) {
                    group.modifiers.forEach(function (modifier) {
                        html += `
                        <li class="px-3 d-flex justify-content-between" style="font-size:14px" data-modifier-id="${modifier.modifierId}">
                            <span>${modifier.modifierName}</span>
                            <span>${modifier.modifierRate}</span>
                        </li>`;
                    });
                }
                html += `</ul></div>`;
            }
            $('#modifiers-container').html(html);

            $('.trash-icon').click(function () {
                const groupId = $(this).data('group-id');
                console.log("Removing group ID: " + groupId);
                delete selectedGroups[groupId];
                renderModifiers();
            });

            $('.min-value').change(function () {
                const groupId = $(this).data('group-id');
                selectedGroups[groupId].minValue = parseInt($(this).val());
                console.log("Updated minValue for " + groupId + ": " + selectedGroups[groupId].minValue);
            });

            $('.max-value').change(function () {
                const groupId = $(this).data('group-id');
                selectedGroups[groupId].maxValue = parseInt($(this).val());
                console.log("Updated maxValue for " + groupId + ": " + selectedGroups[groupId].maxValue);
            });
        } else {
            console.log("No groups to render");
            $('#modifiers-container').html('<div class="alert alert-info">No modifier groups selected</div>');
        }

        $('.modifier-checkbox').each(function () {
            var groupId = $(this).data('modifiergroup-id');
            $(this).prop('checked', !!selectedGroups[groupId]);
        });
    }

    $('#editItemForm').submit(function (e) {
        console.log("Form submitting, serializing selectedGroups:", selectedGroups);
        $('#selectedModifierGroups').val(JSON.stringify(selectedGroups));
        console.log("Hidden input value set to:", $('#selectedModifierGroups').val());
    });
});
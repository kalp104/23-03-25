$(document).ready(function () {
    toastr.options.closeButton = true;
    let selectedGroupsEdit = {};

    // Toggle modifier container visibility
    $("#toggleModifiersEdit").click(function () {
        $("#modifierContainerEdit").slideToggle("fast");
    });

    // Fetch existing modifier groups
    function loadExistingModifiers(itemId) {
        $.ajax({
            url: "/Menu/GetModifiersByItemId",
            type: "GET",
            data: { itemId: itemId },
            dataType: "json",
            success: function (response) {
                if (response && Array.isArray(response) && response.length > 0) {
                    response.forEach(function (group) {
                        selectedGroupsEdit[group.modifierGroupId] = {
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
                    renderModifiersEdit();
                } else {
                    $("#modifiers-container-edit").html('<div class="alert alert-info">No modifier groups found</div>');
                }
            },
            error: function (xhr, status, error) {
                $("#modifiers-container-edit").html('<div class="alert alert-danger">Error loading existing modifiers.</div>');
            }
        });
    }

    // Load modifiers on modal show
    var itemId = $("#item_Itemid").val();
    if (itemId) {
        loadExistingModifiers(itemId);
    }

    // Modifier group selection
    $("#editItemForm").on("click", ".modifier-group-item", function (e) {
        e.preventDefault();
        var $this = $(this);
        var modifierGroupId = $this.find(".modifier-checkbox-edit").data("modifiergroup-id");
        var groupName = $this.find("span").text().trim();
        var $checkbox = $this.find(".modifier-checkbox-edit");

        $checkbox.prop("checked", !$checkbox.prop("checked"));

        if (!selectedGroupsEdit[modifierGroupId]) {
            $.ajax({
                url: "/Menu/GetModifiersByGroup",
                type: "GET",
                data: { modifierGroupId: modifierGroupId },
                dataType: "json",
                success: function (response) {
                    if (response && response.length > 0) {
                        selectedGroupsEdit[modifierGroupId] = {
                            modifierGroupName: groupName,
                            minValue: 0,
                            maxValue: 0,
                            modifiers: response.map(modifier => ({
                                modifierId: modifier.modifierid,
                                modifierName: modifier.modifiername,
                                modifierRate: modifier.modifierrate
                            }))
                        };
                        renderModifiersEdit();
                    }
                },
                error: function (xhr, status, error) {
                    $("#modifiers-container-edit").html(`<div class="alert alert-danger">Error loading modifiers for ${groupName}</div>`);
                }
            });
        } else {
            delete selectedGroupsEdit[modifierGroupId];
            renderModifiersEdit();
        }
    });

    function renderModifiersEdit() {
        $("#modifiers-container-edit").empty();
        if (Object.keys(selectedGroupsEdit).length > 0) {
            let html = "";
            for (let groupId in selectedGroupsEdit) {
                let group = selectedGroupsEdit[groupId];
                if (!group || !group.modifierGroupName) continue;
                html += `
                    <div class="mb-3">
                        <div class="px-3 d-flex justify-content-between">
                            <div style="font-size:20px">${group.modifierGroupName}</div>
                            <div class="trash-icon-edit" style="font-size:20px; cursor:pointer" data-group-id="${groupId}">
                                <i class="bi bi-trash-fill"></i>
                            </div>
                        </div>
                        <div class="px-3 pb-1 d-flex justify-content-between mt-1">
                            <select class="form-select min-value-edit" data-group-id="${groupId}" style="width: 80px;">
                                <option value="0" ${group.minValue === 0 ? "selected" : ""}>0</option>
                                <option value="1" ${group.minValue === 1 ? "selected" : ""}>1</option>
                                <option value="2" ${group.minValue === 2 ? "selected" : ""}>2</option>
                                <option value="3" ${group.minValue === 3 ? "selected" : ""}>3</option>
                            </select>
                            <select class="form-select max-value-edit" data-group-id="${groupId}" style="width: 80px;">
                                <option value="0" ${group.maxValue === 0 ? "selected" : ""}>0</option>
                                <option value="1" ${group.maxValue === 1 ? "selected" : ""}>1</option>
                                <option value="2" ${group.maxValue === 2 ? "selected" : ""}>2</option>
                                <option value="3" ${group.maxValue === 3 ? "selected" : ""}>3</option>
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
            $("#modifiers-container-edit").html(html);

            $("#editItemForm").on("click", ".trash-icon-edit", function () {
                const groupId = $(this).data("group-id");
                delete selectedGroupsEdit[groupId];
                renderModifiersEdit();
            });

            $("#editItemForm").on("change", ".min-value-edit", function () {
                const groupId = $(this).data("group-id");
                selectedGroupsEdit[groupId].minValue = parseInt($(this).val());
            });

            $("#editItemForm").on("change", ".max-value-edit", function () {
                const groupId = $(this).data("group-id");
                selectedGroupsEdit[groupId].maxValue = parseInt($(this).val());
            });
        } else {
            $("#modifiers-container-edit").html('<div class="alert alert-info">No modifier groups selected</div>');
        }

        $("#editItemForm .modifier-checkbox-edit").each(function () {
            var groupId = $(this).data("modifiergroup-id");
            $(this).prop("checked", !!selectedGroupsEdit[groupId]);
        });
    }

    $("#editItemForm").submit(function (e) {
        $("#selectedModifierGroupsEdit").val(JSON.stringify(selectedGroupsEdit));
    });

    $("#editItemForm").on("hidden.bs.modal", function () {
        selectedGroupsEdit = {};
        renderModifiersEdit();
    });
});
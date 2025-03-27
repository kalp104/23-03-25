$(document).ready(function () {
  toastr.options.closeButton = true;
  let selectedGroupsAdd = {};

  // Toggle modifier container visibility
  $("#toggleModifiersAdd").click(function () {
    $("#modifierContainerAdd").slideToggle("fast");
  });

  // Modifier group selection
  $("#addItem").on("click", ".modifier-group-item", function (e) {
    e.preventDefault();
    var modifierGroupId = $(this).data("modifiergroup-id");
    var groupName = $(this).find("span").text().trim();
    var $checkbox = $(this).find(".modifier-checkbox-add");

    $checkbox.prop("checked", !$checkbox.prop("checked"));

    if (!selectedGroupsAdd[modifierGroupId]) {
      $.ajax({
        url: "/Menu/GetModifiersByGroup",
        type: "GET",
        data: { modifierGroupId: modifierGroupId },
        success: function (response) {
          if (response && response.length > 0) {
            selectedGroupsAdd[modifierGroupId] = {
              name: groupName,
              minValue: 0,
              maxValue: 0,
              modifiers: response.map((modifier) => ({
                modifierId: modifier.modifierid,
                modifiername: modifier.modifiername || "Unnamed Modifier",
                modifierrate: modifier.modifierrate,
              })),
            };
          }
          renderModifiersAdd();
        },
        error: function (xhr, status, error) {
          $("#modifiers-container-add").html(`
                        <div class="p-2 m-2 alert alert-danger">
                            Error loading modifiers for ${groupName}: ${error}
                        </div>
                    `);
        },
      });
    } else {
      delete selectedGroupsAdd[modifierGroupId];
      renderModifiersAdd();
    }
  });

  function renderModifiersAdd() {
    $("#modifiers-container-add").empty();
    if (Object.keys(selectedGroupsAdd).length > 0) {
      let html = "";
      for (let groupId in selectedGroupsAdd) {
        let group = selectedGroupsAdd[groupId];
        html += `
                    <div class="mb-3">
                        <div class="px-3 d-flex justify-content-between">
                            <div style="font-size:20px">${group.name}</div>
                            <div class="trash-icon-add" style="font-size:20px; cursor:pointer" data-group-id="${groupId}">
                                <i class="bi bi-trash-fill"></i>
                            </div>
                        </div>
                        <div class="px-3 pb-1 d-flex justify-content-between mt-1">
                            <select class="form-select min-value-add" data-group-id="${groupId}" style="width: 80px;">
                                <option value="0" ${
                                  group.minValue === 0 ? "selected" : ""
                                }>0</option>
                                <option value="1" ${
                                  group.minValue === 1 ? "selected" : ""
                                }>1</option>
                                <option value="2" ${
                                  group.minValue === 2 ? "selected" : ""
                                }>2</option>
                                <option value="3" ${
                                  group.minValue === 3 ? "selected" : ""
                                }>3</option>
                            </select>
                            <select class="form-select max-value-add" data-group-id="${groupId}" style="width: 80px;">
                                <option value="0" ${
                                  group.maxValue === 0 ? "selected" : ""
                                }>0</option>
                                <option value="1" ${
                                  group.maxValue === 1 ? "selected" : ""
                                }>1</option>
                                <option value="2" ${
                                  group.maxValue === 2 ? "selected" : ""
                                }>2</option>
                                <option value="3" ${
                                  group.maxValue === 3 ? "selected" : ""
                                }>3</option>
                            </select>
                        </div>
                        <ul>`;
        group.modifiers.forEach(function (modifier) {
          html += `
                        <li class="px-3 d-flex justify-content-between" style="font-size:14px" data-modifier-id="${modifier.modifierId}">
                            <span>${modifier.modifiername}</span>
                            <span>${modifier.modifierrate}</span>
                        </li>`;
        });
        html += `</ul></div>`;
      }
      $("#modifiers-container-add").html(html);

      $("#addItem").on("click", ".trash-icon-add", function () {
        const groupId = $(this).data("group-id");
        delete selectedGroupsAdd[groupId];
        renderModifiersAdd();
      });

      $("#addItem").on("change", ".min-value-add", function () {
        const groupId = $(this).data("group-id");
        selectedGroupsAdd[groupId].minValue = parseInt($(this).val());
      });

      $("#addItem").on("change", ".max-value-add", function () {
        const groupId = $(this).data("group-id");
        selectedGroupsAdd[groupId].maxValue = parseInt($(this).val());
      });
    } else {
      $("#modifiers-container-add").html(`
                <div class="p-2 m-2 alert alert-info">No modifier groups selected</div>
            `);
    }

    $("#addItem .modifier-checkbox-add").each(function () {
      var groupId = $(this).data("modifiergroup-id");
      $(this).prop("checked", !!selectedGroupsAdd[groupId]);
    });
  }

  $("#addItemForm").submit(function (e) {
    $("#selectedModifierGroupsAdd").val(JSON.stringify(selectedGroupsAdd));
  });

  $("#addItem").on("hidden.bs.modal", function () {
    selectedGroupsAdd = {};
    renderModifiersAdd();
  });

  $("#imageInputAdd").on("change", function () {
    var file = this.files[0];
    if (file) {
      
      $(".AddedImageURL").text("Selected File: " + file.name);
    } else {
      $(".AddedImageURL").text("");
    }
  });
});

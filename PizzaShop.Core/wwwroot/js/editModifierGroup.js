$(document).ready(function () {
    toastr.options.closeButton = true;
    var rowsPerPageEdit = 5;
    var currentPageEdit = 1;
    var totalItemsEdit = 0; // Will be updated dynamically
    var existingModifierIdsEdit = [];
    var pendingModifierIdsEdit = []; // Now stores objects with id and name
    var searchTermEdit = "";
    var currentModifierGroupIdEdit = null;
  
    // Toggle custom dropdown visibility
    $("#itemsPerPageBtnEdit").on("click", function () {
      var $menu = $("#itemsPerPageMenuEdit");
      $menu.toggle();
    });
  
    // Close dropdown when clicking outside
    $(document).on("click", function (e) {
      var $dropdown = $(".custom-dropdown");
      if (!$dropdown.is(e.target) && $dropdown.has(e.target).length === 0) {
        $("#itemsPerPageMenuEdit").hide();
      }
    });
  
    // Handle page size selection
    $("#editModal").on("click", ".page-size-option", function (e) {
      e.preventDefault();
      var newSize = parseInt($(this).data("size"));
      if (newSize !== rowsPerPageEdit) {
        rowsPerPageEdit = newSize;
        $("#itemsPerPageBtnEdit").html(
          `${rowsPerPageEdit} <span><i class="bi bi-chevron-down"></i></span>`
        );
        currentPageEdit = 1;
        fetchModifiersEdit(
          null,
          searchTermEdit,
          currentPageEdit,
          rowsPerPageEdit
        );
      }
      $("#itemsPerPageMenuEdit").hide();
    });
  
    // Update UI with existing modifiers
    function updateSelectedModifiersUIEdit() {
      const $container = $("#selectedModifiersContainerEdit .d-flex");
      $container.empty();
      existingModifierIdsEdit.forEach(function (modifier) {
        $container.append(
          `<div class="border border-2 px-2 text-primary rounded-pill border-primary me-2 mb-2" data-id="${modifier.id}">
                      ${modifier.name} <span class="text-dark remove-modifier-edit" style="cursor: pointer;" data-id="${modifier.id}">x</span>
                  </div>`
        );
      });
      $("#selectedIdsEdit").val(
        existingModifierIdsEdit.map((m) => m.id).join(",")
      );
      $("#selectedIdsEditHidden").val(
        existingModifierIdsEdit.map((m) => m.id).join(",")
      );
    }
  
    // Load modifier group data
    function loadModifierGroupEdit(modifierGroupId) {
      $.ajax({
        url: "/Menu/GetModifierGroup",
        type: "GET",
        data: { id: modifierGroupId },
        success: function (data) {
          $("#editModal #floatingInputEdit").val(data.modifiergroupname);
          $("#editModal #floatingTextareaEdit").val(
            data.modifiergroupdescription
          );
          $("#editModal #modifierGroupIdEdit").val(data.modifiergroupid);
          existingModifierIdsEdit = data.selectedModifiers
            ? data.selectedModifiers.map((m) => ({
                id: m.modifierId.toString(),
                name: m.modifierName,
              }))
            : [];
          pendingModifierIdsEdit = [];
          currentModifierGroupIdEdit = modifierGroupId;
          updateSelectedModifiersUIEdit();
          $("#editModal").modal("show");
          $("#editModifierGroupForm").show();
          $(".addExistingModifiersEdit").hide();
          fetchModifiersEdit(
            null,
            searchTermEdit,
            currentPageEdit,
            rowsPerPageEdit
          );
        },
        error: function () {
          alert("Error loading modifier group data.");
        },
      });
    }
  
    // Fetch modifiers for the edit modal
    function fetchModifiersEdit(
      modifierGroupId = null,
      searchTerm = "",
      page,
      pageSize
    ) {
      $.ajax({
        url: "/Menu/FilterModifiersAtEditModifierGroup",
        type: "GET",
        data: { searchTerm: searchTerm, pageNumber: page, pageSize: pageSize },
        success: function (data) {
          $("#collapseEdit").html(data);
          totalItemsEdit =
            parseInt($("#ModifiersContainer4").attr("data-total-modifiers")) || 0;
          updatePaginationEdit();
          restoreCheckboxSelectionsEdit();
        },
        error: function () {
          alert("Error loading modifiers.");
        },
      });
    }
  
    // Update pagination
    function updatePaginationEdit() {
      var totalPagesEdit = Math.ceil(totalItemsEdit / rowsPerPageEdit);
      var startItemEdit = (currentPageEdit - 1) * rowsPerPageEdit + 1;
      var endItemEdit = Math.min(
        currentPageEdit * rowsPerPageEdit,
        totalItemsEdit
      );
      $("#pagination-info-edit").text(
        `Showing ${startItemEdit}-${endItemEdit} of ${totalItemsEdit}`
      );
      $("#prevPageEdit").toggleClass("disabled", currentPageEdit === 1);
      $("#nextPageEdit").toggleClass(
        "disabled",
        currentPageEdit >= totalPagesEdit
      );
    }
  
    // Restore checkbox states
    function restoreCheckboxSelectionsEdit() {
      $("#collapseEdit .item-checkbox").each(function () {
        var modifierId = $(this).val();
        var isSelected =
          existingModifierIdsEdit.some((m) => m.id === modifierId) ||
          pendingModifierIdsEdit.some((m) => m.id === modifierId);
        $(this).prop("checked", isSelected);
      });
    }
  
    // Pagination controls
    $("#editModal").on("click", "#prevPageEdit", function (e) {
      e.preventDefault();
      if (currentPageEdit > 1) {
        currentPageEdit--;
        fetchModifiersEdit(
          null,
          searchTermEdit,
          currentPageEdit,
          rowsPerPageEdit
        );
      }
    });
  
    $("#editModal").on("click", "#nextPageEdit", function (e) {
      e.preventDefault();
      if (currentPageEdit * rowsPerPageEdit < totalItemsEdit) {
        currentPageEdit++;
        fetchModifiersEdit(
          null,
          searchTermEdit,
          currentPageEdit,
          rowsPerPageEdit
        );
      }
    });
  
    $("#editModal").on("input", "#searchInputEdit", function () {
      searchTermEdit = $(this).val().trim();
      currentPageEdit = 1;
      fetchModifiersEdit(
        null,
        searchTermEdit,
        currentPageEdit,
        rowsPerPageEdit
      );
    });
  
    // Checkbox change handler (store id and name)
    $("#editModal").on("change", ".item-checkbox", function () {
      var modifierId = $(this).val();
      var modifierName = $(this).data("name") || `Modifier ${modifierId}`;
      var isChecked = $(this).is(":checked");
      if (
        isChecked &&
        !existingModifierIdsEdit.some((m) => m.id === modifierId) &&
        !pendingModifierIdsEdit.some((m) => m.id === modifierId)
      ) {
        pendingModifierIdsEdit.push({ id: modifierId, name: modifierName });
      } else if (!isChecked) {
        pendingModifierIdsEdit = pendingModifierIdsEdit.filter(
          (m) => m.id !== modifierId
        );
      }
    });
  
    // Handle modifier form submission (use stored names)
    $("#modifierFormEdit").on("submit", function (e) {
      e.preventDefault();
      pendingModifierIdsEdit.forEach(function (modifier) {
        if (!existingModifierIdsEdit.some((m) => m.id === modifier.id)) {
          existingModifierIdsEdit.push({ id: modifier.id, name: modifier.name });
        }
      });
      pendingModifierIdsEdit = [];
      updateSelectedModifiersUIEdit();
      $(".addExistingModifiersEdit").hide();
      $("#editModifierGroupForm").show();
    });
  
    // Handle main form submission
    $("#editModifierGroupForm form").on("submit", function (e) {
      $("#selectedIdsEdit").val(
        existingModifierIdsEdit.map((m) => m.id).join(",")
      );
    });
  
    // Remove modifier
    $("#editModal").on("click", ".remove-modifier-edit", function () {
      var modifierId = $(this).data("id").toString();
      existingModifierIdsEdit = existingModifierIdsEdit.filter(
        (m) => m.id !== modifierId
      );
      pendingModifierIdsEdit = pendingModifierIdsEdit.filter(
        (m) => m.id !== modifierId
      );
      updateSelectedModifiersUIEdit();
      restoreCheckboxSelectionsEdit();
    });
  
    // Show/hide modifier section
    $("#editModal").on("click", ".link-to-modifiers-edit", function (e) {
      e.preventDefault();
      $("#editModifierGroupForm").hide();
      $(".addExistingModifiersEdit").show();
      fetchModifiersEdit(
        null,
        searchTermEdit,
        currentPageEdit,
        rowsPerPageEdit
      );
    });
  
    $("#editModal").on("click", ".close-modifiers-edit", function (e) {
      e.preventDefault();
      $(".addExistingModifiersEdit").hide();
      $("#editModifierGroupForm").show();
      pendingModifierIdsEdit = [];
      restoreCheckboxSelectionsEdit();
    });
  
    // Load modifier group on edit click
    $(document).on("click", ".edit-modifier-group", function (e) {
      e.preventDefault();
      var modifierGroupId = $(this).data("id");
      loadModifierGroupEdit(modifierGroupId);
    });
  
    // Reset on modal close
    $("#editModal").on("hidden.bs.modal", function () {
      $(".addExistingModifiersEdit").hide();
      $("#editModifierGroupForm").show();
      existingModifierIdsEdit = [];
      pendingModifierIdsEdit = [];
      $("#selectedIdsEdit").val("");
      $("#selectedIdsEditHidden").val("");
      $("#selectedModifiersContainerEdit .d-flex").empty();
    });
  });
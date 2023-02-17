const forms = await entities.forms_design.find({
    select: ["name", "description", "id", "updatedAt", "updatedBy", "released"],
    order: {
        name: "ASC"
    }
});

result.data = forms;
complete();
const forms = await entities.forms_design.find({
    select: ["name", "description", "id", "updatedAt", "updatedBy", "released", "groupid", "subgroupid"],
    order: {
        name: "ASC"
    }
});

const group = await entities.forms_group.find({ select: ["id", "name", "description"] });
const subgroup = await entities.forms_subgroup.find({ select: ["id", "name", "description", "groupid"] });

// Adding empty rows
group.splice(0, 0, {});
subgroup.splice(0, 0, { name: "" });

result.data = {
    forms,
    group,
    subgroup
}
complete();
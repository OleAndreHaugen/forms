const manager = modules.typeorm.getConnection().manager;

const adaptiveApps = await manager.find('reports', {
    select: ["name", "description", "id", "application", "package", "updatedAt", "changedBy"],
    order: { name: "ASC" }
});

const package = await manager.find('dev_package', {
    select: ["name", "description", "id"],
    order: { name: "ASC" }
});

const forms = await entities.forms_design.find({
    select: ["name", "description", "id", "updatedAt", "updatedBy", "released", "groupid", "subgroupid"],
    order: { name: "ASC" }
});

const group = await entities.forms_group.find({ select: ["id", "name", "description"], order: { name: "ASC" } });
const subgroup = await entities.forms_subgroup.find({ select: ["id", "name", "description", "groupid"], order: { name: "ASC" } });
const attributegroup = await entities.forms_attribute_group.find({ select: ["id", "name", "description"], order: { name: "ASC" } });
const attributefields = await entities.forms_attribute_fields.find({ select: ["id", "name", "description", "groupid"], order: { name: "ASC" } });

// Adding empty rows
group.splice(0, 0, {});
subgroup.splice(0, 0, { name: "" });

result.data = {
    forms,
    group,
    subgroup,
    adaptiveApps,
    package,
    attributegroup,
    attributefields
}

complete();
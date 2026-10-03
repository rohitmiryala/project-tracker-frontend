const priorities = new Set(["low", "medium", "high", "critical"]);

const errorKey = (id, field) => `${id}.${field}`;

export const countBulkItems = (sections) =>
  sections.reduce(
    (total, section) =>
      total + (section.type === "new" ? 1 : 0) + section.deliverables.length,
    0,
  );

export const validateBulkSections = (sections) => {
  const errors = {};
  const total = countBulkItems(sections);
  if (total < 1) errors._form = "Add at least one Workstream or Deliverable.";
  if (total > 100)
    errors._form = "A bulk operation can contain at most 100 items.";

  for (const section of sections) {
    if (section.type === "new") {
      const name = section.name.trim();
      if (name.length < 2)
        errors[errorKey(section.id, "name")] = "Enter at least 2 characters.";
      else if (name.length > 150)
        errors[errorKey(section.id, "name")] = "Use 150 characters or fewer.";
      if ((section.description || "").trim().length > 500)
        errors[errorKey(section.id, "description")] =
          "Use 500 characters or fewer.";
      if (!priorities.has(section.priority))
        errors[errorKey(section.id, "priority")] = "Choose a priority.";
      if (
        section.startDate &&
        section.targetDate &&
        section.targetDate <= section.startDate
      )
        errors[errorKey(section.id, "targetDate")] =
          "Target date must be after start date.";
    }

    for (const item of section.deliverables) {
      const title = item.title.trim();
      if (title.length < 2)
        errors[errorKey(item.id, "title")] = "Enter at least 2 characters.";
      else if (title.length > 200)
        errors[errorKey(item.id, "title")] = "Use 200 characters or fewer.";
      if ((item.description || "").trim().length > 500)
        errors[errorKey(item.id, "description")] =
          "Use 500 characters or fewer.";
      if (!priorities.has(item.priority))
        errors[errorKey(item.id, "priority")] = "Choose a priority.";
      if (item.estimatedHours !== "") {
        const hours = Number(item.estimatedHours);
        if (!Number.isFinite(hours) || hours < 0 || hours > 24)
          errors[errorKey(item.id, "estimatedHours")] =
            "Enter a value from 0 to 24.";
      }
    }
  }
  return errors;
};

export const buildBulkPayload = (sections) => {
  const newSections = sections.filter((section) => section.type === "new");
  const deliverableEntries = sections.flatMap((section) =>
    section.deliverables.map((item) => ({ section, item })),
  );
  return {
    payload: {
      workstreams: newSections.map((section) => ({
        clientKey: `workstream-${section.id}`,
        name: section.name.trim(),
        description: section.description.trim() || null,
        ownerId: section.ownerId || null,
        status: section.status,
        priority: section.priority,
        color: section.color,
        startDate: section.startDate || null,
        targetDate: section.targetDate || null,
      })),
      deliverables: deliverableEntries.map(({ section, item }) => ({
        title: item.title.trim(),
        description: item.description.trim() || null,
        priority: item.priority,
        estimatedHours:
          item.estimatedHours === "" ? null : Number(item.estimatedHours),
        ...(section.type === "new"
          ? { newWorkstreamKey: `workstream-${section.id}` }
          : section.type === "existing"
            ? { existingWorkstreamId: section.workstreamId }
            : {}),
      })),
    },
    meta: {
      workstreamIds: newSections.map((section) => section.id),
      deliverableIds: deliverableEntries.map(({ item }) => item.id),
    },
  };
};

export const mapBulkApiErrors = (error, meta) => {
  const errors = {};
  for (const source of error?.errorSources || []) {
    const path = String(source.path || "").replace(/^body\./, "");
    const match = path.match(/^(workstreams|deliverables)\.(\d+)\.(.+)$/);
    if (!match) continue;
    const [, collection, rawIndex, field] = match;
    const ids =
      collection === "workstreams" ? meta.workstreamIds : meta.deliverableIds;
    const id = ids[Number(rawIndex)];
    if (id) errors[errorKey(id, field)] = source.message;
  }
  return errors;
};

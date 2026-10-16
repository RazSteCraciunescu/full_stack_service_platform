import { requestCategories, requestChannels, requestPriorities, requestStatuses } from "./types.js";
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function cleanString(value) {
    return typeof value === "string" ? value.trim() : "";
}
function isOneOf(value, allowed) {
    return allowed.includes(value);
}
function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}
function normalizeTags(value, errors) {
    if (value === undefined)
        return [];
    if (!Array.isArray(value)) {
        errors.tags = "Tags must be an array of strings.";
        return [];
    }
    const tags = [...new Set(value.map(cleanString).filter(Boolean))];
    if (tags.length > 8)
        errors.tags = "Use no more than eight tags.";
    if (tags.some((tag) => tag.length > 30))
        errors.tags = "Each tag must be 30 characters or fewer.";
    return tags.slice(0, 8);
}
export function validateCreateRequest(input) {
    const errors = {};
    if (!isRecord(input))
        return { ok: false, errors: { body: "A JSON object is required." } };
    const title = cleanString(input.title);
    const description = cleanString(input.description);
    const category = cleanString(input.category);
    const priority = cleanString(input.priority);
    const channel = cleanString(input.channel || "Portal");
    const requester = isRecord(input.requester) ? input.requester : {};
    const requesterName = cleanString(requester.name);
    const requesterEmail = cleanString(requester.email).toLowerCase();
    const tags = normalizeTags(input.tags, errors);
    if (title.length < 8 || title.length > 120)
        errors.title = "Title must contain between 8 and 120 characters.";
    if (description.length < 20 || description.length > 2000)
        errors.description = "Description must contain between 20 and 2000 characters.";
    if (!isOneOf(category, requestCategories))
        errors.category = "Choose a supported category.";
    if (!isOneOf(priority, requestPriorities))
        errors.priority = "Choose Low, Medium, High or Urgent.";
    if (!isOneOf(channel, requestChannels))
        errors.channel = "Choose Portal, Email or API.";
    if (requesterName.length < 2 || requesterName.length > 80)
        errors["requester.name"] = "Requester name must contain between 2 and 80 characters.";
    if (!validateEmail(requesterEmail))
        errors["requester.email"] = "Enter a valid requester email address.";
    if (Object.keys(errors).length)
        return { ok: false, errors };
    return {
        ok: true,
        errors,
        value: {
            title,
            description,
            category: category,
            priority: priority,
            channel: channel,
            requester: { name: requesterName, email: requesterEmail },
            tags
        }
    };
}
export function validateUpdateRequest(input) {
    const errors = {};
    if (!isRecord(input))
        return { ok: false, errors: { body: "A JSON object is required." } };
    const output = {};
    const supported = ["status", "priority", "assignee", "dueAt", "tags"];
    const supplied = supported.filter((field) => Object.prototype.hasOwnProperty.call(input, field));
    if (supplied.length === 0)
        errors.body = "Provide at least one supported field to update.";
    if (Object.prototype.hasOwnProperty.call(input, "status")) {
        const status = cleanString(input.status);
        if (!isOneOf(status, requestStatuses))
            errors.status = "Choose a supported status.";
        else
            output.status = status;
    }
    if (Object.prototype.hasOwnProperty.call(input, "priority")) {
        const priority = cleanString(input.priority);
        if (!isOneOf(priority, requestPriorities))
            errors.priority = "Choose a supported priority.";
        else
            output.priority = priority;
    }
    if (Object.prototype.hasOwnProperty.call(input, "assignee")) {
        if (input.assignee === null || cleanString(input.assignee) === "")
            output.assignee = null;
        else {
            const assignee = cleanString(input.assignee);
            if (assignee.length > 80)
                errors.assignee = "Assignee must be 80 characters or fewer.";
            else
                output.assignee = assignee;
        }
    }
    if (Object.prototype.hasOwnProperty.call(input, "dueAt")) {
        if (input.dueAt === null || cleanString(input.dueAt) === "")
            output.dueAt = null;
        else {
            const dueAt = cleanString(input.dueAt);
            const parsed = Date.parse(dueAt);
            if (Number.isNaN(parsed))
                errors.dueAt = "Due date must be a valid ISO date.";
            else
                output.dueAt = new Date(parsed).toISOString();
        }
    }
    if (Object.prototype.hasOwnProperty.call(input, "tags"))
        output.tags = normalizeTags(input.tags, errors);
    return Object.keys(errors).length ? { ok: false, errors } : { ok: true, errors, value: output };
}
export function validateComment(input) {
    if (!isRecord(input))
        return { ok: false, errors: { body: "A JSON object is required." } };
    const errors = {};
    const author = cleanString(input.author);
    const body = cleanString(input.body);
    if (author.length < 2 || author.length > 80)
        errors.author = "Author must contain between 2 and 80 characters.";
    if (body.length < 2 || body.length > 1000)
        errors.body = "Comment must contain between 2 and 1000 characters.";
    return Object.keys(errors).length ? { ok: false, errors } : { ok: true, errors, value: { author, body } };
}
//# sourceMappingURL=validation.js.map
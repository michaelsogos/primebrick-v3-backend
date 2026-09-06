import { CUSTOMER_LIST_COLUMNS } from "./list-config.js";

type DeltaChange = { from: any; to: any };
type DeltaRecord = Record<string, DeltaChange>;

export type AuditEntryTransformed = {
  id: string;
  entity_uuid: string;
  action: string;
  changed_at: string;
  version: number;
  who: string;
  title: string;
  description: string[];
};

const FIELD_LABELS = new Map(
  CUSTOMER_LIST_COLUMNS.map((col) => [col.key, col.labelKey])
);

const STATUS_LABELS = new Map([
  ["ACTIVE", "system.entities.customer.status.active"],
  ["INACTIVE", "system.entities.customer.status.inactive"],
]);

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatValue(value: any, fieldKey: string): string {
  if (value === null || value === undefined) {
    return "non impostato";
  }

  if (fieldKey === "status") {
    return STATUS_LABELS.get(value) || value;
  }

  if (fieldKey.endsWith("_at") || fieldKey.endsWith("_date")) {
    try {
      return formatDate(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
}

function getFieldLabel(fieldKey: string): string {
  return FIELD_LABELS.get(fieldKey) || fieldKey;
}

function formatFieldChange(fieldKey: string, change: DeltaChange): string {
  const label = getFieldLabel(fieldKey);
  const from = formatValue(change.from, fieldKey);
  const to = formatValue(change.to, fieldKey);
  return `Il campo ${label} è stato modificato da ${from} a ${to}`;
}

function formatAction(action: string): string {
  const actionMap: Record<string, string> = {
    CREATE: "Creazione",
    UPDATE: "Modifica",
    DELETE: "Eliminazione",
    RESTORE: "Ripristino",
  };
  return actionMap[action] || action;
}

export function transformAuditEntry(
  entry: {
    id: string;
    entity_uuid: string;
    action: string;
    changed_at: string;
    version: number;
    delta: DeltaRecord;
  },
  who: string = "system"
): AuditEntryTransformed {
  const actionLabel = formatAction(entry.action);
  const title = `${actionLabel} - ${who}`;

  const description: string[] = [];

  if (entry.action === "CREATE") {
    description.push("Record creato");
  } else if (entry.action === "DELETE") {
    description.push("Record eliminato");
  } else if (entry.action === "RESTORE") {
    description.push("Record ripristinato");
  } else if (entry.delta && Object.keys(entry.delta).length > 0) {
    for (const [fieldKey, change] of Object.entries(entry.delta)) {
      description.push(formatFieldChange(fieldKey, change));
    }
  }

  return {
    id: entry.id,
    entity_uuid: entry.entity_uuid,
    action: entry.action,
    changed_at: entry.changed_at,
    version: entry.version,
    who,
    title,
    description,
  };
}

export function transformAuditEntries(
  entries: Array<{
    id: string;
    entity_uuid: string;
    action: string;
    changed_at: string;
    version: number;
    delta: DeltaRecord;
  }>
): AuditEntryTransformed[] {
  return entries.map((entry) => transformAuditEntry(entry));
}

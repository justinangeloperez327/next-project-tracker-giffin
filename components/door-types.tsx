"use client";
import { useActionState, useState } from "react";
import { addDoorType, updateDoorType } from "@/app/door-actions";
import { dateFields, type DoorTypeTracker } from "@/lib/tracker-types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
export function AddDoorType({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(addDoorType, {});
  const [name, setName] = useState("");
  return (
    <form action={action} className="panel p-5">
      <input type="hidden" name="projectId" value={projectId} />
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex-1 min-w-40">
          New door type
          <Input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
            placeholder="e.g. Single leaf steel door"
          />
        </label>
        <Button disabled={pending}>
          {pending ? "Adding…" : "Add door type"}
        </Button>
      </div>
      {state.error && (
        <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="mt-3 text-sm">
          {state.success}
        </p>
      )}
    </form>
  );
}
export function DoorTypeForm({
  projectId,
  tracker,
}: {
  projectId: string;
  tracker: DoorTypeTracker;
}) {
  const [state, action, pending] = useActionState(updateDoorType, {});
  const [values, setValues] = useState(tracker);
  return (
    <form action={action} className="panel p-5 md:p-6">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="id" value={tracker.id} />
      <fieldset disabled={pending}>
        <legend className="text-xl font-semibold mb-5">{tracker.name}</legend>
        <label className="mb-5 max-w-lg">
          Door type name
          <Input
            name="name"
            required
            maxLength={120}
            value={values.name}
            onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dateFields.map(([name, label]) => (
            <label key={name}>
              {label}
              <Input
                name={name}
                type="date"
                min="1900-01-01"
                max="9999-12-31"
                value={values[name] ?? ""}
                onChange={(e) =>
                  setValues((p) => ({ ...p, [name]: e.target.value }))
                }
              />
            </label>
          ))}
        </div>
        <label className="mt-4">
          Remarks
          <textarea
            name="remarks"
            rows={3}
            maxLength={4000}
            value={values.remarks}
            onChange={(e) =>
              setValues((p) => ({ ...p, remarks: e.target.value }))
            }
            className="w-full rounded-md border bg-background p-3 text-sm focus-visible:outline-primary"
          />
        </label>
        <Button className="mt-4">
          {pending ? "Saving…" : "Save door type"}
        </Button>
        {state.error && (
          <p
            role="alert"
            className="mt-3 text-sm text-red-700 dark:text-red-300"
          >
            {state.error}
          </p>
        )}
        {state.success && (
          <p role="status" className="mt-3 text-sm">
            {state.success}
          </p>
        )}
      </fieldset>
    </form>
  );
}

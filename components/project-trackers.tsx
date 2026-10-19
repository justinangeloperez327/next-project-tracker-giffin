"use client";
import { useActionState, useState } from "react";
import {
  saveSubstationTracker,
  saveBusShelterTracker,
} from "@/app/tracker-actions";
import {
  dateFields,
  type SubstationTracker,
  type BusShelterTracker,
} from "@/lib/tracker-types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
export function SubstationItemForm({
  projectId,
  tracker,
}: {
  projectId: string;
  tracker: SubstationTracker;
}) {
  const [state, action, pending] = useActionState(saveSubstationTracker, {});
  const [values, setValues] = useState(tracker);
  return (
    <form action={action} className="panel p-5 md:p-6">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="item" value={tracker.item} />
      <fieldset disabled={pending}>
        <legend className="text-xl font-semibold tracking-tight mb-5">
          {tracker.item}
        </legend>
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
                onChange={(event) =>
                  setValues((previous) => ({
                    ...previous,
                    [name]: event.target.value,
                  }))
                }
              />
            </label>
          ))}
        </div>
        <label className="mt-4">
          Remarks
          <textarea
            name="remarks"
            maxLength={4000}
            rows={3}
            value={values.remarks}
            onChange={(event) =>
              setValues((previous) => ({
                ...previous,
                remarks: event.target.value,
              }))
            }
            className="w-full rounded-md border bg-background p-3 text-sm focus-visible:outline-primary"
          />
        </label>
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <Button>
            {pending ? "Saving…" : `Save ${tracker.item.toLowerCase()}`}
          </Button>
          {state.error && (
            <p role="alert" className="text-sm text-red-700 dark:text-red-300">
              {state.error}
            </p>
          )}
          {state.success && (
            <p role="status" className="text-sm">
              {state.success}
            </p>
          )}
        </div>
      </fieldset>
    </form>
  );
}
export function BusShelterForm({
  projectId,
  tracker,
}: {
  projectId: string;
  tracker: BusShelterTracker | null;
}) {
  const [state, action, pending] = useActionState(saveBusShelterTracker, {});
  const [totalInput, setTotalInput] = useState(String(tracker?.total ?? ""));
  const [installedInput, setInstalledInput] = useState(
    String(tracker?.installed ?? 0),
  );
  const total = tracker?.total ?? 0;
  const installed = tracker?.installed ?? 0;
  const progress = total ? Math.round((installed / total) * 100) : 0;
  return (
    <section className="panel p-5 md:p-6 max-w-3xl">
      <h2>Bus shelter installation</h2>
      <p className="muted mt-2 mb-6">
        Update the total number of shelters and the number installed.
      </p>
      {tracker ? (
        <>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              ["Total", total],
              ["Installed", installed],
              ["Remaining", total - installed],
            ].map(([label, count]) => (
              <div key={label} className="border-l-2 border-primary pl-3">
                <p className="text-xs muted">{label}</p>
                <p className="text-2xl data mt-2">{count}</p>
              </div>
            ))}
          </div>
          <div
            role="progressbar"
            aria-label="Shelters installed"
            aria-valuenow={installed}
            aria-valuemin={0}
            aria-valuemax={total || 1}
            aria-valuetext={`${installed} of ${total} shelters installed`}
            className="h-2 bg-muted"
          >
            <div className="h-2 bg-primary" style={{ width: `${progress}%` }} />
          </div>
          <p className="muted text-xs mt-2 mb-7">
            {progress}% installed · Saved counts
          </p>
        </>
      ) : (
        <p className="muted mb-6">No shelter counts recorded yet.</p>
      )}
      <form action={action}>
        <input type="hidden" name="projectId" value={projectId} />
        <fieldset disabled={pending}>
          <legend className="sr-only">Shelter counts</legend>
          <div className="grid sm:grid-cols-2 gap-4">
            <label>
              Total shelters
              <Input
                name="total"
                type="number"
                min="0"
                max="1000000"
                step="1"
                required
                value={totalInput}
                onChange={(event) => setTotalInput(event.target.value)}
              />
            </label>
            <label>
              Installed shelters
              <Input
                name="installed"
                type="number"
                min="0"
                max="1000000"
                step="1"
                required
                value={installedInput}
                onChange={(event) => setInstalledInput(event.target.value)}
              />
            </label>
          </div>
          <Button className="mt-5">
            {pending ? "Saving…" : "Save shelter counts"}
          </Button>
        </fieldset>
        {state.error && (
          <p
            role="alert"
            className="mt-4 text-sm text-red-700 dark:text-red-300"
          >
            {state.error}
          </p>
        )}
        {state.success && (
          <p role="status" className="mt-4 text-sm">
            {state.success}
          </p>
        )}
      </form>
    </section>
  );
}

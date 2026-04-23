"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  TemperatureRecordDTO,
  useAddTemperatureRecordMutation,
  useEditTemperatureRecordMutation,
  useGetTemperatureRecordsQuery,
} from "@/app/redux/services/fridge.service";

const toISOFromDateInput = (yyyyMmDd: string): string =>
  new Date(`${yyyyMmDd}T00:00:00.000Z`).toISOString();

const formatTemp = (t?: number) => {
  if (t === undefined || t === null) return "-";
  return `${t} °C`;
};

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export default function TemperatureRecordsTable() {
  const params = useParams();
  const fridgeId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  /* ---------------- editor state ---------------- */
  const [selectedDate, setSelectedDate] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  /* ---------------- filter state ---------------- */
  const [filterMode, setFilterMode] = useState<"all" | "date" | "range">("all");
  const [filterDateInput, setFilterDateInput] = useState("");
  const [filterStartInput, setFilterStartInput] = useState("");
  const [filterEndInput, setFilterEndInput] = useState("");

  const [appliedFilters, setAppliedFilters] = useState<{
    date?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  /* ---------------- expand state ---------------- */
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  /* ---------------- query ---------------- */
  const queryArgs = useMemo(
    () => ({
      fridgeId: fridgeId ?? "",
      ...appliedFilters,
    }),
    [fridgeId, appliedFilters]
  );

  const {
    data: records = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetTemperatureRecordsQuery(queryArgs, {
    skip: !fridgeId,
  });

  const [addTemperatureRecord, { isLoading: isAdding }] =
    useAddTemperatureRecordMutation();

  const [editTemperatureRecord, { isLoading: isEditing }] =
    useEditTemperatureRecordMutation();

  /* ---------------- derived ---------------- */
  const recordsByDay = useMemo(() => {
    const map: Record<string, TemperatureRecordDTO[]> = {};

    for (const r of records) {
      const dayKey = (r?.date || "").slice(0, 10);
      if (!dayKey) continue;
      (map[dayKey] ||= []).push(r);
    }

    for (const k of Object.keys(map)) {
      map[k].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    return map;
  }, [records]);

  const dayRows = useMemo(() => {
    const days = Object.keys(recordsByDay);

    days.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return days.map((day) => ({
      day,
      latest: recordsByDay[day][0],
      count: recordsByDay[day].length,
      all: recordsByDay[day],
    }));
  }, [recordsByDay]);

  const existingForSelectedDay = selectedDate
    ? recordsByDay[selectedDate]?.[0]
    : null;

  /* ---------------- handlers ---------------- */
  const onPickDate = (value: string) => {
    setSelectedDate(value);

    const latest = recordsByDay[value]?.[0];

    if (latest) {
      setMin(String(latest.minTemperature ?? ""));
      setMax(String(latest.maxTemperature ?? ""));
    } else {
      setMin("");
      setMax("");
    }
  };

  const validate = () => {
    if (!selectedDate) return "Please select a date.";
    if (min === "" || max === "") return "Please enter both Min and Max.";
    if (Number.isNaN(Number(min)) || Number.isNaN(Number(max))) {
      return "Min/Max must be numbers.";
    }
    return null;
  };

  const handleSave = async () => {
    if (!fridgeId) return;

    const errMsg = validate();
    if (errMsg) {
      alert(errMsg);
      return;
    }

    const payload = {
      fridgeId,
      minTemperature: Number(min),
      maxTemperature: Number(max),
    };

    try {
      if (existingForSelectedDay) {
        await editTemperatureRecord({
          ...payload,
          recordId: existingForSelectedDay._id ?? existingForSelectedDay.date,
        }).unwrap();
      } else {
        await addTemperatureRecord({
          ...payload,
          date: toISOFromDateInput(selectedDate),
        }).unwrap();
      }

      await refetch();
    } catch (e) {
      alert("Failed to save record.");
      console.error(e);
    }
  };

  const handleEditFromTable = (day: string) => {
    onPickDate(day);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearEditor = () => {
    setSelectedDate("");
    setMin("");
    setMax("");
  };

  const applyFilters = () => {
    if (filterMode === "all") {
      setAppliedFilters({});
      return;
    }

    if (filterMode === "date") {
      setAppliedFilters(
        filterDateInput
          ? {
              date: filterDateInput,
            }
          : {}
      );
      return;
    }

    if (filterMode === "range") {
      setAppliedFilters({
        ...(filterStartInput ? { startDate: filterStartInput } : {}),
        ...(filterEndInput ? { endDate: filterEndInput } : {}),
      });
    }
  };

  const clearFilters = () => {
    setFilterMode("all");
    setFilterDateInput("");
    setFilterStartInput("");
    setFilterEndInput("");
    setAppliedFilters({});
    setExpandedDay(null);
  };

  /* ---------------- exports ---------------- */
  const exportCSV = () => {
    if (!records.length) return;

    const header = ["Date", "Time", "Min (°C)", "Max (°C)", "Status"];

    const rows = [...records]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((r) => [
        r.date.slice(0, 10),
        formatTime(r.date),
        `${r.minTemperature} °C`,
        `${r.maxTemperature} °C`,
        r.status ?? "created",
      ]);

    const csv = [header, ...rows].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "temperature-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!records.length) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Food Temperature Log Report", 14, 15);

    const rows = [...records]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((r) => [
        r.date.slice(0, 10),
        formatTime(r.date),
        `${r.minTemperature} °C`,
        `${r.maxTemperature} °C`,
        r.status ?? "created",
      ]);

    autoTable(doc, {
      startY: 25,
      head: [["Date", "Time", "Min (°C)", "Max (°C)", "Status"]],
      body: rows,
    });

    doc.save("temperature-report.pdf");
  };

  if (isLoading) return <p className="p-6">Loading…</p>;
  if (isError) return <p className="p-6">Error: {JSON.stringify(error)}</p>;

  const saving = isAdding || isEditing;

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold">Food Temperature Log</h1>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportCSV}
            className="px-3 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700"
          >
            Export CSV
          </button>

          <button
            onClick={exportPDF}
            className="px-3 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700"
          >
            Export PDF
          </button>

          <button
            onClick={() => refetch()}
            className="px-3 py-2 border border-gray-200 rounded-sm hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="border border-gray-200 rounded-sm p-4 bg-white space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-3 py-2 rounded-sm border ${
              filterMode === "all"
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setFilterMode("date")}
            className={`px-3 py-2 rounded-sm border ${
              filterMode === "date"
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            Single Date
          </button>

          <button
            onClick={() => setFilterMode("range")}
            className={`px-3 py-2 rounded-sm border ${
              filterMode === "range"
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            Date Range
          </button>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          {filterMode === "date" && (
            <div className="flex-1">
              <label className="text-sm text-gray-600">Date</label>
              <input
                type="date"
                className="mt-1 w-full border border-gray-200 rounded-sm px-3 py-2"
                value={filterDateInput}
                onChange={(e) => setFilterDateInput(e.target.value)}
              />
            </div>
          )}

          {filterMode === "range" && (
            <>
              <div className="flex-1">
                <label className="text-sm text-gray-600">Start Date</label>
                <input
                  type="date"
                  className="mt-1 w-full border border-gray-200 rounded-sm px-3 py-2"
                  value={filterStartInput}
                  onChange={(e) => setFilterStartInput(e.target.value)}
                />
              </div>

              <div className="flex-1">
                <label className="text-sm text-gray-600">End Date</label>
                <input
                  type="date"
                  className="mt-1 w-full border border-gray-200 rounded-sm px-3 py-2"
                  value={filterEndInput}
                  onChange={(e) => setFilterEndInput(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700"
            >
              Apply Filter
            </button>

            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-200 rounded-sm hover:bg-gray-50"
            >
              Clear Filter
            </button>
          </div>
        </div>

        {(appliedFilters.date ||
          appliedFilters.startDate ||
          appliedFilters.endDate) && (
          <div className="text-sm text-gray-600">
            Active filter:{" "}
            {appliedFilters.date
              ? `Date = ${appliedFilters.date}`
              : `Range = ${appliedFilters.startDate || "Any"} → ${
                  appliedFilters.endDate || "Any"
                }`}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="border border-gray-200 rounded-sm p-4 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <label className="text-sm text-gray-600">Date</label>
            <input
              type="date"
              className="mt-1 w-full border border-gray-200 rounded-sm px-3 py-2"
              value={selectedDate}
              onChange={(e) => onPickDate(e.target.value)}
            />
          </div>

          <div className="flex-1">
            <label className="text-sm text-gray-600">Min (°C)</label>
            <input
              type="number"
              className="mt-1 w-full border border-gray-200 rounded-sm px-3 py-2"
              value={min}
              onChange={(e) => setMin(e.target.value)}
            />
          </div>

          <div className="flex-1">
            <label className="text-sm text-gray-600">Max (°C)</label>
            <input
              type="number"
              className="mt-1 w-full border border-gray-200 rounded-sm px-3 py-2"
              value={max}
              onChange={(e) => setMax(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white rounded-sm px-5 py-2 hover:bg-blue-700 disabled:opacity-60"
            >
              {existingForSelectedDay ? "Update" : "Add"}
            </button>

            <button
              onClick={clearEditor}
              className="border border-gray-200 rounded-sm px-4 py-2 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-sm overflow-hidden bg-white">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 border-b border-gray-200">Date</th>
              <th className="text-left p-3 border-b border-gray-200">Min</th>
              <th className="text-left p-3 border-b border-gray-200">Max</th>
              <th className="text-left p-3 border-b border-gray-200">Entries</th>
              <th className="text-left p-3 border-b border-gray-200">Last Time</th>
              <th className="text-left p-3 border-b border-gray-200">Status</th>
              <th className="text-left p-3 border-b border-gray-200">Action</th>
            </tr>
          </thead>

          <tbody>
            {dayRows.length === 0 ? (
              <tr>
                <td className="p-4" colSpan={7}>
                  No records found.
                </td>
              </tr>
            ) : (
              dayRows.map(({ day, latest, count, all }) => {
                const isExpanded = expandedDay === day;

                return (
                  <React.Fragment key={day}>
                    <tr className="hover:bg-gray-50">
                      <td className="p-3 border-b border-gray-200 font-medium">
                        {day}
                      </td>

                      <td className="p-3 border-b border-gray-200">
                        {formatTemp(latest.minTemperature)}
                      </td>

                      <td className="p-3 border-b border-gray-200">
                        {formatTemp(latest.maxTemperature)}
                      </td>

                      <td className="p-3 border-b border-gray-200">
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() =>
                            setExpandedDay((prev) => (prev === day ? null : day))
                          }
                        >
                          {count} entries
                        </button>
                      </td>

                      <td className="p-3 border-b border-gray-200">
                        {formatTime(latest.date)}
                      </td>

                      <td className="p-3 border-b border-gray-200">
                        <span className="px-2 py-1 text-sm border border-gray-200 rounded-sm bg-gray-50">
                          {latest.status ?? "created"}
                        </span>
                      </td>

                      <td className="p-3 border-b border-gray-200">
                        <button
                          onClick={() => handleEditFromTable(day)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-0 border-b border-gray-200 bg-gray-50"
                        >
                          <div className="p-3">
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse bg-white">
                                <thead>
                                  <tr>
                                    <th className="text-left p-2 border border-gray-200">
                                      Time
                                    </th>
                                    <th className="text-left p-2 border border-gray-200">
                                      Min
                                    </th>
                                    <th className="text-left p-2 border border-gray-200">
                                      Max
                                    </th>
                                    <th className="text-left p-2 border border-gray-200">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {all.map((entry, idx) => (
                                    <tr key={entry._id ?? `${entry.date}-${idx}`}>
                                      <td className="p-2 border border-gray-200">
                                        {formatTime(entry.date)}
                                      </td>
                                      <td className="p-2 border border-gray-200">
                                        {formatTemp(entry.minTemperature)}
                                      </td>
                                      <td className="p-2 border border-gray-200">
                                        {formatTemp(entry.maxTemperature)}
                                      </td>
                                      <td className="p-2 border border-gray-200">
                                        {entry.status ?? "created"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
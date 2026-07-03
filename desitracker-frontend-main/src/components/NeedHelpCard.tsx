/* src/components/help/FloatingNeedHelpWidget.tsx */
"use client";

import React, { useMemo, useState } from "react";
import { FiHelpCircle, FiX, FiChevronDown, FiExternalLink, FiPlayCircle, FiFileText } from "react-icons/fi";

type Tab = "gas" | "electricity" | "training";

type FAQ = { q: string; a: React.ReactNode };

type ResourceType = "pdf" | "youtube" | "link";
type Resource = {
    title: string;
    href: string;
    type: ResourceType;
    note?: string;
};

type Viewer = null | {
    type: ResourceType;
    title: string;
    href: string;
};

function cn(...xs: Array<string | false | null | undefined>) {
    return xs.filter(Boolean).join(" ");
}

function isYouTubeUrl(url: string) {
    try {
        const u = new URL(url);
        return (
            u.hostname.includes("youtube.com") ||
            u.hostname.includes("youtu.be")
        );
    } catch {
        return false;
    }
}

function toYouTubeEmbed(url: string) {
    // Supports:
    // - https://youtu.be/VIDEOID
    // - https://www.youtube.com/watch?v=VIDEOID
    // - https://www.youtube.com/embed/VIDEOID
    try {
        const u = new URL(url);
        if (u.hostname.includes("youtu.be")) {
            const id = u.pathname.replace("/", "");
            return `https://www.youtube.com/embed/${id}`;
        }
        if (u.pathname.startsWith("/embed/")) return url;
        const id = u.searchParams.get("v");
        if (id) return `https://www.youtube.com/embed/${id}`;
        return url;
    } catch {
        return url;
    }
}

function AccordionItem({
    q,
    a,
    open,
    onToggle,
}: {
    q: string;
    a: React.ReactNode;
    open: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50"
                aria-expanded={open}
            >
                <span className="text-sm font-medium text-gray-900">{q}</span>
                <FiChevronDown
                    className={cn("text-gray-500 transition-transform", open && "rotate-180")}
                />
            </button>
            {open && (
                <div className="px-4 pb-4 text-sm text-gray-700 leading-relaxed">
                    {a}
                </div>
            )}
        </div>
    );
}

function ResourceIcon({ type }: { type: ResourceType }) {
    if (type === "youtube") return <FiPlayCircle className="text-gray-500" />;
    if (type === "pdf") return <FiFileText className="text-gray-500" />;
    return <FiExternalLink className="text-gray-500" />;
}

function BigViewerModal({
    viewer,
    onClose,
}: {
    viewer: Viewer;
    onClose: () => void;
}) {
    if (!viewer) return null;

    const embedUrl =
        viewer.type === "youtube" ? toYouTubeEmbed(viewer.href) : viewer.href;

    return (
        <div className="fixed inset-0 z-[60]">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div
                className={cn(
                    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                    "w-[94vw] max-w-5xl",
                    "bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
                )}
                role="dialog"
                aria-modal="true"
            >
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                            {viewer.title}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{viewer.href}</div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-9 w-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                        aria-label="Close viewer"
                    >
                        <FiX className="text-gray-700" />
                    </button>
                </div>

                <div className="bg-black">
                    {viewer.type === "youtube" ? (
                        <div className="w-full aspect-video">
                            <iframe
                                className="w-full h-full"
                                src={embedUrl}
                                title={viewer.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    ) : viewer.type === "pdf" ? (
                        <div className="w-full h-[75vh]">
                            <iframe
                                className="w-full h-full"
                                src={embedUrl}
                                title={viewer.title}
                            />
                        </div>
                    ) : (
                        <div className="p-6 bg-white">
                            <div className="text-sm text-gray-700">
                                This is an external link:
                            </div>
                            <a
                                href={viewer.href}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex items-center gap-2 text-blue-600 hover:underline"
                            >
                                Open in new tab <FiExternalLink />
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function FloatingNeedHelpWidget({
    defaultOpen = false,
}: {
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    const [tab, setTab] = useState<Tab>("gas");
    const [openKey, setOpenKey] = useState<string | null>(null);
    const [viewer, setViewer] = useState<Viewer>(null);

    const toggleOpen = () => setOpen((v) => !v);
    const setTabSafe = (t: Tab) => {
        setTab(t);
        setOpenKey(null);
    };

    const content = useMemo(() => {
        const gasFaqs: FAQ[] = [
            {
                q: "New gas connection?",
                a: "Collect NID + address proof, apply via provider office/portal, then schedule inspection.",
            },
            {
                q: "Low gas pressure?",
                a: "Check regulator/valves, check neighbors, then contact provider with customer ID.",
            },
            {
                q: "LPG safety tips?",
                a: "Keep cylinder upright, check leaks, and close valve after use.",
            },
        ];

        const elecFaqs: FAQ[] = [
            {
                q: "Reduce electricity bill?",
                a: "Use LEDs, unplug idle devices, and keep AC at 24–26°C.",
            },
            {
                q: "Meter running too fast?",
                a: "High-load appliances or faulty meter. Request a meter test with recent bills.",
            },
            {
                q: "Power outage steps?",
                a: "Turn off sensitive devices, check breaker/MCB, and report outage to provider.",
            },
        ];

        const trainingFaqs: FAQ[] = [
            {
                q: "How to start training?",
                a: "Open a module, complete the checklist, then try a mock scenario with a teammate.",
            },
            {
                q: "Where are training documents?",
                a: "Use the resources below (PDF or YouTube).",
            },
            {
                q: "How to report an issue?",
                a: "Send steps + screenshots + module name to admin/supervisor.",
            },
        ];

        // ✅ You can replace these with user-added links later
        const trainingResources: Resource[] = [
  {
    title: "Training Handbook (PDF)",
    href: "https://your-domain.com/docs/training-handbook.pdf",
    type: "pdf" as const,
    note: "Basics + checklist",
  },
  {
    title: "Call Handling & Customer Communication (Video)",
    href: "https://www.youtube.com/watch?v=YOUTUBE_VIDEO_ID",
    type: "youtube" as const,
    note: "Professional call guidance",
  },
  {
    title: "Safety & Best Practices",
    href: "https://safety.google/",
    type: "link" as const,
    note: "General safety guidelines",
  },
].map((r) => {
            // auto-detect if user puts youtube link
            if (r.type === "link" && isYouTubeUrl(r.href)) return { ...r, type: "youtube" as const };
            if (r.type === "link" && r.href.toLowerCase().endsWith(".pdf")) return { ...r, type: "pdf" as const };
            return r;
        });

        if (tab === "gas") return { faqs: gasFaqs, resources: [] as Resource[] };
        if (tab === "electricity") return { faqs: elecFaqs, resources: [] as Resource[] };
        return { faqs: trainingFaqs, resources: trainingResources };
    }, [tab]);

    const openViewer = (r: Resource) => {
        setViewer({ type: r.type, title: r.title, href: r.href });
    };

    return (
        <>
            {/* Big centered viewer modal */}
            <BigViewerModal viewer={viewer} onClose={() => setViewer(null)} />

            {/* Closed: floating circle */}
            {!open && (
                <button
                    type="button"
                    onClick={toggleOpen}
                    className={cn(
                        "fixed bottom-5 right-5 z-50",
                        "h-14 w-14 rounded-full shadow-lg",
                        "bg-blue-600 text-white hover:bg-blue-700",
                        "flex items-center justify-center"
                    )}
                    aria-label="Open help"
                    title="Need Help?"
                >
                    <FiHelpCircle className="text-2xl" />
                </button>
            )}

            {/* Open: backdrop + panel */}
            {open && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/30"
                        onClick={toggleOpen}
                        aria-hidden="true"
                    />

                    {/* Fullscreen on mobile, centered panel on desktop */}
                    <div
                        className={cn(
                            "absolute right-0 bottom-0 top-0 w-full bg-white border border-gray-200 shadow-2xl flex flex-col overflow-hidden",
                            "sm:top-auto sm:bottom-5 sm:right-5 sm:w-[420px] sm:h-[78vh] sm:rounded-2xl"
                        )}
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <FiHelpCircle className="text-gray-700" />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">Need Help?</div>
                                    <div className="text-xs text-gray-500">Gas • Electricity • Training</div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={toggleOpen}
                                className="h-9 w-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                                aria-label="Close help"
                                title="Close"
                            >
                                <FiX className="text-gray-700" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="px-4 pt-3">
                            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                                {(["gas", "electricity", "training"] as Tab[]).map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setTabSafe(t)}
                                        className={cn(
                                            "px-3 py-2 text-xs font-medium rounded-md capitalize",
                                            tab === t
                                                ? "bg-white shadow-sm text-gray-900"
                                                : "text-gray-600 hover:text-gray-900"
                                        )}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex-1 overflow-y-auto">
                            <div className="space-y-3">
                                {content.faqs.map((f) => {
                                    const key = `${tab}:${f.q}`;
                                    return (
                                        <AccordionItem
                                            key={key}
                                            q={f.q}
                                            a={f.a}
                                            open={openKey === key}
                                            onToggle={() => setOpenKey((p) => (p === key ? null : key))}
                                        />
                                    );
                                })}
                            </div>

                            {/* Resources (Training) */}
                            {tab === "training" && content.resources.length > 0 && (
                                <div className="mt-6">
                                    <div className="text-sm font-semibold text-gray-900">Resources</div>
                                    <div className="mt-2 space-y-2">
                                        {content.resources.map((r) => (
                                            <button
                                                key={r.href}
                                                type="button"
                                                onClick={() => openViewer(r)}
                                                className="w-full flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50 text-left"
                                            >
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 truncate">
                                                        {r.title}
                                                    </div>
                                                    {r.note && <div className="text-xs text-gray-500">{r.note}</div>}
                                                </div>
                                                <ResourceIcon type={r.type} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-xs text-gray-500">Tap outside to close</div>
                            <button
                                type="button"
                                onClick={toggleOpen}
                                className="rounded-lg bg-gray-100 hover:bg-gray-200 px-3 py-2 text-xs font-medium text-gray-800"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
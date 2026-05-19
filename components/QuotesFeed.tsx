"use client";

import { useEffect, useState } from "react";

type Quote = {
  id: number;
  userId: string;
  text: string;
  createdAt: string;
  userName: string;
  userImage: string | null;
};

/**
 * Format relative time (e.g., "5m ago", "2h ago", "3d ago")
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "práve teraz";
  if (diffMins < 60) return `pred ${diffMins}m`;
  if (diffHours < 24) return `pred ${diffHours}h`;
  if (diffDays < 7) return `pred ${diffDays}d`;

  return date.toLocaleDateString("sk-SK");
}

export default function QuotesFeed() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [newQuoteText, setNewQuoteText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial quotes on mount
  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/quotes");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || `HTTP ${response.status}`;
        console.error(
          `Failed to fetch quotes: ${response.status} - ${errorMsg}`,
        );
        throw new Error(`Failed to fetch quotes: ${errorMsg}`);
      }

      const data = await response.json();
      setQuotes(data.quotes || []);
    } catch (err) {
      console.error("Error fetching quotes:", err);
      setError(
        err instanceof Error ? err.message : "Nepodarilo sa načítať citáty",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newQuoteText.trim()) {
      setError("Zadaj nejaký text");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newQuoteText }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to post quote");
      }

      const data = await response.json();

      // Optimistically add to top of list
      if (data.quote) {
        setQuotes([
          {
            id: data.quote.id,
            userId: data.quote.userId,
            text: data.quote.text,
            createdAt: data.quote.createdAt,
            userName: "You", // Will be replaced on next fetch
            userImage: null,
          },
          ...quotes,
        ]);
      }

      setNewQuoteText("");

      // Refetch to get proper user display name
      setTimeout(() => fetchQuotes(), 500);
    } catch (err) {
      console.error("Error posting quote:", err);
      setError(err instanceof Error ? err.message : "Chyba pri uverejňovaní");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Šoferský Rádio</h2>
        <p className="text-sm text-slate-400">
          Zdieľaj svoje skúsenosti z cesty
        </p>
      </div>

      {/* Post Form */}
      <form
        onSubmit={handleSubmitQuote}
        className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3"
      >
        <textarea
          value={newQuoteText}
          onChange={(e) => setNewQuoteText(e.target.value.slice(0, 280))}
          placeholder="Čo máš nové na ceste, kamoš?..."
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
        />

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {newQuoteText.length} / 280
          </div>
          <button
            type="submit"
            disabled={submitting || !newQuoteText.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {submitting ? "Vysielam..." : "Vysielať"}
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-950/20 border border-red-900/30 rounded p-2">
            {error}
          </div>
        )}
      </form>

      {/* Quotes Feed */}
      <div className="space-y-3 md:space-y-4">
        {loading && !quotes.length ? (
          <div className="text-center py-8 text-slate-400">
            Načítavam citáty...
          </div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-slate-900/30 rounded-lg">
            Zatiaľ žiadne citáty. Buď prvý!
          </div>
        ) : (
          quotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:bg-slate-900/70 transition-colors"
            >
              {/* Header with avatar, name, and time */}
              <div className="flex items-center gap-3 mb-3">
                {quote.userImage ? (
                  <img
                    src={quote.userImage}
                    alt={quote.userName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {quote.userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    {quote.userName}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatRelativeTime(quote.createdAt)}
                  </div>
                </div>
              </div>

              {/* Quote text */}
              <p className="text-sm text-slate-100 leading-relaxed">
                {quote.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

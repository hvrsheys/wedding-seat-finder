import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import SearchBar from "./components/SearchBar.jsx";
import ResultCard from "./components/ResultCard.jsx";

function normalizeName(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function highlightMatch(name, query) {
  const safeName = String(name ?? "");
  const trimmedQuery = String(query ?? "").replace(/\s+/g, " ").trim();

  if (!trimmedQuery) {
    return escapeHtml(safeName);
  }

  const start = safeName.toLowerCase().indexOf(trimmedQuery.toLowerCase());

  if (start === -1) {
    return escapeHtml(safeName);
  }

  const end = start + trimmedQuery.length;

  return `${escapeHtml(safeName.slice(0, start))}<mark style="background:rgba(214,232,215,0.95);color:#2d4032;padding:0 0.16em;border-radius:0.35em;">${escapeHtml(
    safeName.slice(start, end),
  )}</mark>${escapeHtml(safeName.slice(end))}`;
}

export default function App() {
  const [guests, setGuests] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedGuestId, setSelectedGuestId] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [status, setStatus] = useState("Loading guest list...");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    let active = true;

    fetch("/data/nafar_guests.csv", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load CSV: ${response.status}`);
        }

        return response.text();
      })
      .then((csvText) => {
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });

        if (!active) {
          return;
        }

        const nextGuests = parsed.data
          .filter((person) => person.name)
          .map((person, index) => ({
            id: `${normalizeName(person.name)}-${String(person.table ?? "").trim()}-${index}`,
            name: String(person.name).replace(/\s+/g, " ").trim(),
            table: String(person.table ?? "").trim(),
            notes: String(person.notes ?? "").trim(),
            normalizedName: normalizeName(person.name),
          }));

        setGuests(nextGuests);
        setStatus("Start typing to search your name.");
      })
      .catch((error) => {
        console.error(error);
        if (active) {
          setStatus("Guest list could not be loaded. Run the app with Vite.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const trimmedQuery = debouncedQuery.replace(/\s+/g, " ").trim();

  const results = useMemo(() => {
    if (!trimmedQuery) {
      return [];
    }

    const normalizedQuery = normalizeName(trimmedQuery);
    return guests.filter((person) =>
      person.name.toLowerCase().includes(normalizedQuery),
    );
  }, [guests, trimmedQuery]);

  useEffect(() => {
    if (!trimmedQuery) {
      setSelectedGuestId("");
      setStatus("Start typing to search your name.");
      return;
    }

    if (results.length === 0) {
      setSelectedGuestId("");
      setStatus("Name not found. Please check spelling or contact reception.");
      return;
    }

    if (results.length === 1) {
      setSelectedGuestId(results[0].id);
      setStatus("Guest found.");
      return;
    }

    setSelectedGuestId("");
    setStatus("Select your name from the list below.");
  }, [results, trimmedQuery]);

  const selectedGuest = useMemo(
    () => results.find((person) => person.id === selectedGuestId) ?? null,
    [results, selectedGuestId],
  );

  return (
    <>
      <style>{globalStyles}</style>
      <div
        style={{
          ...styles.page,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.72), rgba(255,255,255,0.72)), url('/images/nafar-bg.jpg')",
        }}
      >
        <div style={styles.overlay} aria-hidden="true" />
        <div style={styles.shell}>
          <main style={styles.card}>
            <div style={styles.floralTopLeft} aria-hidden="true">
              <FloralCorner direction="left" />
            </div>
            <div style={styles.floralBottomRight} aria-hidden="true">
              <FloralCorner direction="right" />
            </div>

            <p style={styles.eyebrow}>Majlis Perkahwinan</p>
            <h1 style={styles.heading}>Azfar &amp; Nadya</h1>
            <p style={styles.description}>
              Enter your name below to find your seat in seconds.
            </p>

            <section style={styles.panel}>
              <h2 style={styles.panelTitle}>Find Your Seat</h2>
              <SearchBar query={query} onQueryChange={setQuery} />
              <p style={styles.status} aria-live="polite">
                {status}
              </p>

              {trimmedQuery && results.length > 1 && !selectedGuest ? (
                <ul style={styles.list}>
                  {results.map((person) => (
                    <li key={person.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedGuestId(person.id)}
                        style={styles.listButton}
                      >
                        <span
                          style={styles.listName}
                          dangerouslySetInnerHTML={{
                            __html: highlightMatch(person.name, trimmedQuery),
                          }}
                        />
                        <span style={styles.listMeta}>Table {person.table || "-"}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              {trimmedQuery && results.length === 0 ? (
                <div style={styles.emptyState}>
                  Name not found. Please check spelling or contact reception.
                </div>
              ) : null}

              <ResultCard guest={selectedGuest} />
            </section>
          </main>
        </div>

        <footer style={styles.siteFooter}>
          <p style={styles.footerCopy}>&copy; 2026 hersheys . All Rights Reserved</p>
          <p style={styles.footerNote}>
            For assistance, please proceed to our registration counter.
          </p>
        </footer>
      </div>
    </>
  );
}

function FloralCorner({ direction }) {
  const isLeft = direction === "left";

  return (
    <svg
      width="220"
      height="220"
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        overflow: "visible",
        transform: isLeft ? "none" : "rotate(180deg)",
      }}
    >
      <g opacity="0.2">
        <path
          d="M34 168C58 150 73 128 82 102C88 83 96 58 122 36"
          stroke="#ffffff"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M83 105C69 96 58 90 42 89"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M93 88C82 75 73 66 58 59"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M103 66C99 51 100 38 107 24"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="40" cy="88" r="10" fill="#ffffff" opacity="0.7" />
        <circle cx="52" cy="61" r="9" fill="#ffffff" opacity="0.55" />
        <circle cx="107" cy="22" r="10" fill="#ffffff" opacity="0.55" />
        <circle cx="58" cy="108" r="7" fill="#ffffff" opacity="0.48" />
      </g>
    </svg>
  );
}

const globalStyles = `
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; font-family: "Instrument Sans", sans-serif; background: #f3f9f3; }
  button, input { font: inherit; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes floralFade {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    padding: "1rem",
    backgroundColor: "#edf5ed",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    animation: "floralFade 600ms ease",
  },
  shell: {
    position: "relative",
    zIndex: 1,
    minHeight: "calc(100vh - 2rem)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: "40rem",
    padding: "1.4rem",
    borderRadius: "2rem",
    border: "1px solid rgba(255,255,255,0.72)",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.88), rgba(245,250,245,0.82))",
    boxShadow: "0 24px 60px rgba(81, 108, 86, 0.14)",
    backdropFilter: "blur(14px)",
    overflow: "hidden",
  },
  floralTopLeft: {
    position: "absolute",
    top: "-1.2rem",
    left: "-1.6rem",
    pointerEvents: "none",
    opacity: 0.8,
    animation: "floralFade 900ms ease",
  },
  floralBottomRight: {
    position: "absolute",
    right: "-1.9rem",
    bottom: "-1.4rem",
    pointerEvents: "none",
    opacity: 0.78,
    animation: "floralFade 1200ms ease",
  },
  eyebrow: {
    margin: 0,
    position: "relative",
    textAlign: "center",
    color: "#5e7564",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.32em",
    textTransform: "uppercase",
  },
  heading: {
    margin: "0.9rem 0 0",
    position: "relative",
    textAlign: "center",
    color: "#273a2c",
    fontFamily: '"Playfair Display", serif',
    fontSize: "clamp(2.6rem, 9vw, 4.8rem)",
    lineHeight: 0.96,
  },
  description: {
    margin: "1rem auto 0",
    maxWidth: "28rem",
    position: "relative",
    textAlign: "center",
    color: "#607764",
    lineHeight: 1.7,
    fontSize: "1rem",
  },
  panel: {
    marginTop: "1.6rem",
    padding: "1.25rem",
    position: "relative",
    borderRadius: "1.8rem",
    border: "1px solid rgba(126, 166, 132, 0.2)",
    background: "rgba(255,255,255,0.7)",
  },
  panelTitle: {
    margin: "0 0 1rem",
    textAlign: "center",
    color: "#273a2c",
    fontFamily: '"Playfair Display", serif',
    fontSize: "2rem",
  },
  status: {
    minHeight: "1.5rem",
    margin: "0.9rem 0 0",
    color: "#647b69",
    fontSize: "0.95rem",
    lineHeight: 1.5,
  },
  list: {
    listStyle: "none",
    margin: "1rem 0 0",
    padding: 0,
    display: "grid",
    gap: "0.75rem",
  },
  listButton: {
    width: "100%",
    border: "1px solid rgba(126, 166, 132, 0.2)",
    borderRadius: "1.25rem",
    background: "rgba(255,255,255,0.96)",
    boxShadow: "0 10px 24px rgba(85, 115, 92, 0.08)",
    padding: "1rem 1rem",
    textAlign: "left",
    cursor: "pointer",
  },
  listName: {
    display: "block",
    color: "#2d4032",
    fontSize: "1rem",
    fontWeight: 600,
  },
  listMeta: {
    display: "block",
    marginTop: "0.35rem",
    color: "#6f8473",
    fontSize: "0.93rem",
  },
  emptyState: {
    marginTop: "1rem",
    borderRadius: "1.25rem",
    border: "1px dashed rgba(126, 166, 132, 0.42)",
    background: "rgba(255,255,255,0.82)",
    padding: "1rem",
    color: "#647b69",
    lineHeight: 1.6,
    fontSize: "0.95rem",
  },
  siteFooter: {
    position: "relative",
    zIndex: 1,
    padding: "0 1rem 1.1rem",
    textAlign: "center",
  },
  footerCopy: {
    margin: 0,
    color: "#7a8e7d",
    fontSize: "0.78rem",
    letterSpacing: "0.08em",
  },
  footerNote: {
    margin: "0.45rem 0 0",
    color: "#8a9b8c",
    fontSize: "0.82rem",
    lineHeight: 1.6,
  },
};

export default function SearchBar({ query, onQueryChange }) {
  return (
    <div>
      <label htmlFor="guest-name" style={styles.label}>
        Enter your name
      </label>
      <input
        id="guest-name"
        type="text"
        autoComplete="off"
        inputMode="text"
        placeholder="Your Name"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        style={styles.input}
      />
    </div>
  );
}

const styles = {
  label: {
    display: "block",
    marginBottom: "0.7rem",
    color: "#4f6655",
    fontSize: "0.95rem",
    fontWeight: 600,
  },
  input: {
    width: "100%",
    height: "3.6rem",
    padding: "0 1rem",
    borderRadius: "1.2rem",
    border: "1px solid rgba(112, 145, 118, 0.22)",
    background: "rgba(255,255,255,0.95)",
    color: "#2d4032",
    fontSize: "1rem",
    outline: "none",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
  },
};

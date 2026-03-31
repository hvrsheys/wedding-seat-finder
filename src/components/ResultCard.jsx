export default function ResultCard({ guest }) {
  if (!guest) {
    return null;
  }

  return (
    <div style={styles.card}>
      <p style={styles.kicker}>Welcome</p>
      <h3 style={styles.name}>{guest.name}</h3>
      <p style={styles.table}>Table {guest.table || "-"}</p>
      <p style={styles.footer}>Enjoy the wedding</p>
    </div>
  );
}

const styles = {
  card: {
    marginTop: "1.25rem",
    padding: "2rem 1.5rem",
    borderRadius: "1.75rem",
    border: "1px solid rgba(126, 166, 132, 0.2)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(244,250,244,0.96))",
    boxShadow: "0 24px 50px rgba(81, 108, 86, 0.12)",
    textAlign: "center",
    animation: "fadeUp 320ms ease",
  },
  kicker: {
    margin: 0,
    color: "#6b8270",
    fontSize: "0.76rem",
    fontWeight: 600,
    letterSpacing: "0.28em",
    textTransform: "uppercase",
  },
  name: {
    margin: "0.8rem 0 0",
    color: "#253a2b",
    fontFamily: '"Playfair Display", serif',
    fontSize: "clamp(2rem, 7vw, 3rem)",
    lineHeight: 1.05,
  },
  table: {
    margin: "1rem 0 0",
    color: "#38513f",
    fontSize: "1.15rem",
    fontWeight: 600,
  },
  footer: {
    margin: "1rem 0 0",
    color: "#7d9281",
    fontSize: "0.96rem",
  },
};

export const getRadioButtonStyle = (activeState: string, item: string) => {
  return {
    backgroundColor: activeState === item ? "#2b6cb0" : "white",
    color: activeState === item ? "white" : "gray",
    borderColor: "#cbd5e0",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    borderRadius: "0.375rem",
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s ease",
  };
};
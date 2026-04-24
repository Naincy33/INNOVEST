export const generateIdea = async () => {
  try {
    const res = await fetch("http://192.168.1.54:5000/generate-idea", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (typeof data.result === "string") {
      return JSON.parse(data.result);
    }

    return data.result || data;

  } catch (err) {
    console.log("AI ERROR:", err);

    return {
      title: "AI Failed",
      problem: "Backend not connected properly",
      solution: "Check server / IP / route",
    };
  }
};
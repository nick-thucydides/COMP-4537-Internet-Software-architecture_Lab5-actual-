const SERVER_URL = "https://comp-4537-lab5-m13.onrender.com/";

document.getElementById("insertBtn").onclick = async () => {
  const query = `INSERT INTO patient (name, dateOfBirth) VALUES
    ('Sara Brown', '1901-01-01'),
    ('John Smith', '1941-01-01'),
    ('Jack Ma', '1961-01-30'),
    ('Elon Musk', '1999-01-01');`;

  const res = await fetch(SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  document.getElementById("output").textContent = JSON.stringify(data, null, 2);
};

document.getElementById("sendQuery").onclick = async () => {
  const sql = document.getElementById("sqlsQuery").value.trim();
  if (!sql) return alert(messages.NO_QUERY);

  let res;
  if (sql.toLowerCase().startsWith("select")) {
    res = await fetch(`${SERVER_URL}?sql=${encodeURIComponent(sql)}`);
  }
  else if (sql.toLowerCase().startsWith("insert")) {
    res = await fetch(SERVER_URL,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: sql })
      });

  }
  else {
    return alert(messages.WRONG_OPERATION);
  }
  const data = await res.json();
  document.getElementById("output").textContent = JSON.stringify(data, null, 2);
};
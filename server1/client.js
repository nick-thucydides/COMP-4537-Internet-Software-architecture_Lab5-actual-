const SERVER_URL = "http://localhost:5000"; 

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

document.getElementById("sendQuery").onclick = async () => 
{
  const sql = document.getElementById("sqlQuery").value.trim();
  if (!sql) return alert("Enter a SQL query");

  let res;
  if (sql.toLowerCase().startsWith("select")) 
  {
    res = await fetch(`${SERVER_URL}?sql=${encodeURIComponent(sql)}`);
  } 
  else if (sql.toLowerCase().startsWith("insert"))
  {
    res = await fetch(SERVER_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: sql })
    });

  } 
  else
 {
    return alert("Only SELECT or INSERT allowed");
  }
  const data = await res.json();
  document.getElementById("output").textContent = JSON.stringify(data, null, 2);
};
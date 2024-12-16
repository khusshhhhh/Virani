// const BASE_URL = "http://localhost:5000";

async function fetchDashboardData() {
  try {
    const [jobsResponse, contractorsResponse] = await Promise.all([
      fetch(`${BASE_URL}/jobs`, { credentials: "include" }),
      fetch(`${BASE_URL}/contractors`, { credentials: "include" }),
    ]);

    if (jobsResponse.status === 401 || contractorsResponse.status === 401) {
      alert("Session expired. Please log in again.");
      window.location.href = "login.html";
      return;
    }

    if (!jobsResponse.ok || !contractorsResponse.ok)
      throw new Error("Failed to fetch dashboard data");

    const jobs = await jobsResponse.json();
    const contractors = await contractorsResponse.json();

    const jobsList = document.getElementById("recent-jobs");
    const contractorsList = document.getElementById("recent-contractors");

    jobsList.innerHTML = jobs.length
      ? jobs
          .slice(0, 5)
          .map(
            (job) =>
              `<li>${job.address} - ${
                job.contractor || "Unassigned"
              } (Deadline: ${job.deadline}, Status: ${job.status})</li>`
          )
          .join("")
      : "<li>No recent jobs found</li>";

    contractorsList.innerHTML = contractors.length
      ? contractors
          .slice(0, 5)
          .map(
            (contractor) =>
              `<li>${contractor.name} (${contractor.category}) - ${contractor.mobile}</li>`
          )
          .join("")
      : "<li>No recent contractors found</li>";
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("recent-jobs")) fetchDashboardData();
});

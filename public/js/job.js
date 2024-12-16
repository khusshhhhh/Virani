// Define BASE_URL globally
// const BASE_URL = "http://localhost:5000";

// document.addEventListener("DOMContentLoaded", () => {
//   const jobTableBody = document.querySelector("#job-table tbody");

//   if (jobTableBody) {
//     fetchJobs();
//   }
// });
// Fetch and display jobs
async function fetchJobs(filter = "") {
  const jobTableBody = document.querySelector("#job-table tbody");

  if (!jobTableBody) {
    console.error("Job table body not found in the DOM");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/jobs?status=${filter}`);
    if (!response.ok) {
      throw new Error("Failed to fetch jobs");
    }

    const jobs = await response.json();
    jobTableBody.innerHTML = "";

    if (jobs.length === 0) {
      jobTableBody.innerHTML = "<tr><td colspan='11'>No jobs found</td></tr>";
      return;
    }

    for (const job of jobs) {
      const row = document.createElement("tr");
      row.innerHTML = `
              <td>${job.id}</td>
              <td>${job.category}</td>
              <td><input type="text" value="${job.address}" data-id="${
        job.id
      }" data-column="address" class="editable-field"></td>
              <td>${job.created_date}</td>
              <td><input type="date" value="${job.deadline || ""}" data-id="${
        job.id
      }" data-column="deadline" class="editable-field"></td>
              <td>
                  <select data-id="${
                    job.id
                  }" data-column="status" class="editable-field">
                      ${[
                        "justgot",
                        "inspected",
                        "confirmed",
                        "ongoing",
                        "completed",
                      ]
                        .map(
                          (status) =>
                            `<option value="${status}" ${
                              job.status === status ? "selected" : ""
                            }>${status}</option>`
                        )
                        .join("")}
                  </select>
              </td>
              <td>
                  <select data-id="${
                    job.id
                  }" data-column="contractor" class="editable-field contractor-dropdown">
                      <option value="">Select Contractor</option>
                  </select>
              </td>
              <td><input type="number" value="${
                job.contractor_quote || ""
              }" data-id="${
        job.id
      }" data-column="contractor_quote" class="editable-field"></td>
              <td><input type="number" value="${
                job.job_quote || ""
              }" data-id="${
        job.id
      }" data-column="job_quote" class="editable-field"></td>
              <td><input type="number" value="${job.expenses || ""}" data-id="${
        job.id
      }" data-column="expenses" class="editable-field"></td>
              <td>
                  <button class="save-btn" data-id="${
                    job.id
                  }" style="display: none;">Save</button>
                  <button class="delete-btn" data-id="${
                    job.id
                  }" style="background-color: red; color: white;">Delete</button>
              </td>
          `;

      // Populate contractors dropdown
      const contractorDropdown = row.querySelector(".contractor-dropdown");
      await populateContractors(contractorDropdown, job.contractor);

      row.querySelectorAll(".editable-field").forEach((field) => {
        field.addEventListener("change", () => {
          row.querySelector(".save-btn").style.display = "inline-block";
        });
      });

      // Save button functionality
      row
        .querySelector(".save-btn")
        .addEventListener("click", () => saveJob(job.id, row));

      // Delete button functionality
      row
        .querySelector(".delete-btn")
        .addEventListener("click", () => deleteJob(job.id));

      jobTableBody.appendChild(row);
    }
  } catch (error) {
    console.error("Error fetching jobs:", error);
    alert("Error fetching jobs. Please try again.");
  }
}

// Populate contractors dropdown
async function populateContractors(dropdown, selectedContractor) {
  try {
    const response = await fetch(`${BASE_URL}/contractors`);
    if (!response.ok) throw new Error("Failed to fetch contractors");

    const contractors = await response.json();
    dropdown.innerHTML = "<option value=''>Select Contractor</option>";
    contractors.forEach((contractor) => {
      const option = document.createElement("option");
      option.value = contractor.name;
      option.textContent = contractor.name;
      if (contractor.name === selectedContractor) option.selected = true;
      dropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error populating contractors:", error);
  }
}

// Save job
async function saveJob(jobId, row) {
  console.log("Saving job with ID:", jobId); // Debug log

  const updatedJob = {};
  row.querySelectorAll(".editable-field").forEach((field) => {
    const column = field.dataset.column;
    updatedJob[column] = field.value || null;
  });

  try {
    const response = await fetch(`${BASE_URL}/jobs/${jobId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedJob),
    });

    if (!response.ok) throw new Error("Failed to update job");

    alert("Job updated successfully");
    row.querySelector(".save-btn").style.display = "none";
  } catch (error) {
    console.error("Error updating job:", error);
    alert("Error updating job. Please try again.");
  }
}

// Delete job
async function deleteJob(jobId) {
  if (!confirm("Are you sure you want to delete this job?")) return;

  try {
    const response = await fetch(`${BASE_URL}/jobs/${jobId}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete job");

    alert("Job deleted successfully");
    fetchJobs();
  } catch (error) {
    console.error("Error deleting job:", error);
    alert("Error deleting job. Please try again.");
  }
}

// Filter jobs by status
document.getElementById("filter-btn").addEventListener("click", () => {
  const filterStatus = document.getElementById("filter-status").value;
  fetchJobs(filterStatus);
});

// Initialize fetching jobs on page load
document.addEventListener("DOMContentLoaded", () => {
  fetchJobs();
});

// Ensure BASE_URL is globally defined somewhere in your project
const BASE_URL = "http://localhost:5000"; // Uncomment if BASE_URL is not already globally defined

const contractorForm = document.getElementById("add-contractor-form");
const contractorTable = document.querySelector("#contractor-table tbody");

// Add Contractor
contractorForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("contractor-name").value.trim();
  const category = document.getElementById("contractor-category").value;
  const mobile = document.getElementById("contractor-phone").value.trim();

  try {
    const response = await fetch(`${BASE_URL}/contractors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, mobile }),
    });

    if (!response.ok) throw new Error("Failed to add contractor");

    alert("Contractor added successfully");
    contractorForm.reset();
    fetchContractors(); // Refresh the contractors list after adding a new one
  } catch (error) {
    console.error("Error adding contractor:", error);
    alert(error.message);
  }
});

// Fetch and display Contractors
async function fetchContractors() {
  try {
    const response = await fetch(`${BASE_URL}/contractors`);
    if (!response.ok) throw new Error("Failed to fetch contractors");

    const contractors = await response.json();

    if (!contractorTable) {
      console.error("Contractor table element not found");
      return;
    }

    if (contractors.length === 0) {
      contractorTable.innerHTML =
        "<tr><td colspan='5'>No contractors found</td></tr>";
      return;
    }

    // Populate contractors table
    contractorTable.innerHTML = contractors
      .map(
        (contractor) => `
          <tr>
            <td>${contractor.id}</td>
            <td>${contractor.name}</td>
            <td>${contractor.category}</td>
            <td>${contractor.mobile}</td>
            <td>
              <button class="delete-btn" onclick="deleteContractor(${contractor.id})">Delete</button>
            </td>
          </tr>`
      )
      .join("");
  } catch (error) {
    console.error("Error fetching contractors:", error);
    alert("Error fetching contractors. Please try again.");
  }
}

// Delete Contractor
async function deleteContractor(id) {
  // Confirm before deleting
  const userConfirmed = confirm(
    "Are you sure you want to delete this contractor?"
  );
  if (!userConfirmed) return;

  try {
    // Make DELETE request to backend
    const response = await fetch(`${BASE_URL}/contractors/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json(); // Extract error details from response
      throw new Error(errorData.error || "Failed to delete contractor");
    }

    alert("Contractor deleted successfully");
    await fetchContractors(); // Refresh the contractor list
  } catch (error) {
    console.error("Error deleting contractor:", error);
    alert(`Error deleting contractor: ${error.message}`);
  }
}

// Initialize contractor fetching on page load
if (contractorTable) fetchContractors();

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Brown Girls Creative Studio | Partner & Pipeline Manager</title>
    <script src="https://cdn.jsdelivr.net/npm/lucide@latest/dist/umd/lucide.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        studio: {
                            50: '#fdf4f6',
                            100: '#fbe8ee',
                            500: '#e11d48',
                            600: '#be123c',
                            900: '#881337',
                        }
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen font-sans antialiased">

    <!-- Top Navigation Bar -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <div class="h-10 w-10 rounded-xl bg-studio-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    BG
                </div>
                <div>
                    <h1 class="font-bold text-slate-900 text-base leading-tight">The Brown Girls Creative Studio</h1>
                    <p class="text-xs text-slate-500 font-medium">Internal Operations & Pipeline Manager</p>
                </div>
            </div>
            <div class="flex items-center space-x-3">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span class="w-2 h-2 mr-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    Live Vercel Backend
                </span>
                <button onclick="exportCSV()" class="inline-flex items-center px-3.5 py-2 border border-slate-300 shadow-sm text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition">
                    <i data-lucide="download" class="w-3.5 h-3.5 mr-1.5"></i> Export CSV
                </button>
            </div>
        </div>
    </header>

    <!-- Main Content Container -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <!-- KPI Metric Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Active Targets</p>
                        <h3 id="stat-total" class="text-3xl font-ext500 font-bold text-slate-900 mt-1">5</h3>
                    </div>
                    <div class="p-2.5 bg-studio-50 text-studio-600 rounded-xl">
                        <i data-lucide="target" class="w-5 h-5"></i>
                    </div>
                </div>
                <div class="mt-3 flex items-center text-xs text-emerald-600 font-medium">
                    <i data-lucide="arrow-up-right" class="w-3.5 h-3.5 mr-1"></i> Pipeline active & growing
                </div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirmed Contracts</p>
                        <h3 id="stat-confirmed" class="text-3xl font-ext500 font-bold text-slate-900 mt-1">1</h3>
                    </div>
                    <div class="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <i data-lucide="check-circle-2" class="w-5 h-5"></i>
                    </div>
                </div>
                <div class="mt-3 flex items-center text-xs text-indigo-600 font-medium">
                    InspiHER Dec 2-3 Locked
                </div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outreach Queue</p>
                        <h3 id="stat-queue" class="text-3xl font-ext500 font-bold text-slate-900 mt-1">3</h3>
                    </div>
                    <div class="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                        <i data-lucide="clock" class="w-5 h-5"></i>
                    </div>
                </div>
                <div class="mt-3 flex items-center text-xs text-amber-600 font-medium">
                    NCSA, District & YES Program
                </div>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Proven Impact</p>
                        <h3 class="text-3xl font-ext500 font-bold text-slate-900 mt-1">96%</h3>
                    </div>
                    <div class="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                        <i data-lucide="sparkles" class="w-5 h-5"></i>
                    </div>
                </div>
                <div class="mt-3 flex items-center text-xs text-rose-600 font-medium">
                    100 Students Engaged at NCSA
                </div>
            </div>
        </div>

        <!-- Action Bar & Add Button -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-lg font-bold text-slate-900">Partnership & Pipeline Control Center</h2>
                    <p class="text-xs text-slate-500">Manage school districts, after-school cohorts, and conference vendor workflows.</p>
                </div>
                <button onclick="openModal()" class="inline-flex items-center px-4 py-2.5 border border-transparent text-xs font-semibold rounded-xl text-white bg-studio-600 hover:bg-studio-700 shadow-sm transition">
                    <i data-lucide="plus" class="w-4 h-4 mr-1.5"></i> Add New Target
                </button>
            </div>

            <!-- Pipeline Table -->
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <th class="py-3.5 px-6">Stage</th>
                            <th class="py-3.5 px-6">Organization / Partner</th>
                            <th class="py-3.5 px-6">Contact Person</th>
                            <th class="py-3.5 px-6">Goal / Scope</th>
                            <th class="py-3.5 px-6">Status</th>
                            <th class="py-3.5 px-6">Next Action</th>
                            <th class="py-3.5 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="pipeline-table-body" class="divide-y divide-slate-100 text-sm">
                        <!-- Populated by JavaScript -->
                    </tbody>
                </table>
            </div>
        </div>

    </main>

    <!-- Add/Edit Modal -->
    <div id="leadModal" class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 id="modalTitle" class="text-lg font-bold text-slate-900">Add New Partnership Target</h3>
                <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form id="leadForm" onsubmit="saveLead(event)" class="p-6 space-y-4">
                <input type="hidden" id="leadId">
                <div>
                    <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Pipeline Stage</label>
                    <select id="leadStage" class="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-studio-500">
                        <option value="Confirmed Contract">Confirmed Contract</option>
                        <option value="Prospecting / Pilot">Prospecting / Pilot</option>
                        <option value="District Expansion">District Expansion</option>
                        <option value="Community Partner">Community Partner</option>
                        <option value="Private Market">Private Market</option>
                    </select>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Organization / Partner</label>
                        <input type="text" id="leadOrg" required placeholder="e.g. Newton District" class="w-full rounded-xl border border-slate-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-studio-500">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Contact Person</label>
                        <input type="text" id="leadContact" required placeholder="e.g. Dr. Williams" class="w-full rounded-xl border border-slate-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-studio-500">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Goal / Scope</label>
                    <input type="text" id="leadScope" required placeholder="e.g. 2-day workshop @ $750" class="w-full rounded-xl border border-slate-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-studio-500">
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Status</label>
                        <select id="leadStatus" class="w-full rounded-xl border border-slate-300 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-studio-500">
                            <option value="W-9 & CP575 Submitted">W-9 & CP575 Submitted</option>
                            <option value="Outreach Queued">Outreach Queued</option>
                            <option value="In Discussion">In Discussion</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Not Started">Not Started</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Next Action</label>
                        <input type="text" id="leadAction" required placeholder="e.g. Follow up Nov 1" class="w-full rounded-xl border border-slate-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-studio-500">
                    </div>
                </div>
                <div class="pt-4 flex justify-end space-x-3">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-studio-600 text-white rounded-xl text-xs font-semibold hover:bg-studio-700 shadow-sm">Save Target</button>
                </div>
            </form>
        </div>
    </div>

    <!-- JavaScript Application Logic -->
    <script>
        // Initialize Lucide Icons
        lucide.createIcons();

        // Initial Pipeline Data State
        let pipelineData = [
            {
                id: 1,
                stage: "Confirmed Contract",
                org: "InspiHER Conference / Newton District",
                contact: "Dr. Jennifer Williams",
                scope: "2-day non-tech leadership workshop (Dec 2-3, 2026) @ $750 rate",
                status: "W-9 & CP575 Submitted",
                action: "Connect early Nov to review schedule & ACH direct deposit setup"
            },
            {
                id: 2,
                stage: "Prospecting / Pilot",
                org: "Newton County STEAM Academy",
                contact: "Ms. Bunting",
                scope: "1-hour follow-up student session & December 4-week AI Lab cohort",
                status: "Outreach Queued",
                action: "Send follow-up email to schedule 1-hour student session"
            },
            {
                id: 3,
                stage: "District Expansion",
                org: "Newton County District After-School",
                contact: "District After-School Coordinator",
                scope: "Turnkey after-school AI & tech enrichment program rollout",
                status: "Outreach Queued",
                action: "Submit enrichment proposal referencing NCSA 96% satisfaction / 100 students"
            },
            {
                id: 4,
                stage: "Community Partner",
                org: "YES Program",
                contact: "Program Director",
                scope: "Parent-pay or grant-funded cohorts with a revenue-share donation back",
                status: "Outreach Queued",
                action: "Send partnership pitch email proposing turnkey execution and giveback model"
            },
            {
                id: 5,
                stage: "Private Market",
                org: "Private Schools (Regional)",
                contact: "Admissions / Program Director",
                scope: "Premium after-school tech and applied AI enrichment contracts",
                status: "Not Started",
                action: "Identify target private schools and draft introductory outreach"
            }
        ];

        function renderTable() {
            const tbody = document.getElementById('pipeline-table-body');
            tbody.innerHTML = '';

            document.getElementById('stat-total').innerText = pipelineData.length;
            const confirmedCount = pipelineData.filter(d => d.stage === 'Confirmed Contract').length;
            document.getElementById('stat-confirmed').innerText = confirmedCount;
            const queueCount = pipelineData.filter(d => d.status === 'Outreach Queued').length;
            document.getElementById('stat-queue').innerText = queueCount;

            pipelineData.forEach((item) => {
                let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
                if(item.stage === 'Confirmed Contract') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if(item.stage === 'Prospecting / Pilot') badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                if(item.stage === 'District Expansion') badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                if(item.stage === 'Community Partner') badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';

                let row = `
                    <tr class="hover:bg-slate-50/50 transition">
                        <td class="py-4 px-6 font-medium">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${badgeColor}">
                                ${item.stage}
                            </span>
                        </td>
                        <td class="py-4 px-6 font-semibold text-slate-900">${item.org}</td>
                        <td class="py-4 px-6 text-slate-600">${item.contact}</td>
                        <td class="py-4 px-6 text-slate-600 text-xs">${item.scope}</td>
                        <td class="py-4 px-6">
                            <span class="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                                ${item.status}
                            </span>
                        </td>
                        <td class="py-4 px-6 text-slate-600 text-xs">${item.action}</td>
                        <td class="py-4 px-6 text-right space-x-2">
                            <button onclick="editLead(${item.id})" class="text-slate-400 hover:text-slate-600 transition"><i data-lucide="edit-2" class="w-4 h-4 inline"></i></button>
                            <button onclick="deleteLead(${item.id})" class="text-slate-400 hover:text-rose-600 transition"><i data-lucide="trash-2" class="w-4 h-4 inline"></i></button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
            lucide.createIcons();
        }

        function openModal(id = null) {
            document.getElementById('leadModal').classList.remove('hidden');
            if(id) {
                document.getElementById('modalTitle').innerText = 'Edit Partnership Target';
                const lead = pipelineData.find(l => l.id === id);
                document.getElementById('leadId').value = lead.id;
                document.getElementById('leadStage').value = lead.stage;
                document.getElementById('leadOrg').value = lead.org;
                document.getElementById('leadContact').value = lead.contact;
                document.getElementById('leadScope').value = lead.scope;
                document.getElementById('leadStatus').value = lead.status;
                document.getElementById('leadAction').value = lead.action;
            } else {
                document.getElementById('modalTitle').innerText = 'Add New Partnership Target';
                document.getElementById('leadForm').reset();
                document.getElementById('leadId').value = '';
            }
        }

        function closeModal() {
            document.getElementById('leadModal').classList.add('hidden');
        }

        function saveLead(event) {
            event.preventDefault();
            const id = document.getElementById('leadId').value;
            const newData = {
                id: id ? parseInt(id) : Date.now(),
                stage: document.getElementById('leadStage').value,
                org: document.getElementById('leadOrg').value,
                contact: document.getElementById('leadContact').value,
                scope: document.getElementById('leadScope').value,
                status: document.getElementById('leadStatus').value,
                action: document.getElementById('leadAction').value
            };

            if(id) {
                const index = pipelineData.findIndex(l => l.id === parseInt(id));
                pipelineData[index] = newData;
            } else {
                pipelineData.push(newData);
            }

            closeModal();
            renderTable();
        }

        function editLead(id) {
            openModal(id);
        }

        function deleteLead(id) {
            if(confirm('Are you sure you want to remove this target from your pipeline?')) {
                pipelineData = pipelineData.filter(l => l.id !== id);
                renderTable();
            }
        }

        function exportCSV() {
            let csv = 'Stage,Organization / Partner,Contact Person,Goal / Scope,Status,Next Action / Follow-Up\n';
            pipelineData.forEach(d => {
                csv += `"${d.stage}","${d.org}","${d.contact}","${d.scope}","${d.status}","${d.action}"\n`;
            });
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.setAttribute('href', url);
            a.setAttribute('download', 'brown_girls_studio_pipeline.csv');
            a.style.visibility = 'hidden';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        // Initial render
        renderTable();
    </script>
</body>
</html>

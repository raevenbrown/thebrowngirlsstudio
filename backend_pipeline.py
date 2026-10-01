<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Creative Metrix | Partner & Pipeline Manager</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        dark: {
                            900: '#0a0a0c',
                            800: '#121316',
                            700: '#1a1b20',
                            600: '#262831',
                            500: '#3f4250'
                        },
                        accent: {
                            rose: '#f43f5e',
                            purple: '#8b5cf6',
                            emerald: '#10b981'
                        }
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-dark-900 text-slate-100 min-h-screen font-sans flex antialiased">

    <!-- Sidebar Navigation -->
    <aside class="w-64 bg-dark-800 border-r border-dark-600 flex flex-col justify-between hidden md:flex sticky top-0 h-screen z-20">
        <div>
            <!-- Studio Branding -->
            <div class="p-6 border-b border-dark-600 flex items-center space-x-3">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
                    CM
                </div>
                <div>
                    <h1 class="font-bold text-sm tracking-wide text-slate-100">Creative Metrix</h1>
                    <p class="text-xs text-slate-400">The Brown Girls Creative Studio</p>
                </div>
            </div>

            <!-- Nav Links -->
            <nav class="p-4 space-y-1.5 text-xs font-medium">
                <a href="#" class="flex items-center px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-dark-700 transition">
                    <i data-lucide="layout-dashboard" class="w-4 h-4 mr-3"></i> Analytics Overview
                </a>
                <a href="#" class="flex items-center px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-dark-700 transition">
                    <i data-lucide="globe" class="w-4 h-4 mr-3"></i> Website Performance
                </a>
                <a href="#" class="flex items-center px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-dark-700 transition">
                    <i data-lucide="mail" class="w-4 h-4 mr-3"></i> Email Marketing
                </a>
                <a href="#" class="flex items-center px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-dark-700 transition">
                    <i data-lucide="share-2" class="w-4 h-4 mr-3"></i> Social Media
                </a>
                <a href="#" class="flex items-center px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-dark-700 transition">
                    <i data-lucide="dollar-sign" class="w-4 h-4 mr-3"></i> Revenue & Sales
                </a>
                <a href="#" class="flex items-center px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-dark-700 transition">
                    <i data-lucide="workflow" class="w-4 h-4 mr-3"></i> Campaign Tracking
                </a>
                <a href="#" class="flex items-center px-3.5 py-2.5 rounded-xl text-white bg-dark-700 border border-dark-600 shadow-sm transition">
                    <i data-lucide="puzzle" class="w-4 h-4 mr-3 text-rose-500"></i> Integrations & Pipeline
                </a>
            </nav>
        </div>

        <!-- User Profile Footer -->
        <div class="p-4 border-t border-dark-600 flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full bg-rose-600/20 text-rose-500 font-bold flex items-center justify-center text-xs">
                    RB
                </div>
                <div>
                    <p class="text-xs font-bold text-slate-200">Raeven Brown</p>
                    <p class="text-[10px] text-slate-400">creativemetrixbgcs@...</p>
                </div>
            </div>
        </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col min-h-screen">
        
        <!-- Top Header -->
        <header class="h-16 border-b border-dark-600 bg-dark-800/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
            <div class="flex items-center space-x-3">
                <span class="text-slate-400 text-sm">Creative Metrix</span>
                <span class="text-dark-500">/</span>
                <span class="font-bold text-sm text-slate-200">Partnership Pipeline & Integrations</span>
            </div>
            <div class="flex items-center space-x-3">
                <button onclick="exportCSV()" class="px-3.5 py-2 rounded-xl bg-dark-700 hover:bg-dark-600 text-xs font-semibold text-slate-300 border border-dark-600 transition flex items-center shadow-sm">
                    <i data-lucide="download" class="w-3.5 h-3.5 mr-2"></i> Export Pipeline CSV
                </button>
                <button onclick="openModal()" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-lg shadow-rose-600/20 transition flex items-center">
                    <i data-lucide="plus" class="w-3.5 h-3.5 mr-2"></i> Add New Target
                </button>
            </div>
        </header>

        <!-- Content Body -->
        <div class="p-8 space-y-8 max-w-7xl mx-auto w-full">

            <!-- KPI Metric Cards Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div class="bg-dark-800 border border-dark-600 p-6 rounded-2xl relative overflow-hidden shadow-sm">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Studio Targets</p>
                            <h3 id="stat-total" class="text-3xl font-ext500 font-bold text-slate-100 mt-2">5</h3>
                        </div>
                        <div class="p-3 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20">
                            <i data-lucide="target" class="w-5 h-5"></i>
                        </div>
                    </div>
                    <div class="mt-4 flex items-center text-xs text-emerald-400 font-medium">
                        <i data-lucide="arrow-up-right" class="w-3.5 h-3.5 mr-1"></i> Pipeline active & scaling
                    </div>
                </div>

                <div class="bg-dark-800 border border-dark-600 p-6 rounded-2xl relative overflow-hidden shadow-sm">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirmed Contracts</p>
                            <h3 id="stat-confirmed" class="text-3xl font-ext500 font-bold text-slate-100 mt-2">1</h3>
                        </div>
                        <div class="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                            <i data-lucide="check-circle-2" class="w-5 h-5"></i>
                        </div>
                    </div>
                    <div class="mt-4 flex items-center text-xs text-emerald-400 font-medium">
                        InspiHER Dec 2-3 Locked ($750)
                    </div>
                </div>

                <div class="bg-dark-800 border border-dark-600 p-6 rounded-2xl relative overflow-hidden shadow-sm">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Proven Impact</p>
                            <h3 class="text-3xl font-ext500 font-bold text-slate-100 mt-2">96%</h3>
                        </div>
                        <div class="p-3 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/20">
                            <i data-lucide="sparkles" class="w-5 h-5"></i>
                        </div>
                    </div>
                    <div class="mt-4 flex items-center text-xs text-purple-400 font-medium">
                        100 Students Engaged at NCSA
                    </div>
                </div>
            </div>

            <!-- Pipeline Table Section -->
            <div class="bg-dark-800 border border-dark-600 rounded-2xl shadow-sm overflow-hidden">
                <div class="p-6 border-b border-dark-600 flex justify-between items-center">
                    <div>
                        <h2 class="font-bold text-base text-slate-100">Partnership & Pipeline Control Center</h2>
                        <p class="text-xs text-slate-400 mt-0.5">Manage school district contracts, after-school cohorts, and conference integrations.</p>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-dark-700/50 border-b border-dark-600 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                <th class="py-3.5 px-6">Stage</th>
                                <th class="py-3.5 px-6">Organization / Partner</th>
                                <th class="py-3.5 px-6">Contact Person</th>
                                <th class="py-3.5 px-6">Goal / Scope</th>
                                <th class="py-3.5 px-6">Status</th>
                                <th class="py-3.5 px-6">Next Action</th>
                                <th class="py-3.5 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="pipeline-table-body" class="divide-y divide-dark-600 text-xs">
                            <!-- Populated dynamically via JS -->
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </main>

    <!-- Modal Form -->
    <div id="leadModal" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm hidden flex items-center justify-center p-4">
        <div class="bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div class="p-6 border-b border-dark-600 flex justify-between items-center">
                <h3 id="modalTitle" class="font-bold text-slate-100 text-sm">Add New Partnership Target</h3>
                <button onclick="closeModal()" class="text-slate-400 hover:text-slate-200">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form id="leadForm" onsubmit="saveLead(event)" class="p-6 space-y-4 text-xs">
                <input type="hidden" id="leadId">
                <div>
                    <label class="block font-bold text-slate-400 uppercase tracking-wider mb-1">Pipeline Stage</label>
                    <select id="leadStage" class="w-full rounded-xl bg-dark-700 border border-dark-600 py-2.5 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500">
                        <option value="Confirmed Contract">Confirmed Contract</option>
                        <option value="Prospecting / Pilot">Prospecting / Pilot</option>
                        <option value="District Expansion">District Expansion</option>
                        <option value="Community Partner">Community Partner</option>
                        <option value="Private Market">Private Market</option>
                    </select>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block font-bold text-slate-400 uppercase tracking-wider mb-1">Organization / Partner</label>
                        <input type="text" id="leadOrg" required placeholder="e.g. Newton District" class="w-full rounded-xl bg-dark-700 border border-dark-600 py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500">
                    </div>
                    <div>
                        <label class="block font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Person</label>
                        <input type="text" id="leadContact" required placeholder="e.g. Dr. Williams" class="w-full rounded-xl bg-dark-700 border border-dark-600 py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500">
                    </div>
                </div>
                <div>
                    <label class="block font-bold text-slate-400 uppercase tracking-wider mb-1">Goal / Scope</label>
                    <input type="text" id="leadScope" required placeholder="e.g. 2-day workshop @ $750" class="w-full rounded-xl bg-dark-700 border border-dark-600 py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500">
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                        <select id="leadStatus" class="w-full rounded-xl bg-dark-700 border border-dark-600 py-2.5 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500">
                            <option value="W-9 & CP575 Submitted">W-9 & CP575 Submitted</option>
                            <option value="Outreach Queued">Outreach Queued</option>
                            <option value="In Discussion">In Discussion</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Not Started">Not Started</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-bold text-slate-400 uppercase tracking-wider mb-1">Next Action</label>
                        <input type="text" id="leadAction" required placeholder="e.g. Follow up Nov 1" class="w-full rounded-xl bg-dark-700 border border-dark-600 py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500">
                    </div>
                </div>
                <div class="pt-4 flex justify-end space-x-3">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 border border-dark-600 rounded-xl font-semibold text-slate-300 hover:bg-dark-700">Cancel</button>
                    <button type="submit" class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold shadow-md">Save Target</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Application Script -->
    <script>
        lucide.createIcons();

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

            pipelineData.forEach((item) => {
                let badgeColor = 'bg-dark-700 text-slate-300 border-dark-600';
                if(item.stage === 'Confirmed Contract') badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                if(item.stage === 'Prospecting / Pilot') badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                if(item.stage === 'District Expansion') badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                if(item.stage === 'Community Partner') badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';

                let row = `
                    <tr class="hover:bg-dark-700/30 transition">
                        <td class="py-4 px-6 font-medium">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${badgeColor}">
                                ${item.stage}
                            </span>
                        </td>
                        <td class="py-4 px-6 font-bold text-slate-100">${item.org}</td>
                        <td class="py-4 px-6 text-slate-300">${item.contact}</td>
                        <td class="py-4 px-6 text-slate-400 text-[11px]">${item.scope}</td>
                        <td class="py-4 px-6">
                            <span class="text-[11px] font-semibold text-slate-300 bg-dark-700 border border-dark-600 px-2.5 py-1 rounded-md">
                                ${item.status}
                            </span>
                        </td>
                        <td class="py-4 px-6 text-slate-400 text-[11px]">${item.action}</td>
                        <td class="py-4 px-6 text-right space-x-2">
                            <button onclick="editLead(${item.id})" class="text-slate-400 hover:text-slate-200 transition"><i data-lucide="edit-2" class="w-3.5 h-3.5 inline"></i></button>
                            <button onclick="deleteLead(${item.id})" class="text-slate-400 hover:text-rose-400 transition"><i data-lucide="trash-2" class="w-3.5 h-3.5 inline"></i></button>
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
            a.setAttribute('download', 'creative_metrix_pipeline.csv');
            a.style.visibility = 'hidden';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        renderTable();
    </script>
</body>
</html>

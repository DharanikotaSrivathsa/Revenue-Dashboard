const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Replace header button with sidebar toggle
html = html.replace(
  '<header class="h-16 bg-white border-b border-slate-200/90 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">\n      <div class="flex items-center gap-2 text-xs">',
  `<header class="h-16 bg-white border-b border-slate-200/90 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      <div class="flex items-center gap-3 text-xs">
        <button onclick="toggleSidebar()" class="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/90" title="Toggle Sidebar (Ctrl+B)">
          ☰
        </button>`
);

// 2. Replace query filter strip and empty-state
const queryStart = html.indexOf('<!-- Query Filter Console Strip -->');
const dashStart = html.indexOf('<!-- State 2: Active Dashboard Content -->');

if (queryStart !== -1 && dashStart !== -1) {
  const replacement = `<!-- Doccure Search Console -->
      <div id="doccure-search-container" class="w-full space-y-4 mb-6">
        <!-- Search Pill Form -->
        <form onsubmit="event.preventDefault(); applyFilters();" class="bg-white rounded-2xl p-2.5 shadow-md shadow-slate-200/50 border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center gap-2 text-slate-800">
          <!-- Location -->
          <div class="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl md:w-48 border border-slate-200/60">
            <span class="text-cyan-600 text-sm">📍</span>
            <div class="min-w-0 flex-1">
              <span class="block text-[8px] font-bold uppercase tracking-wider text-slate-400">Location</span>
              <select id="facility" class="w-full text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer truncate">
                <option value="All">All Facilities (3)</option>
                <option>Central Hospital</option>
                <option>North Clinic</option>
                <option>South Clinic</option>
              </select>
            </div>
          </div>

          <!-- Specialty -->
          <div class="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl md:w-52 border border-slate-200/60">
            <span class="text-blue-600 text-sm">🩺</span>
            <div class="min-w-0 flex-1">
              <span class="block text-[8px] font-bold uppercase tracking-wider text-slate-400">Specialty</span>
              <select id="dept" class="w-full text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer truncate">
                <option value="All">All Specialties (5)</option>
                <option>General Medicine</option>
                <option>Cardiology</option>
                <option>Orthopedics</option>
                <option>Gynecology</option>
                <option>Dermatology</option>
              </select>
            </div>
          </div>

          <!-- Keyword Search -->
          <div class="flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 rounded-xl flex-1 border border-slate-200/60">
            <span class="text-slate-400 text-sm">🔍</span>
            <input type="text" id="keyword" placeholder="Search clinician, patient, procedure..." class="w-full text-xs font-semibold text-slate-900 bg-transparent placeholder-slate-400 outline-none">
          </div>

          <!-- Filters Toggle -->
          <button type="button" onclick="toggleMoreFilters()" class="px-3 py-2 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-xl flex items-center gap-1.5 cursor-pointer">
            <span>⚙️ Filters</span>
          </button>

          <!-- Search CTA -->
          <button type="submit" class="px-5 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5 cursor-pointer">
            <span>🔍 Search Analytics</span>
          </button>

          <!-- Reset -->
          <button type="button" onclick="resetFilters()" class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer" title="Reset search">
            ↺
          </button>
        </form>

        <!-- More Filters Expandable Panel -->
        <div id="more-filters-panel" class="hidden bg-white p-4 rounded-2xl border border-slate-200 shadow-md grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
            <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Physician</label>
            <select id="doctor" class="w-full text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer">
              <option value="All">All Doctors (6)</option>
            </select>
          </div>
          <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
            <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Settlement Status</label>
            <select id="pay" class="w-full text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer">
              <option value="All">All Payment Types</option>
              <option value="Paid">Paid in Full</option>
              <option value="Partial">Partial Settlement</option>
              <option value="Unpaid">Unpaid / Outstanding</option>
            </select>
          </div>
          <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
            <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">From Date</label>
            <input type="date" id="from" value="2026-10-01" class="w-full text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer">
          </div>
          <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
            <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">To Date</label>
            <input type="date" id="to" value="2026-10-29" class="w-full text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer">
          </div>
        </div>
      </div>

      <!-- State 1: Doccure Hero & Empty Showcase (HIDDEN after search) -->
      <div id="empty-state" class="space-y-6 my-4">
        <!-- Hero Banner -->
        <div class="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-blue-500/15 border border-blue-400/30 text-center space-y-4">
          <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-xs">
            ✨ Doccure-Powered Healthcare & Clinical Search
          </div>
          <h2 class="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Discover Doctors & Practice Intelligence
          </h2>
          <p class="text-xs sm:text-sm text-blue-100 max-w-2xl mx-auto font-medium leading-relaxed">
            Search by clinician name, medical specialty, hospital branch, or clinical keyword.
            Click <strong class="text-white underline">Search Analytics</strong> or any clinician below to compute live performance data.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button onclick="quickFilterDept('General Medicine')" class="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 cursor-pointer">🩺 General Medicine</button>
            <button onclick="quickFilterDept('Cardiology')" class="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 cursor-pointer">❤️ Cardiology</button>
            <button onclick="quickFilterDept('Orthopedics')" class="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 cursor-pointer">🦴 Orthopedics</button>
            <button onclick="quickFilterDept('Gynecology')" class="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 cursor-pointer">🌸 Gynecology</button>
            <button onclick="quickFilterDept('Dermatology')" class="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 cursor-pointer">✨ Dermatology</button>
          </div>
        </div>

        <!-- Featured Specialist Cards Grid -->
        <div class="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h3 class="text-base font-extrabold text-slate-900">Featured Medical Specialists</h3>
              <p class="text-xs text-slate-500">Select any clinician to load their practice scorecard & non-revenue analytics</p>
            </div>
            <button onclick="applyFilters()" class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer">
              ⚡ Load All Specialists (6)
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="featured-docs-grid"></div>
        </div>
      </div>\n\n      `;
  html = html.slice(0, queryStart) + replacement + html.slice(dashStart);
}

// 3. Add script helpers
const scriptInsertPoint = html.indexOf('document.getElementById("doctor").innerHTML += docs.map');
if (scriptInsertPoint !== -1) {
  const scriptContent = `
    let isSidebarCollapsed = false;
    function toggleSidebar() {
      isSidebarCollapsed = !isSidebarCollapsed;
      const sb = document.getElementById('main-sidebar');
      const mc = sb.nextElementSibling;
      if (isSidebarCollapsed) {
        sb.classList.remove('w-64');
        sb.classList.add('w-20');
        mc.classList.remove('pl-64');
        mc.classList.add('pl-20');
        document.querySelectorAll('.sidebar-text').forEach(el => el.classList.add('hidden'));
      } else {
        sb.classList.remove('w-20');
        sb.classList.add('w-64');
        mc.classList.remove('pl-20');
        mc.classList.add('pl-64');
        document.querySelectorAll('.sidebar-text').forEach(el => el.classList.remove('hidden'));
      }
    }

    function toggleMoreFilters() {
      const p = document.getElementById('more-filters-panel');
      p.classList.toggle('hidden');
    }

    function quickFilterDept(deptName) {
      document.getElementById('dept').value = deptName;
      applyFilters();
    }

    function renderFeaturedDocs() {
      const grid = document.getElementById('featured-docs-grid');
      if (!grid) return;
      grid.innerHTML = docs.map((d, i) => {
        const avatars = ['👩‍⚕️', '👨‍⚕️', '👩‍⚕️', '👨‍⚕️', '👩‍⚕️', '👨‍⚕️'];
        return '<div class="p-4 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-cyan-400 hover:shadow-lg transition-all flex items-start gap-3.5 group">' +
          '<div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-100 to-blue-100 border border-cyan-200 flex items-center justify-center text-2xl flex-shrink-0">' +
            avatars[i % avatars.length] +
          '</div>' +
          '<div class="min-w-0 flex-1">' +
            '<div class="flex items-center gap-1.5">' +
              '<h4 class="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">' + d[0] + '</h4>' +
              '<span class="text-cyan-500 text-xs font-bold" title="Verified Specialist">✓</span>' +
            '</div>' +
            '<p class="text-xs font-semibold text-blue-600 truncate">' + d[1] + '</p>' +
            '<div class="flex items-center gap-2 text-[11px] text-slate-500 mt-1">' +
              '<span class="text-amber-500 font-bold">★ 4.9</span>' +
              '<span>•</span>' +
              '<span>' + d[2] + '</span>' +
            '</div>' +
            '<button onclick="selectDoctorFilter(\'' + d[0] + '\')" class="mt-3 w-full py-1.5 text-xs font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg transition-colors cursor-pointer">' +
              'Analyze Clinician →' +
            '</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function selectDoctorFilter(name) {
      document.getElementById('doctor').value = name;
      applyFilters();
    }
  `;
  html = html.slice(0, scriptInsertPoint) + scriptContent + '\n    ' + html.slice(scriptInsertPoint);
}

// 4. Update initial load so it calls renderFeaturedDocs
html = html.replace('renderSection();', 'renderFeaturedDocs(); // waiting for user search');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated index.html with Doccure features!');

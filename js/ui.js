// ===== PYO_DLT UI MODULE =====

// Toast notification
function showToast(msg, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const icons = {
        success: `<svg viewBox="0 0 20 20" fill="currentColor" style="width:18px;height:18px;color:#22c55e"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>`,
        error: `<svg viewBox="0 0 20 20" fill="currentColor" style="width:18px;height:18px;color:#ef4444"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
        warning: `<svg viewBox="0 0 20 20" fill="currentColor" style="width:18px;height:18px;color:#f59e0b"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
        info: `<svg viewBox="0 0 20 20" fill="currentColor" style="width:18px;height:18px;color:#3b82f6"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`
    };
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : type === 'warning' ? 'warning' : type === 'info' ? 'info' : ''}`;
    toast.innerHTML = `${icons[type] || icons.info} <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Format date
function formatDate(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Setup sidebar user info & logout
function setupSidebar() {
    const session = AUTH.getCurrentUser();
    if (!session) return;

    const avatarEl = document.getElementById('sidebar-avatar');
    const nameEl = document.getElementById('sidebar-name');
    const roleEl = document.getElementById('sidebar-role');

    if (avatarEl) avatarEl.textContent = session.fullname ? session.fullname.charAt(0) : session.username.charAt(0);
    if (nameEl) nameEl.textContent = session.fullname || session.username;
    if (roleEl) roleEl.textContent = session.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน';

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => AUTH.logout());

    // Mobile sidebar toggle
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            if (overlay) overlay.classList.toggle('active');
        });
    }
    if (overlay) {
        overlay.addEventListener('click', () => {
            if (sidebar) sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
}

// Status badge HTML
function statusBadge(status) {
    const info = DATA.getStatusInfo(status);
    return `<span class="badge ${info.badge}">${info.label}</span>`;
}

// Condition badge HTML
function conditionBadge(condition) {
    const info = DATA.getConditionInfo(condition);
    return `<span class="badge ${info.badge}">${info.label}</span>`;
}

// Image to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Setup image upload area
function setupImageUpload(areaId, previewId, onImages) {
    const area = document.getElementById(areaId);
    const fileInput = area ? area.querySelector('input[type=file]') : null;
    let images = [];

    if (!area) return { getImages: () => images };

    const renderPreview = () => {
        const prev = document.getElementById(previewId);
        if (!prev) return;
        prev.innerHTML = images.map((src, i) => `
      <div class="img-preview-item">
        <img src="${src}" alt="img">
        <div class="remove-img" onclick="removeImg(${i})">×</div>
      </div>
    `).join('');
        // Attach click handlers to open image viewer
        Array.from(prev.querySelectorAll('img')).forEach(img => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', (e) => openImageFromElement(e.target));
        });
    };

    window.removeImg = (idx) => {
        images.splice(idx, 1);
        renderPreview();
        if (onImages) onImages(images);
    };

    if (fileInput) {
        fileInput.addEventListener('change', async(e) => {
            for (const file of e.target.files) {
                const b64 = await fileToBase64(file);
                images.push(b64);
            }
            renderPreview();
            if (onImages) onImages(images);
        });
    }

    area.addEventListener('dragover', (e) => { e.preventDefault();
        area.classList.add('drag-over'); });
    area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
    area.addEventListener('drop', async(e) => {
        e.preventDefault();
        area.classList.remove('drag-over');
        for (const file of e.dataTransfer.files) {
            if (file.type.startsWith('image/')) {
                const b64 = await fileToBase64(file);
                images.push(b64);
            }
        }
        renderPreview();
        if (onImages) onImages(images);
    });

    return {
        getImages: () => images,
        setImages: (imgs) => { images = imgs || [];
            renderPreview(); }
    };
}

// Build device form HTML
function buildDeviceFormHTML(device) {
    const d = device || {};
    const brandsOptions = DATA.BRANDS.map(b =>
        `<option value="${b}" ${d.brand === b ? 'selected' : ''}>${b}</option>`
    ).join('');
    const roomOptions = DATA.ROOMS.map(r =>
        `<option value="${r.id}" ${d.room === r.id ? 'selected' : ''}>${r.icon} ${r.name}</option>`
    ).join('');
    const statusOptions = DATA.STATUSES.map(s =>
        `<option value="${s.value}" ${d.status === s.value ? 'selected' : ''}>${s.label}</option>`
    ).join('');
    const conditionOptions = DATA.CONDITIONS.map(c =>
        `<option value="${c.value}" ${d.condition === c.value ? 'selected' : ''}>${c.label}</option>`
    ).join('');

    return `
    <div class="form-grid">
      <div class="form-group full">
        <label>ชื่อผู้ใช้งาน</label>
        <input id="f-username" class="form-control" type="text" placeholder="ชื่อ-นามสกุล ผู้ใช้งาน" value="${d.username || ''}">
      </div>
      <div class="form-group">
        <label>ยี่ห้อ / รุ่น</label>
        <select id="f-brand" class="form-control">${brandsOptions}</select>
      </div>
      <div class="form-group">
        <label>หมายเลขเครื่อง (S/N)</label>
        <input id="f-serial" class="form-control" type="text" placeholder="เช่น CZC1234567" value="${d.serial || ''}">
      </div>
      <div class="form-group">
        <label>หมายเลขจอ (Monitor S/N)</label>
        <input id="f-monitor" class="form-control" type="text" placeholder="เช่น MN2024001" value="${d.monitorSN || ''}">
      </div>
      <div class="form-group">
        <label>IP Address</label>
        <input id="f-ip" class="form-control" type="text" placeholder="เช่น 192.168.1.100" value="${d.ip || ''}">
      </div>
      <div class="form-group">
        <label>ห้อง / ฝ่าย</label>
        <select id="f-room" class="form-control">${roomOptions}</select>
      </div>
      <div class="form-group">
        <label>สถานะ</label>
        <select id="f-status" class="form-control">${statusOptions}</select>
      </div>
      <div class="form-group">
        <label>สภาพ</label>
        <select id="f-condition" class="form-control">${conditionOptions}</select>
      </div>
      <div class="form-group full">
        <label>หมายเหตุ</label>
        <input id="f-note" class="form-control" type="text" placeholder="หมายเหตุเพิ่มเติม" value="${d.note || ''}">
      </div>
      <div class="form-group full">
        <label>รูปภาพ</label>
        <div class="upload-area" id="upload-area" onclick="document.getElementById('file-input').click()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 16l4-4 4 4 4-6 4 6M4 20h16M4 4h16v12H4z"/></svg>
          <p>ลากรูปภาพมาวาง หรือ <span>คลิกเพื่อเลือกไฟล์</span></p>
          <input type="file" id="file-input" multiple accept="image/*" hidden>
        </div>
        <div class="img-preview-grid" id="img-preview"></div>
      </div>
    </div>
  `;
}

// Collect form values
function collectDeviceForm() {
    return {
        username: document.getElementById('f-username') ? .value.trim(),
        brand: document.getElementById('f-brand') ? .value,
        serial: document.getElementById('f-serial') ? .value.trim(),
        monitorSN: document.getElementById('f-monitor') ? .value.trim(),
        ip: document.getElementById('f-ip') ? .value.trim(),
        room: document.getElementById('f-room') ? .value,
        status: document.getElementById('f-status') ? .value,
        condition: document.getElementById('f-condition') ? .value,
        note: document.getElementById('f-note') ? .value.trim(),
    };
}

// Generate sidebar nav HTML based on current page
function generateSidebarNav(activePage) {
    const pages = [
        { id: 'dashboard', href: 'dashboard.html', label: 'ภาพรวม', icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>` },
        { id: 'all-devices', href: 'all-devices.html', label: 'ครุภัณฑ์ทั้งหมด', icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 3H4a2 2 0 00-2 2v14a2 2 0 002 2h16a2 2 0 002-2V5a2 2 0 00-2-2zm-7 3h2v2h-2V6zm0 4h2v2h-2v-2zm-4-4h2v2H9V6zm0 4h2v2H9v-2zm-4 0h2v2H5v-2zm0-4h2v2H5V6zm14 12H5v-2h14v2zm0-4H5v-2h14v2zm0-4h-2v-2h2v2zm0-4h-2V6h2v2z"/></svg>` },
    ];
    const rooms = DATA.ROOMS.map(r => ({
        id: r.id,
        href: `room-${r.id}.html`,
        label: r.name,
        icon: `<span style="font-size:16px;line-height:1">${r.icon}</span>`
    }));
    const extras = [
        { id: 'info', href: 'info.html', label: 'ข้อมูล / ติดต่อ', icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>` },
    ];

    const makeItem = (item) => `
    <a href="${item.href}" class="nav-item ${activePage === item.id ? 'active' : ''}">
      ${item.icon} ${item.label}
    </a>`;

    return `
    ${pages.map(makeItem).join('')}
    <div class="nav-section-title">ห้อง / ฝ่าย</div>
    ${rooms.map(makeItem).join('')}
    <div class="nav-section-title">อื่นๆ</div>
    ${extras.map(makeItem).join('')}
  `;
}

// Confirm dialog
function confirmDialog(msg, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
    <div class="modal" style="max-width:420px">
      <div class="modal-header"><h3>ยืนยันการดำเนินการ</h3></div>
      <div class="modal-body"><p style="font-size:15px;color:var(--text-muted)">${msg}</p></div>
      <div class="modal-footer">
        <button class="btn btn-outline" id="confirm-cancel">ยกเลิก</button>
        <button class="btn btn-danger" id="confirm-ok">ยืนยัน</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);
    document.getElementById('confirm-cancel').onclick = () => overlay.remove();
    document.getElementById('confirm-ok').onclick = () => { overlay.remove();
        onConfirm(); };
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

// Image viewer: open clicked image and navigate within its grid
function openImageFromElement(imgEl) {
    if (!imgEl) return;
    const grid = imgEl.closest('.img-preview-grid');
    const imgs = grid ? Array.from(grid.querySelectorAll('img')).map(i => i.src) : [imgEl.src];
    let idx = imgs.indexOf(imgEl.src);

    const overlay = document.createElement('div');
    overlay.className = 'image-viewer-overlay';
    overlay.innerHTML = `
    <div class="viewer">
      <button class="iv-btn iv-prev">‹</button>
      <img class="iv-img" src="${imgs[idx]}">
      <button class="iv-btn iv-next">›</button>
      <button class="iv-btn iv-close">×</button>
    </div>
  `;
    document.body.appendChild(overlay);

    const imgNode = overlay.querySelector('.iv-img');
    const prevBtn = overlay.querySelector('.iv-prev');
    const nextBtn = overlay.querySelector('.iv-next');
    const closeBtn = overlay.querySelector('.iv-close');

    function render() { imgNode.src = imgs[idx]; }

    prevBtn.onclick = (e) => { e.stopPropagation();
        idx = (idx - 1 + imgs.length) % imgs.length;
        render(); };
    nextBtn.onclick = (e) => { e.stopPropagation();
        idx = (idx + 1) % imgs.length;
        render(); };
    closeBtn.onclick = removeOverlay;
    overlay.onclick = (e) => { if (e.target === overlay) removeOverlay(); };

    function onKey(e) {
        if (e.key === 'Escape') removeOverlay();
        if (e.key === 'ArrowLeft') { idx = (idx - 1 + imgs.length) % imgs.length;
            render(); }
        if (e.key === 'ArrowRight') { idx = (idx + 1) % imgs.length;
            render(); }
    }

    function removeOverlay() {
        document.removeEventListener('keydown', onKey);
        overlay.remove();
    }

    document.addEventListener('keydown', onKey);
}
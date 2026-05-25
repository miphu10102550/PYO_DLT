// ===== PYO_DLT DATA MODULE =====

const DATA = {
    STORAGE_KEY: 'pyo_dlt_devices',

    BRANDS: [
        'HP ProDesk 400 G4',
        'HP ProDesk 400 G3',
        'HP Pro Tower 400 G9',
        'Lenovo ThinkCentre neo 50t Gen 5'
    ],

    ROOMS: [
        { id: 'reg', name: 'ฝ่ายทะเบียนรถ', icon: '🚗', color: '#3b82f6' },
        { id: 'inspection', name: 'ตรวจสภาพรถ', icon: '🔍', color: '#10b981' },
        { id: 'academic', name: 'กลุ่มวิชาการ', icon: '📚', color: '#8b5cf6' },
        { id: 'admin', name: 'งานบริหาร', icon: '🏢', color: '#f59e0b' },
        { id: 'license', name: 'ฝ่ายใบอนุญาต', icon: '📋', color: '#ef4444' },
        { id: 'supply', name: 'ห้องพัสดุบริหาร', icon: '📦', color: '#6366f1' }
    ],

    STATUSES: [
        { value: 'ready', label: 'พร้อมใช้', badge: 'badge-success' },
        { value: 'pending', label: 'รอตรวจสอบ', badge: 'badge-warning' },
        { value: 'repair', label: 'ส่งซ่อม', badge: 'badge-info' },
        { value: 'broken', label: 'ชำรุด', badge: 'badge-danger' }
    ],

    CONDITIONS: [
        { value: 'new', label: 'ใหม่', badge: 'badge-new' },
        { value: 'old', label: 'เก่า', badge: 'badge-old' }
    ],

    // Return a storage key specific to the current logged-in user.
    // If no user is logged in, use an '_anon' key and behave as empty.
    getStorageKey() {
        try {
            if (typeof AUTH !== 'undefined' && AUTH.getCurrentUser()) {
                const user = AUTH.getCurrentUser();
                if (user && user.id) return `${this.STORAGE_KEY}_${user.id}`;
            }
        } catch (e) {
            // AUTH may not be loaded yet; fall through to anon
        }
        return `${this.STORAGE_KEY}_anon`;
    },

    getAll() {
        const key = this.getStorageKey();
        if (String(key).endsWith('_anon')) return [];
        return JSON.parse(localStorage.getItem(key) || '[]');
    },

    save(devices) {
        localStorage.setItem(this.getStorageKey(), JSON.stringify(devices));
    },

    getByRoom(roomId) {
        return this.getAll().filter(d => d.room === roomId);
    },

    getByUser(userId) {
        return this.getAll().filter(d => d.ownerId === userId);
    },

    add(device) {
        const devices = this.getAll();
        device.id = Date.now().toString();
        device.createdAt = new Date().toISOString();
        device.updatedAt = new Date().toISOString();
        devices.push(device);
        this.save(devices);
        return device;
    },

    update(id, updates) {
        const devices = this.getAll();
        const idx = devices.findIndex(d => d.id === id);
        if (idx === -1) return null;
        devices[idx] = {...devices[idx], ...updates, updatedAt: new Date().toISOString() };
        this.save(devices);
        return devices[idx];
    },

    delete(id) {
        const devices = this.getAll();
        const filtered = devices.filter(d => d.id !== id);
        this.save(filtered);
    },

    getById(id) {
        return this.getAll().find(d => d.id === id) || null;
    },

    getStats() {
        const all = this.getAll();
        const stats = { total: all.length, ready: 0, pending: 0, repair: 0, broken: 0 };
        all.forEach(d => { if (stats[d.status] !== undefined) stats[d.status]++; });
        const roomStats = {};
        this.ROOMS.forEach(r => { roomStats[r.id] = all.filter(d => d.room === r.id).length; });
        return {...stats, rooms: roomStats };
    },

    getStatusInfo(value) {
        return this.STATUSES.find(s => s.value === value) || { label: value, badge: 'badge-secondary' };
    },

    getConditionInfo(value) {
        return this.CONDITIONS.find(c => c.value === value) || { label: value, badge: 'badge-secondary' };
    },

    getRoomInfo(id) {
        return this.ROOMS.find(r => r.id === id) || { name: id, icon: '💻', color: '#64748b' };
    }

};
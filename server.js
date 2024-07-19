const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'WebGISHaGiang2',
    password: '26101962',
    port: 5432,
});

// Endpoint để lấy huyện có diện tích lớn nhất
app.get('/api/largest-district', async (req, res) => {
    try {
        const result = await pool.query('SELECT "NAME_2", "AREA_ACREA" FROM hagiangland ORDER BY "AREA_ACREA" DESC LIMIT 1');
        const largestDistrict = result.rows[0];
        res.json(largestDistrict);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint để lấy huyện có diện tích nhỏ nhất
app.get('/api/smallest-district', async (req, res) => {
    try {
        const result = await pool.query('SELECT "NAME_2", "AREA_ACREA" FROM hagiangland ORDER BY "AREA_ACREA" ASC LIMIT 1;');
        const smallestDistrict = result.rows[0];
        res.json(smallestDistrict);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Tạo ra thanh tìm diện tích của quận/huyện đó:
app.post('/api/find-district-area', async (req, res) => {
    const { districtName } = req.body;

    const districts = {
        "đồng văn": 1,
        "dong van": 1,
        "bắc mê": 2,
        "bac me": 2,
        "bắc quang": 3,
        "bac quang": 3,
        "hà giang": 4,
        "ha giang": 4,
        "hoàng su phì": 5,
        "hoang su phi": 5,
        "mèo vạc": 6,
        "meo vac": 6,
        "quang bình": 7,
        "quang binh": 7,
        "quản bạ": 8,
        "quan ba": 8,
        "vị xuyên": 9,
        "vi xuyen": 9,
        "xín mần": 10,
        "xin man": 10,
        "yên minh": 11,
        "yen minh": 11
    };

    const gid = districts[districtName.toLowerCase()];

    if (gid) {
        try {
            const result = await pool.query('SELECT "NAME_2", ST_Area(ST_Transform(geom, 32648)) AS district_area FROM hagiangland WHERE gid = $1;', [gid]);
            const district = result.rows[0];
            res.json(district);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.status(404).json({ error: 'District not found' });
    }
});


// Phục vụ các tài nguyên tĩnh từ thư mục public
app.use(express.static(__dirname));

// Phục vụ trang web HTML khi truy cập vào địa chỉ gốc
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'hagiangweb2.html'));
});

// Khởi động máy chủ
const port = 4000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

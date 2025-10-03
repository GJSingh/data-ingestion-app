const pool = require('./db');
const fs = require('fs').promises;
const path = require('path');

// SQL statements for creating tables
const createTablesSQL = `
-- Create consolidated_charge table
CREATE TABLE IF NOT EXISTS consolidated_charge (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create consolidated_rate table
CREATE TABLE IF NOT EXISTS consolidated_rate (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create consolidated_volume table
CREATE TABLE IF NOT EXISTS consolidated_volume (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consolidated_charge_created_at ON consolidated_charge(created_at);
CREATE INDEX IF NOT EXISTS idx_consolidated_rate_created_at ON consolidated_rate(created_at);
CREATE INDEX IF NOT EXISTS idx_consolidated_volume_created_at ON consolidated_volume(created_at);
-- Create index tables for consolidated and ingestion
CREATE TABLE IF NOT EXISTS index_consolidated_amd (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_index_consolidated_amd_created_at ON index_consolidated_amd(created_at);

CREATE TABLE IF NOT EXISTS index_consolidated_rus (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_index_consolidated_rus_created_at ON index_consolidated_rus(created_at);

CREATE TABLE IF NOT EXISTS index_ingestion_amd (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_index_ingestion_amd_created_at ON index_ingestion_amd(created_at);

CREATE TABLE IF NOT EXISTS index_ingestion_rus (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_index_ingestion_rus_created_at ON index_ingestion_rus(created_at);
-- Create ingestion_volume table
CREATE TABLE IF NOT EXISTS ingestion_volume (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ingestion_volume_created_at ON ingestion_volume(created_at);
-- Create ingestion_charge table
CREATE TABLE IF NOT EXISTS ingestion_charge (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ingestion_charge_created_at ON ingestion_charge(created_at);
-- Create ingestion_rate table
CREATE TABLE IF NOT EXISTS ingestion_rate (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ingestion_rate_created_at ON ingestion_rate(created_at);
-- Create annual_charge table
CREATE TABLE IF NOT EXISTS annual_charge (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_annual_charge_created_at ON annual_charge(created_at);

-- Create calendar_dict table
CREATE TABLE IF NOT EXISTS calendar_dict (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_calendar_dict_created_at ON calendar_dict(created_at);
`;

// Function to initialize database
async function initializeDatabase() {
    try {
        console.log('🔄 Initializing database...');
        
        // Create tables
        await pool.query(createTablesSQL);
        console.log('✅ Database tables created successfully');
        
        // Check if tables are empty and load data if needed
        await loadDataIfEmpty();
        
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        throw error;
    }
}

// Function to load data from JSON files if tables are empty
async function loadDataIfEmpty() {
    try {
        // Check if consolidated_charge table is empty
        const chargeCount = await pool.query('SELECT COUNT(*) FROM consolidated_charge');
        if (parseInt(chargeCount.rows[0].count) === 0) {
            await loadConsolidatedCharge();
        }

        // Check if consolidated_rate table is empty
        const rateCount = await pool.query('SELECT COUNT(*) FROM consolidated_rate');
        if (parseInt(rateCount.rows[0].count) === 0) {
            await loadConsolidatedRate();
        }

        // Check if consolidated_volume table is empty
        const volumeCount = await pool.query('SELECT COUNT(*) FROM consolidated_volume');
        if (parseInt(volumeCount.rows[0].count) === 0) {
            await loadConsolidatedVolume();
        }

        // New: ingestion_volume
        const ingestionVolumeCount = await pool.query('SELECT COUNT(*) FROM ingestion_volume');
        if (parseInt(ingestionVolumeCount.rows[0].count) === 0) {
            await loadIngestionVolume();
        }

        // New: ingestion_charge
        const ingestionChargeCount = await pool.query('SELECT COUNT(*) FROM ingestion_charge');
        if (parseInt(ingestionChargeCount.rows[0].count) === 0) {
            await loadIngestionCharge();
        }

        // New: ingestion_rate
        const ingestionRateCount = await pool.query('SELECT COUNT(*) FROM ingestion_rate');
        if (parseInt(ingestionRateCount.rows[0].count) === 0) {
            await loadIngestionRate();
        }

        // New: annual_charge
        const annualChargeCount = await pool.query('SELECT COUNT(*) FROM annual_charge');
        if (parseInt(annualChargeCount.rows[0].count) === 0) {
            await loadAnnualCharge();
        }

        // New: index tables
        const indexConAmdCount = await pool.query('SELECT COUNT(*) FROM index_consolidated_amd');
        if (parseInt(indexConAmdCount.rows[0].count) === 0) {
            await loadIndexConsolidatedAmd();
        }
        const indexConRusCount = await pool.query('SELECT COUNT(*) FROM index_consolidated_rus');
        if (parseInt(indexConRusCount.rows[0].count) === 0) {
            await loadIndexConsolidatedRus();
        }
        const indexIngAmdCount = await pool.query('SELECT COUNT(*) FROM index_ingestion_amd');
        if (parseInt(indexIngAmdCount.rows[0].count) === 0) {
            await loadIndexIngestionAmd();
        }
        const indexIngRusCount = await pool.query('SELECT COUNT(*) FROM index_ingestion_rus');
        if (parseInt(indexIngRusCount.rows[0].count) === 0) {
            await loadIndexIngestionRus();
        }

        // New: calendar_dict
        const calendarDictCount = await pool.query('SELECT COUNT(*) FROM calendar_dict');
        if (parseInt(calendarDictCount.rows[0].count) === 0) {
            await loadCalendarDict();
        }

        console.log('✅ Data loading completed');
    } catch (error) {
        console.error('❌ Error loading data:', error);
    }
}

// Normalize consolidated JSON rows where keys look like
// "('amd_num','','','')" or "(4, 40, 2025, 'January')"
function normalizeConsolidatedRow(raw) {
const normalized = {};
const monthly = {};

const monthIndex = {
January: '01', February: '02', March: '03', April: '04', May: '05', June: '06',
July: '07', August: '08', September: '09', October: '10', November: '11', December: '12'
};

for (const [key, value] of Object.entries(raw)) {
const simple = key.replace(/\s+/g, '');
if (simple.includes("('amd_num','','','')")) {
normalized.amd_num = value;
continue;
}
if (simple.includes("('amd_start_date','','','')")) {
normalized.amd_start_date = value;
continue;
}
if (simple.includes("('ru','','','')")) {
normalized.ru = value;
continue;
}
if (simple.includes("('ru_status','','','')")) {
normalized.ru_status = value;
continue;
}

// Match tuple-like keys: (x, y, 2025, 'January')
const match = key.match(/^\(\s*\d+\s*,\s*\d+\s*,\s*(\d{4})\s*,\s*'([A-Za-z]+)'\s*\)$/);
if (match) {
const year = match[1];
const monthName = match[2];
const mm = monthIndex[monthName];
if (mm) {
const ym = `${year}-${mm}`;
monthly[ym] = value;
}
}
}

if (Object.keys(monthly).length) {
normalized.monthly = monthly;
}

return normalized;
}

// Load Consolidated Charge data
async function loadConsolidatedCharge() {
    try {
        const inputDir = path.join(__dirname, 'input_file');
        const chargeContent = await fs.readFile(path.join(inputDir, 'consolidated_charge.json'), 'utf8');
        const chargeData = JSON.parse(chargeContent);
        
        for (const record of chargeData) {
            // New structure is already clean, no normalization needed
            await pool.query(
                'INSERT INTO consolidated_charge (data) VALUES ($1)',
                [JSON.stringify(record)]
            );
        }
        console.log(`✅ Loaded ${chargeData.length} records into consolidated_charge table`);
    } catch (error) {
        console.warn('⚠️ Could not load consolidated_charge.json:', error.message);
    }
}

// Load Consolidated Rate data
async function loadConsolidatedRate() {
    try {
        const inputDir = path.join(__dirname, 'input_file');
        const rateContent = await fs.readFile(path.join(inputDir, 'consolidated_rate.json'), 'utf8');
        const rateData = JSON.parse(rateContent);
        
        for (const record of rateData) {
            // New structure is already clean, no normalization needed
            await pool.query(
                'INSERT INTO consolidated_rate (data) VALUES ($1)',
                [JSON.stringify(record)]
            );
        }
        console.log(`✅ Loaded ${rateData.length} records into consolidated_rate table`);
    } catch (error) {
        console.warn('⚠️ Could not load consolidated_rate.json:', error.message);
    }
}

// Load Consolidated Volume data
async function loadConsolidatedVolume() {
    try {
        const inputDir = path.join(__dirname, 'input_file');
        const volumeContent = await fs.readFile(path.join(inputDir, 'consolidated_volume.json'), 'utf8');
        const volumeData = JSON.parse(volumeContent);
        
        for (const record of volumeData) {
            // New structure is already clean, no normalization needed
            await pool.query(
                'INSERT INTO consolidated_volume (data) VALUES ($1)',
                [JSON.stringify(record)]
            );
        }
        console.log(`✅ Loaded ${volumeData.length} records into consolidated_volume table`);
    } catch (error) {
        console.warn('⚠️ Could not load consolidated_volume.json:', error.message);
    }
}

// Load Ingestion Volume data
async function loadIngestionVolume() {
    try {
        const inputDir = path.join(__dirname, 'input_file');
        const content = await fs.readFile(path.join(inputDir, 'ingestion_volume.json'), 'utf8');
        const rows = JSON.parse(content);
        for (const record of rows) {
            await pool.query('INSERT INTO ingestion_volume (data) VALUES ($1)', [JSON.stringify(record)]);
        }
        console.log(`✅ Loaded ${rows.length} records into ingestion_volume table`);
    } catch (error) {
        console.warn('⚠️ Could not load ingestion_volume.json:', error.message);
    }
}

// Load Ingestion Charge data
async function loadIngestionCharge() {
    try {
        const inputDir = path.join(__dirname, 'input_file');
        const content = await fs.readFile(path.join(inputDir, 'ingestion_charge.json'), 'utf8');
        const rows = JSON.parse(content);
        for (const record of rows) {
            await pool.query('INSERT INTO ingestion_charge (data) VALUES ($1)', [JSON.stringify(record)]);
        }
        console.log(`✅ Loaded ${rows.length} records into ingestion_charge table`);
    } catch (error) {
        console.warn('⚠️ Could not load ingestion_charge.json:', error.message);
    }
}

// Load Ingestion Rate data
async function loadIngestionRate() {
    try {
        const inputDir = path.join(__dirname, 'input_file');
        const content = await fs.readFile(path.join(inputDir, 'ingestion_rate.json'), 'utf8');
        const rows = JSON.parse(content);
        for (const record of rows) {
            await pool.query('INSERT INTO ingestion_rate (data) VALUES ($1)', [JSON.stringify(record)]);
        }
        console.log(`✅ Loaded ${rows.length} records into ingestion_rate table`);
    } catch (error) {
        console.warn('⚠️ Could not load ingestion_rate.json:', error.message);
    }
}

// Load Annual Charge data
async function loadAnnualCharge() {
    try {
        const inputDir = path.join(__dirname, 'input_file');
        const content = await fs.readFile(path.join(inputDir, 'annual_charge.json'), 'utf8');
        const rows = JSON.parse(content);
        for (const record of rows) {
            await pool.query('INSERT INTO annual_charge (data) VALUES ($1)', [JSON.stringify(record)]);
        }
        console.log(`✅ Loaded ${rows.length} records into annual_charge table`);
    } catch (error) {
        console.warn('⚠️ Could not load annual_charge.json:', error.message);
    }
}

// Load Index: Consolidated AMD
async function loadIndexConsolidatedAmd() {
    try {
        const inputDir = path.join(__dirname, 'input_file');
        const content = await fs.readFile(path.join(inputDir, 'index_consolidated_amd.json'), 'utf8');
        const rows = JSON.parse(content);
        for (const record of rows) {
            await pool.query('INSERT INTO index_consolidated_amd (data) VALUES ($1)', [JSON.stringify(record)]);
        }
        console.log(`✅ Loaded ${rows.length} records into index_consolidated_amd table`);
    } catch (error) {
        console.warn('⚠️ Could not load index_consolidated_amd.json:', error.message);
    }
}

// Load Index: Consolidated RUS
async function loadIndexConsolidatedRus() {
    try {
        const inputDir = path.join(__dirname, 'input_file');
        const content = await fs.readFile(path.join(inputDir, 'index_consolidated_rus.json'), 'utf8');
        const rows = JSON.parse(content);
        for (const record of rows) {
            await pool.query('INSERT INTO index_consolidated_rus (data) VALUES ($1)', [JSON.stringify(record)]);
        }
        console.log(`✅ Loaded ${rows.length} records into index_consolidated_rus table`);
    } catch (error) {
        console.warn('⚠️ Could not load index_consolidated_rus.json:', error.message);
    }
}

// Load Index: Ingestion AMD
async function loadIndexIngestionAmd() {
    try {
        const inputDir = path.join(__dirname, 'input_file');
        const content = await fs.readFile(path.join(inputDir, 'index_ingestion_amd.json'), 'utf8');
        const rows = JSON.parse(content);
        for (const record of rows) {
            await pool.query('INSERT INTO index_ingestion_amd (data) VALUES ($1)', [JSON.stringify(record)]);
        }
        console.log(`✅ Loaded ${rows.length} records into index_ingestion_amd table`);
    } catch (error) {
        console.warn('⚠️ Could not load index_ingestion_amd.json:', error.message);
    }
}

// Load Index: Ingestion RUS
async function loadIndexIngestionRus() {
    try {
        const inputDir = path.join(__dirname, 'input_file');
        const content = await fs.readFile(path.join(inputDir, 'index_ingestion_rus.json'), 'utf8');
        const rows = JSON.parse(content);
        for (const record of rows) {
            await pool.query('INSERT INTO index_ingestion_rus (data) VALUES ($1)', [JSON.stringify(record)]);
        }
        console.log(`✅ Loaded ${rows.length} records into index_ingestion_rus table`);
    } catch (error) {
        console.warn('⚠️ Could not load index_ingestion_rus.json:', error.message);
    }
}

// Load Calendar Dict data
async function loadCalendarDict() {
    try {
        const inputDir = path.join(__dirname, 'input_file');
        const content = await fs.readFile(path.join(inputDir, 'calendar_dict.json'), 'utf8');
        const rows = JSON.parse(content);
        for (const record of rows) {
            await pool.query('INSERT INTO calendar_dict (data) VALUES ($1)', [JSON.stringify(record)]);
        }
        console.log(`✅ Loaded ${rows.length} records into calendar_dict table`);
    } catch (error) {
        console.warn('⚠️ Could not load calendar_dict.json:', error.message);
    }
}

// Function to get all records from a table
async function getAllRecords(tableName) {
    try {
        const result = await pool.query(`SELECT * FROM ${tableName} ORDER BY created_at DESC`);
        return result.rows;
    } catch (error) {
        console.error(`❌ Error fetching records from ${tableName}:`, error);
        throw error;
    }
}

// Function to get record count
async function getRecordCount(tableName) {
    try {
        const result = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
        return parseInt(result.rows[0].count);
    } catch (error) {
        console.error(`❌ Error getting count from ${tableName}:`, error);
        throw error;
    }
}

// Function to search records
async function searchRecords(tableName, searchTerm) {
    try {
        const result = await pool.query(
            `SELECT * FROM ${tableName} WHERE data::text ILIKE $1 ORDER BY created_at DESC`,
            [`%${searchTerm}%`]
        );
        return result.rows;
    } catch (error) {
        console.error(`❌ Error searching records in ${tableName}:`, error);
        throw error;
    }
}

// Build filtered query against JSONB data + timestamps
function buildFilterQuery(tableName, filters, pagination) {
    const where = [];
    const values = [];
    let i = 1;

    if (filters.amd_num !== undefined) {
        where.push(`(data->>'amd_num')::text ILIKE $${i++}`);
        values.push(`%${filters.amd_num}%`);
    }
    if (filters.ru) {
        // Handle multiple values for ru parameter
        if (Array.isArray(filters.ru)) {
            const ruConditions = [];
            for (const ruValue of filters.ru) {
                ruConditions.push(`(data->>'ru') ILIKE $${i++}`);
                values.push(`%${ruValue}%`);
            }
            where.push(`(${ruConditions.join(' OR ')})`);
        } else {
            where.push(`(data->>'ru') ILIKE $${i++}`);
            values.push(`%${filters.ru}%`);
        }
    }
    if (filters.ru_status) {
        // Handle multiple values for ru_status parameter
        if (Array.isArray(filters.ru_status)) {
            const ruStatusConditions = [];
            for (const statusValue of filters.ru_status) {
                ruStatusConditions.push(`(data->>'ru_status') ILIKE $${i++}`);
                values.push(`%${statusValue}%`);
            }
            where.push(`(${ruStatusConditions.join(' OR ')})`);
        } else {
            where.push(`(data->>'ru_status') ILIKE $${i++}`);
            values.push(`%${filters.ru_status}%`);
        }
    }
    if (filters.ru_service_cat) {
        // Handle multiple values for ru_service_cat parameter
        if (Array.isArray(filters.ru_service_cat)) {
            const ruServiceCatConditions = [];
            for (const serviceCatValue of filters.ru_service_cat) {
                ruServiceCatConditions.push(`(data->>'ru_service_cat') ILIKE $${i++}`);
                values.push(`%${serviceCatValue}%`);
            }
            where.push(`(${ruServiceCatConditions.join(' OR ')})`);
        } else {
            where.push(`(data->>'ru_service_cat') ILIKE $${i++}`);
            values.push(`%${filters.ru_service_cat}%`);
        }
    }
    if (filters.contract_month !== undefined) {
        where.push(`(data->>'contract_month')::numeric = $${i++}`);
        values.push(filters.contract_month);
    }
    if (filters.contract_year !== undefined) {
        where.push(`(data->>'contract_year')::numeric = $${i++}`);
        values.push(filters.contract_year);
    }
    if (filters.calendar_month) {
        // Handle multiple values for calendar_month parameter
        if (Array.isArray(filters.calendar_month)) {
            const calendarMonthConditions = [];
            for (const monthValue of filters.calendar_month) {
                calendarMonthConditions.push(`(data->>'calendar_month') ILIKE $${i++}`);
                values.push(`%${monthValue}%`);
            }
            where.push(`(${calendarMonthConditions.join(' OR ')})`);
        } else {
            where.push(`(data->>'calendar_month') ILIKE $${i++}`);
            values.push(`%${filters.calendar_month}%`);
        }
    }
    if (filters.calendar_year !== undefined) {
        where.push(`(data->>'calendar_year')::numeric = $${i++}`);
        values.push(filters.calendar_year);
    }
    if (filters.created_from) {
        where.push(`created_at >= $${i++}`);
        values.push(filters.created_from);
    }
    if (filters.created_to) {
        where.push(`created_at <= $${i++}`);
        values.push(filters.created_to);
    }
    if (filters.updated_from) {
        where.push(`updated_at >= $${i++}`);
        values.push(filters.updated_from);
    }
    if (filters.updated_to) {
        where.push(`updated_at <= $${i++}`);
        values.push(filters.updated_to);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const limit = Math.min(Math.max(parseInt(pagination.limit || 100, 10), 1), 1000);
    const offset = Math.max(parseInt(pagination.offset || 0, 10), 0);
    const orderBy = pagination.order_by === 'created_at' || pagination.order_by === 'updated_at' ? pagination.order_by : 'created_at';
    const orderDir = pagination.order_dir && pagination.order_dir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const countSql = `SELECT COUNT(*) FROM ${tableName} ${whereSql}`;
    const dataSql = `SELECT * FROM ${tableName} ${whereSql} ORDER BY ${orderBy} ${orderDir} LIMIT ${limit} OFFSET ${offset}`;

    return { countSql, dataSql, values };
}

async function queryWithFilters(tableName, filters = {}, pagination = {}) {
    const { countSql, dataSql, values } = buildFilterQuery(tableName, filters, pagination);
    const countRes = await pool.query(countSql, values);
    const dataRes = await pool.query(dataSql, values);
    return { count: parseInt(countRes.rows[0].count), rows: dataRes.rows };
}

module.exports = {
    pool,
    initializeDatabase,
    getAllRecords,
    getRecordCount,
    searchRecords,
    queryWithFilters
};

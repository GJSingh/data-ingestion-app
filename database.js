const pool = require('./db');
const fs = require('fs').promises;
const path = require('path');

// SQL statements for creating tables
const createTablesSQL = `
-- Create amd_final table
CREATE TABLE IF NOT EXISTS amd_final (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create data_final table
CREATE TABLE IF NOT EXISTS data_final (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ru_final table
CREATE TABLE IF NOT EXISTS ru_final (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_amd_final_created_at ON amd_final(created_at);
CREATE INDEX IF NOT EXISTS idx_data_final_created_at ON data_final(created_at);
CREATE INDEX IF NOT EXISTS idx_ru_final_created_at ON ru_final(created_at);
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
        // Check if amd_final table is empty
        const amdCount = await pool.query('SELECT COUNT(*) FROM amd_final');
        if (parseInt(amdCount.rows[0].count) === 0) {
            await loadAmdData();
        }

        // Check if data_final table is empty
        const dataCount = await pool.query('SELECT COUNT(*) FROM data_final');
        if (parseInt(dataCount.rows[0].count) === 0) {
            await loadDataFinal();
        }

        // Check if ru_final table is empty
        const ruCount = await pool.query('SELECT COUNT(*) FROM ru_final');
        if (parseInt(ruCount.rows[0].count) === 0) {
            await loadRuData();
        }

        console.log('✅ Data loading completed');
    } catch (error) {
        console.error('❌ Error loading data:', error);
    }
}

// Load AMD data
async function loadAmdData() {
    try {
        const inputDir = path.join(__dirname, 'input_file');
        const amdContent = await fs.readFile(path.join(inputDir, 'amd_final.json'), 'utf8');
        const amdData = JSON.parse(amdContent);
        
        for (const record of amdData) {
            await pool.query(
                'INSERT INTO amd_final (data) VALUES ($1)',
                [JSON.stringify(record)]
            );
        }
        console.log(`✅ Loaded ${amdData.length} records into amd_final table`);
    } catch (error) {
        console.warn('⚠️ Could not load amd_final.json:', error.message);
    }
}

// Load Data Final
async function loadDataFinal() {
    try {
        const inputDir = path.join(__dirname, 'input_file');
        const dataContent = await fs.readFile(path.join(inputDir, 'data_final.json'), 'utf8');
        const dataFinal = JSON.parse(dataContent);
        
        for (const record of dataFinal) {
            await pool.query(
                'INSERT INTO data_final (data) VALUES ($1)',
                [JSON.stringify(record)]
            );
        }
        console.log(`✅ Loaded ${dataFinal.length} records into data_final table`);
    } catch (error) {
        console.warn('⚠️ Could not load data_final.json:', error.message);
    }
}

// Load RU data
async function loadRuData() {
    try {
        const inputDir = path.join(__dirname, 'input_file');
        const ruContent = await fs.readFile(path.join(inputDir, 'ru_final.json'), 'utf8');
        const ruData = ruContent.trim() ? JSON.parse(ruContent) : [];
        
        for (const record of ruData) {
            await pool.query(
                'INSERT INTO ru_final (data) VALUES ($1)',
                [JSON.stringify(record)]
            );
        }
        console.log(`✅ Loaded ${ruData.length} records into ru_final table`);
    } catch (error) {
        console.warn('⚠️ Could not load ru_final.json:', error.message);
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

module.exports = {
    pool,
    initializeDatabase,
    getAllRecords,
    getRecordCount,
    searchRecords
};

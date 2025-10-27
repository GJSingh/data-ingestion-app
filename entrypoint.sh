#!/bin/sh
set -e

echo "🐍 Running Python executable to generate input files..."

# Run Python executable if it exists (try both with and without .exe extension)
if [ -f "/app/python.exe" ]; then
    python3 /app/python.exe
    echo "✅ Python executable (python.exe) completed successfully"
elif [ -f "/app/python" ] && [ -x "/app/python" ]; then
    /app/python
    echo "✅ Python executable completed successfully"
elif [ -f "/app/process_data.py" ]; then
    python3 /app/process_data.py
    echo "✅ Python script completed successfully"
else
    echo "⚠️  Warning: python.exe, python, or process_data.py not found, skipping Python execution"
fi

echo "🚀 Starting Node.js application..."

# Execute the main command (npm start)
exec "$@"


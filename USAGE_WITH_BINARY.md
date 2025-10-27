# Using Python Binary Executable Instead of process_data.py

## Overview

If you have a **Python executable binary** (like `python.exe` or a compiled Python script), you can use it instead of `process_data.py`.

## Important Notes

### ⚠️ Platform Compatibility

- **Linux containers** don't use `.exe` extension
- A Python executable compiled on Windows might not work on Linux/Alpine
- If you have a **Python source file**, use `process_data.py` approach
- If you have a **compiled binary** (e.g., from PyInstaller, Nuitka, py2exe), ensure it's compiled for Linux

## Setup Options

### Option 1: Use `python.exe` (If already in project folder)

Simply place your `python.exe` file in the project root:

```
my-data-ingest-app/
├── python.exe          ← Your Python executable here
├── input_file/
└── ...
```

The entrypoint script will automatically detect and run it.

### Option 2: Rename to generic name

If you have `python.exe`, you can rename it to `python` (without extension):

```bash
# In your project folder
mv python.exe python
```

Then ensure it has execute permissions:
```bash
chmod +x python
```

### Option 3: Use the sample `process_data.py`

The simplest approach is to replace the sample code in `process_data.py` with your logic.

## What the Code Does

The updated `entrypoint.sh` now handles **three scenarios**:

1. **`python.exe`** - Runs with `python3 python.exe`
2. **`python`** (executable) - Runs directly as executable
3. **`process_data.py`** (source file) - Runs with `python3 process_data.py`

Priority order: `python.exe` → `python` → `process_data.py`

## Binary Compilation (If Needed)

If you need to compile Python to a binary:

### Using PyInstaller

```bash
# Install PyInstaller
pip install pyinstaller

# Compile your script
pyinstaller --onefile your_script.py

# Output: dist/your_script (Linux binary)
# Copy this to your project as "python"
cp dist/your_script ./python
chmod +x python
```

### Using Nuitka

```bash
# Install Nuitka
pip install nuitka

# Compile
python -m nuitka --onefile your_script.py

# Output will be in project folder
```

## Testing

1. **Place your executable** in the project root
2. **Rebuild the Docker image**:
   ```bash
   podman-compose build
   ```
3. **Run and check logs**:
   ```bash
   podman-compose up -d
   podman logs data_ingest_app
   ```

Look for these messages:
- `🐍 Running Python executable to generate input files...`
- `✅ Python executable completed successfully`

## Troubleshooting

### "Executable not found"

- Check the file exists in the project root
- Verify `.dockerignore` doesn't exclude it
- Rebuild the image: `podman-compose build --no-cache`

### "Permission denied"

- The Dockerfile now sets execute permissions automatically
- If still an issue, ensure your file has execute bit set

### Binary doesn't run on Linux

- You need a Linux-compatible binary
- Consider using `process_data.py` approach instead
- Or compile your Python script on/for Linux

## Recommendation

**For most users**: Use the `process_data.py` approach as it's the simplest and most portable. Just edit the Python source code with your logic.

<｜place▁holder▁no▁247｜>If you have a pre-compiled Windows binary (`.exe`), you'll need to either:
1. Get a Linux version of the binary
2. Use the Python source code instead
3. Recompile the binary for Linux (Alpine in this case)

